package handlers

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		env := os.Getenv("ENV")
		
		// Allow all origins in development
		if env == "development" || env == "" {
			return true
		}
		
		// In production, check against allowed origins
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			return false
		}
		
		origin := r.Header.Get("Origin")
		origins := strings.Split(allowedOrigins, ",")
		for _, allowed := range origins {
			if strings.TrimSpace(allowed) == origin {
				return true
			}
		}
		
		return false
	},
}

// WebSocketHandler handles WebSocket connections
type WebSocketHandler struct {
	connections map[*websocket.Conn]bool
}

// NewWebSocketHandler creates a new WebSocket handler
func NewWebSocketHandler() *WebSocketHandler {
	return &WebSocketHandler{
		connections: make(map[*websocket.Conn]bool),
	}
}

// HandleWebSocket upgrades HTTP connection to WebSocket
func (h *WebSocketHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	// Upgrade connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Add connection to active connections
	h.connections[conn] = true

	// Send welcome message
	err = conn.WriteMessage(websocket.TextMessage, []byte(`{"type":"connected","message":"Successfully connected to server"}`))
	if err != nil {
		log.Printf("Failed to send welcome message: %v", err)
		conn.Close()
		delete(h.connections, conn)
		return
	}

	// Handle disconnection
	defer func() {
		conn.Close()
		delete(h.connections, conn)
		log.Printf("Client disconnected")
	}()

	// Keep connection alive and listen for messages
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Read error: %v", err)
			break
		}
	}
}
