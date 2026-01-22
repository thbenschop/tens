package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
)

func TestWebSocketConnection(t *testing.T) {
	// Create test server
	handler := NewWebSocketHandler()
	server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
	defer server.Close()

	// Convert http:// to ws://
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Connect to WebSocket
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	assert.NoError(t, err, "Should connect to WebSocket server")
	assert.NotNil(t, conn, "Connection should not be nil")

	if conn != nil {
		defer conn.Close()

		// Test that connection is established and can receive a welcome message
		conn.SetReadDeadline(time.Now().Add(5 * time.Second))
		_, message, err := conn.ReadMessage()
		assert.NoError(t, err, "Should receive message from server")
		assert.Contains(t, string(message), "connected", "Should receive welcome message")
	}
}

func TestWebSocketMultipleConnections(t *testing.T) {
	// Create test server
	handler := NewWebSocketHandler()
	server := httptest.NewServer(http.HandlerFunc(handler.HandleWebSocket))
	defer server.Close()

	// Convert http:// to ws://
	wsURL := "ws" + strings.TrimPrefix(server.URL, "http")

	// Connect multiple clients
	conn1, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	assert.NoError(t, err, "First client should connect")
	defer conn1.Close()

	conn2, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	assert.NoError(t, err, "Second client should connect")
	defer conn2.Close()

	// Both connections should be active
	assert.NotNil(t, conn1)
	assert.NotNil(t, conn2)
}
