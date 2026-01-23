package services

import (
	"errors"
	"sync"

	"github.com/google/uuid"
	"github.com/thben/clearthedeck/internal/models"
	"github.com/thben/clearthedeck/internal/utils"
)

const (
	MinPlayers = 3
	MaxPlayers = 10
)

var (
	ErrRoomNotFound       = errors.New("room not found")
	ErrRoomFull           = errors.New("room is full")
	ErrPlayerNameEmpty    = errors.New("player name cannot be empty")
	ErrPlayerNameExists   = errors.New("player name already exists in room")
	ErrInvalidPlayerCount = errors.New("room must have 3-10 players")
)

// RoomService manages game rooms
type RoomService struct {
	rooms map[string]*models.Room
	mu    sync.RWMutex
}

// NewRoomService creates a new room service
func NewRoomService() *RoomService {
	return &RoomService{
		rooms: make(map[string]*models.Room),
	}
}

// CreateRoom creates a new room with a unique code
func (s *RoomService) CreateRoom(playerName string) (*models.Room, string, error) {
	if playerName == "" {
		return nil, "", ErrPlayerNameEmpty
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	// Generate unique room code
	var code string
	for {
		code = utils.GenerateRoomCode()
		if _, exists := s.rooms[code]; !exists {
			break
		}
	}

	// Generate player ID
	playerID := uuid.New().String()

	// Create room
	roomID := uuid.New().String()
	room := models.NewRoom(roomID, code, playerID)

	// Add creator as first player (host)
	player := &models.Player{
		ID:   playerID,
		Name: playerName,
	}
	room.AddPlayer(player)

	// Store room
	s.rooms[code] = room

	return room, playerID, nil
}

// JoinRoom adds a player to an existing room
func (s *RoomService) JoinRoom(roomCode, playerName string) (string, error) {
	if playerName == "" {
		return "", ErrPlayerNameEmpty
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	room, exists := s.rooms[roomCode]
	if !exists {
		return "", ErrRoomNotFound
	}

	// Check if room is full
	if room.GetPlayerCount() >= MaxPlayers {
		return "", ErrRoomFull
	}

	// Check for duplicate name
	if room.HasPlayerWithName(playerName) {
		return "", ErrPlayerNameExists
	}

	// Generate player ID and add to room
	playerID := uuid.New().String()
	player := &models.Player{
		ID:   playerID,
		Name: playerName,
	}
	room.AddPlayer(player)

	return playerID, nil
}

// LeaveRoom removes a player from a room
func (s *RoomService) LeaveRoom(roomCode, playerID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	room, exists := s.rooms[roomCode]
	if !exists {
		return ErrRoomNotFound
	}

	// Remove player
	room.RemovePlayer(playerID)

	// If room is empty, delete it
	if room.GetPlayerCount() == 0 {
		delete(s.rooms, roomCode)
		return nil
	}

	// If host left, reassign to first remaining player in join order
	if room.GetHostID() == playerID {
		if next := room.NextHost(); next != "" {
			room.SetHostID(next)
		}
	}

	return nil
}

// GetRoom retrieves a room by code
func (s *RoomService) GetRoom(roomCode string) *models.Room {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.rooms[roomCode]
}
