package models

import (
	"sync"
	"time"
)

// Game represents a game instance with all its state
type Game struct {
	ID                 string    `json:"id"`
	RoomCode           string    `json:"roomCode"`
	Players            []*Player `json:"players"`
	DiscardPile        []*Card   `json:"discardPile"`
	CenterPile         []*Card   `json:"centerPile"`
	CurrentPlayerIndex int       `json:"currentPlayerIndex"`
	DealerIndex        int       `json:"dealerIndex"`
	Round              int       `json:"round"`
	IsStarted          bool      `json:"isStarted"`
	IsFinished         bool      `json:"isFinished"`
	CreatedAt          time.Time `json:"createdAt"`
	mu                 sync.RWMutex
}

// NewGame creates a new game instance
func NewGame(id, roomCode string, players []*Player) *Game {
	return &Game{
		ID:                 id,
		RoomCode:           roomCode,
		Players:            players,
		DiscardPile:        []*Card{},
		CenterPile:         []*Card{},
		CurrentPlayerIndex: 0,
		DealerIndex:        0,
		Round:              1,
		IsStarted:          false,
		IsFinished:         false,
		CreatedAt:          time.Now(),
	}
}

// GetCurrentPlayer returns the current player
func (g *Game) GetCurrentPlayer() *Player {
	g.mu.RLock()
	defer g.mu.RUnlock()
	if g.CurrentPlayerIndex >= 0 && g.CurrentPlayerIndex < len(g.Players) {
		return g.Players[g.CurrentPlayerIndex]
	}
	return nil
}

// NextPlayer advances to the next player
func (g *Game) NextPlayer() {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.CurrentPlayerIndex = (g.CurrentPlayerIndex + 1) % len(g.Players)
}

// Start marks the game as started
func (g *Game) Start() {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.IsStarted = true
}

// Finish marks the game as finished
func (g *Game) Finish() {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.IsFinished = true
}
