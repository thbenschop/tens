package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/require"
)

// waitForType reads messages until desired type or timeout
func waitForType(t *testing.T, conn *websocket.Conn, wanted string) map[string]interface{} {
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		_ = conn.SetReadDeadline(time.Now().Add(3 * time.Second))
		_, msg, err := conn.ReadMessage()
		require.NoError(t, err)
		var resp map[string]interface{}
		require.NoError(t, json.Unmarshal(msg, &resp))
		if resp["type"] == wanted {
			return resp
		}
	}
	t.Fatalf("did not receive message type %s", wanted)
	return nil
}

func TestHandlePlayCardsBroadcastsUpdate(t *testing.T) {
	handler := NewRoomHandler()
	server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
	defer server.Close()

	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Host creates room
	hostConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer hostConn.Close()
	_, _, _ = hostConn.ReadMessage() // welcome

	createMsg := map[string]interface{}{"type": "CREATE_ROOM", "playerName": "Host"}
	require.NoError(t, hostConn.WriteJSON(createMsg))
	_, msg, err := hostConn.ReadMessage()
	require.NoError(t, err)
	var createResp map[string]interface{}
	require.NoError(t, json.Unmarshal(msg, &createResp))
	roomCode := createResp["roomCode"].(string)
	hostID := createResp["playerId"].(string)

	// Player2 joins
	p2Conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer p2Conn.Close()
	_, _, _ = p2Conn.ReadMessage() // welcome
	joinMsg := map[string]interface{}{"type": "JOIN_ROOM", "roomCode": roomCode, "playerName": "Player2"}
	require.NoError(t, p2Conn.WriteJSON(joinMsg))
	_, _, _ = p2Conn.ReadMessage()   // join response
	_, _, _ = hostConn.ReadMessage() // PLAYER_JOINED

	// Player3 joins
	p3Conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	require.NoError(t, err)
	defer p3Conn.Close()
	_, _, _ = p3Conn.ReadMessage() // welcome
	joinMsg3 := map[string]interface{}{"type": "JOIN_ROOM", "roomCode": roomCode, "playerName": "Player3"}
	require.NoError(t, p3Conn.WriteJSON(joinMsg3))
	_, _, _ = p3Conn.ReadMessage()   // join response
	_, _, _ = hostConn.ReadMessage() // PLAYER_JOINED
	_, _, _ = p2Conn.ReadMessage()   // PLAYER_JOINED

	// Host starts game
	startMsg := map[string]interface{}{"type": "START_GAME", "roomCode": roomCode, "playerId": hostID}
	require.NoError(t, hostConn.WriteJSON(startMsg))

	// Host receives GAME_STARTED with game payload
	started := waitForType(t, hostConn, "GAME_STARTED")
	gamePayload := started["game"].(map[string]interface{})
	players := gamePayload["players"].([]interface{})
	require.NotZero(t, len(players))
	hostPlayer := players[0].(map[string]interface{})
	hand := hostPlayer["hand"].([]interface{})
	require.NotZero(t, len(hand))
	firstCard := hand[0].(map[string]interface{})["id"].(string)

	// Play first card
	playMsg := map[string]interface{}{"type": "PLAY_CARDS", "cardIds": []string{firstCard}}
	require.NoError(t, hostConn.WriteJSON(playMsg))

	// Expect GAME_UPDATE
	update := waitForType(t, hostConn, "GAME_UPDATE")
	game := update["game"].(map[string]interface{})
	center := game["centerPile"].([]interface{})
	require.NotZero(t, len(center))
	// card should have moved to center pile
	found := false
	for _, c := range center {
		if c.(map[string]interface{})["id"] == firstCard {
			found = true
			break
		}
	}
	require.True(t, found, "played card should be in center pile")
}
