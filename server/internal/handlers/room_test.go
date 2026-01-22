package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRoomHandlers(t *testing.T) {
	t.Run("CREATE_ROOM should create a room and return room code", func(t *testing.T) {
		handler := NewRoomHandler()
		server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
		defer server.Close()

		// Connect to WebSocket
		wsURL := "ws" + strings.TrimPrefix(server.URL, "http")
		conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn.Close()

		// Read welcome message
		_, _, err = conn.ReadMessage()
		require.NoError(t, err)

		// Send CREATE_ROOM message
		createMsg := map[string]interface{}{
			"type":       "CREATE_ROOM",
			"playerName": "TestPlayer",
		}
		err = conn.WriteJSON(createMsg)
		require.NoError(t, err)

		// Read response
		_, msg, err := conn.ReadMessage()
		require.NoError(t, err)

		var response map[string]interface{}
		err = json.Unmarshal(msg, &response)
		require.NoError(t, err)

		assert.Equal(t, "ROOM_CREATED", response["type"])
		assert.NotEmpty(t, response["roomCode"])
		assert.NotEmpty(t, response["playerId"])
		assert.NotNil(t, response["room"])
	})

	t.Run("JOIN_ROOM should add player to existing room", func(t *testing.T) {
		handler := NewRoomHandler()
		server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
		defer server.Close()

		wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

		// Create room with first connection
		conn1, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn1.Close()
		_, _, _ = conn1.ReadMessage() // welcome message

		createMsg := map[string]interface{}{
			"type":       "CREATE_ROOM",
			"playerName": "Host",
		}
		err = conn1.WriteJSON(createMsg)
		require.NoError(t, err)

		_, msg, err := conn1.ReadMessage()
		require.NoError(t, err)

		var createResponse map[string]interface{}
		err = json.Unmarshal(msg, &createResponse)
		require.NoError(t, err)
		roomCode := createResponse["roomCode"].(string)

		// Join room with second connection
		conn2, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn2.Close()
		_, _, _ = conn2.ReadMessage() // welcome message

		joinMsg := map[string]interface{}{
			"type":       "JOIN_ROOM",
			"roomCode":   roomCode,
			"playerName": "Player2",
		}
		err = conn2.WriteJSON(joinMsg)
		require.NoError(t, err)

		// Read join response
		_, msg, err = conn2.ReadMessage()
		require.NoError(t, err)

		var joinResponse map[string]interface{}
		err = json.Unmarshal(msg, &joinResponse)
		require.NoError(t, err)

		assert.Equal(t, "ROOM_JOINED", joinResponse["type"])
		assert.NotEmpty(t, joinResponse["playerId"])
		assert.NotNil(t, joinResponse["room"])

		// First connection should also receive PLAYER_JOINED broadcast
		conn1.SetReadDeadline(time.Now().Add(2 * time.Second))
		_, msg, err = conn1.ReadMessage()
		require.NoError(t, err)

		var broadcastMsg map[string]interface{}
		err = json.Unmarshal(msg, &broadcastMsg)
		require.NoError(t, err)
		assert.Equal(t, "PLAYER_JOINED", broadcastMsg["type"])
	})

	t.Run("JOIN_ROOM should reject invalid room code", func(t *testing.T) {
		handler := NewRoomHandler()
		server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
		defer server.Close()

		wsURL := "ws" + strings.TrimPrefix(server.URL, "http")
		conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn.Close()
		_, _, _ = conn.ReadMessage() // welcome message

		joinMsg := map[string]interface{}{
			"type":       "JOIN_ROOM",
			"roomCode":   "INVALID",
			"playerName": "Player",
		}
		err = conn.WriteJSON(joinMsg)
		require.NoError(t, err)

		_, msg, err := conn.ReadMessage()
		require.NoError(t, err)

		var response map[string]interface{}
		err = json.Unmarshal(msg, &response)
		require.NoError(t, err)

		assert.Equal(t, "ERROR", response["type"])
		assert.Contains(t, response["message"], "not found")
	})

	t.Run("LEAVE_ROOM should remove player and broadcast", func(t *testing.T) {
		handler := NewRoomHandler()
		server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
		defer server.Close()

		wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

		// Create room
		conn1, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn1.Close()
		_, _, _ = conn1.ReadMessage() // welcome message

		createMsg := map[string]interface{}{
			"type":       "CREATE_ROOM",
			"playerName": "Host",
		}
		err = conn1.WriteJSON(createMsg)
		require.NoError(t, err)

		_, msg, err := conn1.ReadMessage()
		require.NoError(t, err)

		var createResponse map[string]interface{}
		err = json.Unmarshal(msg, &createResponse)
		require.NoError(t, err)
		roomCode := createResponse["roomCode"].(string)

		// Join with second player
		conn2, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn2.Close()
		_, _, _ = conn2.ReadMessage() // welcome message

		joinMsg := map[string]interface{}{
			"type":       "JOIN_ROOM",
			"roomCode":   roomCode,
			"playerName": "Player2",
		}
		err = conn2.WriteJSON(joinMsg)
		require.NoError(t, err)

		_, msg, err = conn2.ReadMessage()
		require.NoError(t, err)

		var joinResponse map[string]interface{}
		err = json.Unmarshal(msg, &joinResponse)
		require.NoError(t, err)
		playerID := joinResponse["playerId"].(string)

		// Read PLAYER_JOINED broadcast on conn1
		_, _, _ = conn1.ReadMessage()

		// Send LEAVE_ROOM
		leaveMsg := map[string]interface{}{
			"type":     "LEAVE_ROOM",
			"roomCode": roomCode,
			"playerId": playerID,
		}
		err = conn2.WriteJSON(leaveMsg)
		require.NoError(t, err)

		// First connection should receive PLAYER_LEFT broadcast
		conn1.SetReadDeadline(time.Now().Add(2 * time.Second))
		_, msg, err = conn1.ReadMessage()
		require.NoError(t, err)

		var broadcastMsg map[string]interface{}
		err = json.Unmarshal(msg, &broadcastMsg)
		require.NoError(t, err)
		assert.Equal(t, "PLAYER_LEFT", broadcastMsg["type"])
	})

	t.Run("START_GAME should only work for host", func(t *testing.T) {
		handler := NewRoomHandler()
		server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
		defer server.Close()

		wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

		// Create room
		conn1, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn1.Close()
		_, _, _ = conn1.ReadMessage() // welcome message

		createMsg := map[string]interface{}{
			"type":       "CREATE_ROOM",
			"playerName": "Host",
		}
		err = conn1.WriteJSON(createMsg)
		require.NoError(t, err)

		_, msg, err := conn1.ReadMessage()
		require.NoError(t, err)

		var createResponse map[string]interface{}
		err = json.Unmarshal(msg, &createResponse)
		require.NoError(t, err)
		roomCode := createResponse["roomCode"].(string)
		hostID := createResponse["playerId"].(string)

		// Join with second player
		conn2, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn2.Close()
		_, _, _ = conn2.ReadMessage() // welcome message

		joinMsg := map[string]interface{}{
			"type":       "JOIN_ROOM",
			"roomCode":   roomCode,
			"playerName": "Player2",
		}
		err = conn2.WriteJSON(joinMsg)
		require.NoError(t, err)

		_, msg, err = conn2.ReadMessage()
		require.NoError(t, err)

		var joinResponse map[string]interface{}
		err = json.Unmarshal(msg, &joinResponse)
		require.NoError(t, err)
		nonHostID := joinResponse["playerId"].(string)

		// Read PLAYER_JOINED on conn1
		_, _, _ = conn1.ReadMessage()

		// Join with third player (need min 3 players)
		conn3, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
		require.NoError(t, err)
		defer conn3.Close()
		_, _, _ = conn3.ReadMessage() // welcome message

		joinMsg3 := map[string]interface{}{
			"type":       "JOIN_ROOM",
			"roomCode":   roomCode,
			"playerName": "Player3",
		}
		err = conn3.WriteJSON(joinMsg3)
		require.NoError(t, err)
		_, _, _ = conn3.ReadMessage() // join response
		_, _, _ = conn1.ReadMessage() // PLAYER_JOINED broadcast
		_, _, _ = conn2.ReadMessage() // PLAYER_JOINED broadcast

		// Non-host tries to start game - should fail
		startMsg := map[string]interface{}{
			"type":     "START_GAME",
			"roomCode": roomCode,
			"playerId": nonHostID,
		}
		err = conn2.WriteJSON(startMsg)
		require.NoError(t, err)

		_, msg, err = conn2.ReadMessage()
		require.NoError(t, err)

		var errorResponse map[string]interface{}
		err = json.Unmarshal(msg, &errorResponse)
		require.NoError(t, err)
		assert.Equal(t, "ERROR", errorResponse["type"])
		assert.Contains(t, errorResponse["message"], "host")

		// Host starts game - should succeed
		startMsg["playerId"] = hostID
		err = conn1.WriteJSON(startMsg)
		require.NoError(t, err)

		_, msg, err = conn1.ReadMessage()
		require.NoError(t, err)

		var startResponse map[string]interface{}
		err = json.Unmarshal(msg, &startResponse)
		require.NoError(t, err)
		assert.Equal(t, "GAME_STARTED", startResponse["type"])
	})
}
