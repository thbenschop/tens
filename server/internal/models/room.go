package models

import (
	"sync"

	"github.com/gorilla/websocket"
)

// Room represents a game room
type Room struct {
	ID      string
	Clients map[*websocket.Conn]bool
	mu      sync.RWMutex
}

// NewRoom creates a new room with the given ID
func NewRoom(id string) *Room {
	return &Room{
		ID:      id,
		Clients: make(map[*websocket.Conn]bool),
	}
}

// AddClient adds a client connection to the room
func (r *Room) AddClient(conn *websocket.Conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Clients[conn] = true
}

// RemoveClient removes a client connection from the room
func (r *Room) RemoveClient(conn *websocket.Conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.Clients, conn)
}

// GetClientCount returns the number of clients in the room
func (r *Room) GetClientCount() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Clients)
}
