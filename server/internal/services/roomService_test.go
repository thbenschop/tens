package services

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateRoom(t *testing.T) {
	t.Run("should create room with unique code", func(t *testing.T) {
		service := NewRoomService()
		
		room, playerID, err := service.CreateRoom("Player1")
		
		require.NoError(t, err)
		assert.NotNil(t, room)
		assert.Equal(t, 6, len(room.Code), "Room code should be 6 characters")
		assert.Regexp(t, "^[A-Z0-9]{6}$", room.Code, "Room code should be uppercase alphanumeric")
		assert.NotEmpty(t, playerID, "Player ID should be generated")
		assert.Equal(t, playerID, room.HostID, "Creator should be the host")
		assert.Equal(t, 1, room.GetPlayerCount(), "Room should have 1 player")
	})

	t.Run("should reject empty player name", func(t *testing.T) {
		service := NewRoomService()
		
		room, playerID, err := service.CreateRoom("")
		
		assert.Error(t, err)
		assert.Nil(t, room)
		assert.Empty(t, playerID)
	})

	t.Run("should generate unique room codes", func(t *testing.T) {
		service := NewRoomService()
		codes := make(map[string]bool)
		
		for i := 0; i < 10; i++ {
			room, _, err := service.CreateRoom("Player")
			require.NoError(t, err)
			assert.False(t, codes[room.Code], "Room codes should be unique")
			codes[room.Code] = true
		}
	})
}

func TestJoinRoom(t *testing.T) {
	t.Run("should join existing room", func(t *testing.T) {
		service := NewRoomService()
		room, _, err := service.CreateRoom("Host")
		require.NoError(t, err)
		
		playerID, err := service.JoinRoom(room.Code, "Player2")
		
		require.NoError(t, err)
		assert.NotEmpty(t, playerID)
		assert.Equal(t, 2, room.GetPlayerCount(), "Room should have 2 players")
	})

	t.Run("should reject invalid room code", func(t *testing.T) {
		service := NewRoomService()
		
		playerID, err := service.JoinRoom("INVALID", "Player")
		
		assert.Error(t, err)
		assert.Empty(t, playerID)
		assert.Contains(t, err.Error(), "not found")
	})

	t.Run("should reject duplicate player name in same room", func(t *testing.T) {
		service := NewRoomService()
		room, _, err := service.CreateRoom("Player1")
		require.NoError(t, err)
		
		playerID, err := service.JoinRoom(room.Code, "Player1")
		
		assert.Error(t, err)
		assert.Empty(t, playerID)
		assert.Contains(t, err.Error(), "already exists")
	})

	t.Run("should reject empty player name", func(t *testing.T) {
		service := NewRoomService()
		room, _, err := service.CreateRoom("Host")
		require.NoError(t, err)
		
		playerID, err := service.JoinRoom(room.Code, "")
		
		assert.Error(t, err)
		assert.Empty(t, playerID)
	})

	t.Run("should reject when room is full", func(t *testing.T) {
		service := NewRoomService()
		room, _, err := service.CreateRoom("Host")
		require.NoError(t, err)
		
		// Add 9 more players to reach max of 10
		for i := 2; i <= 10; i++ {
			_, err := service.JoinRoom(room.Code, "Player"+string(rune(i)))
			require.NoError(t, err)
		}
		
		// Try to add 11th player
		playerID, err := service.JoinRoom(room.Code, "Player11")
		
		assert.Error(t, err)
		assert.Empty(t, playerID)
		assert.Contains(t, err.Error(), "full")
	})
}

func TestLeaveRoom(t *testing.T) {
	t.Run("should remove player from room", func(t *testing.T) {
		service := NewRoomService()
		room, _, err := service.CreateRoom("Host")
		require.NoError(t, err)
		playerID, err := service.JoinRoom(room.Code, "Player2")
		require.NoError(t, err)
		
		err = service.LeaveRoom(room.Code, playerID)
		
		require.NoError(t, err)
		assert.Equal(t, 1, room.GetPlayerCount())
	})

	t.Run("should delete room when last player leaves", func(t *testing.T) {
		service := NewRoomService()
		room, playerID, err := service.CreateRoom("Host")
		require.NoError(t, err)
		
		err = service.LeaveRoom(room.Code, playerID)
		
		require.NoError(t, err)
		
		// Try to get room - should not exist
		retrievedRoom := service.GetRoom(room.Code)
		assert.Nil(t, retrievedRoom)
	})

	t.Run("should reassign host when host leaves", func(t *testing.T) {
		service := NewRoomService()
		room, hostID, err := service.CreateRoom("Host")
		require.NoError(t, err)
		player2ID, err := service.JoinRoom(room.Code, "Player2")
		require.NoError(t, err)
		
		err = service.LeaveRoom(room.Code, hostID)
		
		require.NoError(t, err)
		assert.Equal(t, player2ID, room.HostID, "Host should be reassigned")
		assert.Equal(t, 1, room.GetPlayerCount())
	})
}

func TestGetRoom(t *testing.T) {
	t.Run("should retrieve existing room", func(t *testing.T) {
		service := NewRoomService()
		createdRoom, _, err := service.CreateRoom("Host")
		require.NoError(t, err)
		
		retrievedRoom := service.GetRoom(createdRoom.Code)
		
		assert.NotNil(t, retrievedRoom)
		assert.Equal(t, createdRoom.Code, retrievedRoom.Code)
	})

	t.Run("should return nil for non-existent room", func(t *testing.T) {
		service := NewRoomService()
		
		room := service.GetRoom("NOTFOUND")
		
		assert.Nil(t, room)
	})
}
