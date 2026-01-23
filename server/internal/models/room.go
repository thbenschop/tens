package models

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Player represents a player in a room
type Player struct {
	ID             string          `json:"id"`
	Name           string          `json:"name"`
	Connection     *websocket.Conn `json:"-"`
	JoinedAt       time.Time       `json:"joinedAt"`
	Hand           []*Card         `json:"hand"`
	TableCardsUp   []*Card         `json:"tableCardsUp"`
	TableCardsDown []*Card         `json:"tableCardsDown"`
	RoundScore     int             `json:"roundScore"` // Points for current round
	TotalScore     int             `json:"totalScore"` // Cumulative score across all rounds
}

// Room represents a game room
type Room struct {
	ID        string
	Code      string             `json:"code"`
	HostID    string             `json:"hostId"`
	Players   map[string]*Player `json:"players"`
	Clients   map[*websocket.Conn]bool
	CreatedAt time.Time `json:"createdAt"`
	mu        sync.RWMutex
}

// NewRoom creates a new room with the given ID and code
func NewRoom(id, code, hostID string) *Room {
	return &Room{
		ID:        id,
		Code:      code,
		HostID:    hostID,
		Players:   make(map[string]*Player),
		Clients:   make(map[*websocket.Conn]bool),
		CreatedAt: time.Now(),
	}
}

// AddPlayer adds a player to the room
func (r *Room) AddPlayer(player *Player) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.Players[player.ID] = player
}

// RemovePlayer removes a player from the room
func (r *Room) RemovePlayer(playerID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.Players, playerID)
}

// GetPlayer gets a player by ID
func (r *Room) GetPlayer(playerID string) (*Player, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	player, ok := r.Players[playerID]
	return player, ok
}

// GetPlayerCount returns the number of players in the room
func (r *Room) GetPlayerCount() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.Players)
}

// HasPlayerWithName checks if a player with the given name exists in the room
func (r *Room) HasPlayerWithName(name string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, player := range r.Players {
		if player.Name == name {
			return true
		}
	}
	return false
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
