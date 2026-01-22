package handlers

import (
	"github.com/gorilla/websocket"
	"github.com/thben/clearthedeck/internal/models"
	"github.com/thben/clearthedeck/internal/services"
)

// PlayCardsMessage represents the PLAY_CARDS message from client
type PlayCardsMessage struct {
	CardIDs     []string `json:"cardIds"`
	AfterPickup bool     `json:"afterPickup"`
}

// FlipFaceDownMessage represents the FLIP_FACE_DOWN message from client
type FlipFaceDownMessage struct {
	CardID string `json:"cardId"`
}

// GameResponse represents the game state response sent to clients
type GameResponse struct {
	Type  string       `json:"type"`
	Game  *models.Game `json:"game,omitempty"`
	Error string       `json:"error,omitempty"`
}

// HandlePlayCards processes PLAY_CARDS WebSocket message
func (h *RoomHandler) handlePlayCards(conn *websocket.Conn, msg map[string]interface{}) {
	// Get connection info
	connInfo, ok := h.connInfo[conn]
	if !ok {
		h.sendError(conn, "Connection not registered")
		return
	}

	// Parse card IDs
	cardIDsRaw, ok := msg["cardIds"].([]interface{})
	if !ok {
		h.sendError(conn, "cardIds field is required")
		return
	}

	cardIDs := make([]string, len(cardIDsRaw))
	for i, idRaw := range cardIDsRaw {
		id, ok := idRaw.(string)
		if !ok {
			h.sendError(conn, "Invalid card ID format")
			return
		}
		cardIDs[i] = id
	}

	afterPickup, _ := msg["afterPickup"].(bool)

	room := h.roomService.GetRoom(connInfo.RoomCode)
	if room == nil {
		h.sendError(conn, "Room not found")
		return
	}

	game, ok := h.games[connInfo.RoomCode]
	if !ok || game == nil {
		h.sendError(conn, "Game not started")
		return
	}

	// Play the cards
	err := services.PlayCards(game, connInfo.PlayerID, cardIDs, afterPickup)
	if err != nil {
		h.sendError(conn, err.Error())
		return
	}

	// Broadcast game state to all players in room
	h.broadcastGameState(connInfo.RoomCode, game)
}

// HandleFlipFaceDown processes FLIP_FACE_DOWN WebSocket message
func (h *RoomHandler) handleFlipFaceDown(conn *websocket.Conn, msg map[string]interface{}) {
	// Get connection info
	connInfo, ok := h.connInfo[conn]
	if !ok {
		h.sendError(conn, "Connection not registered")
		return
	}

	// Parse card ID
	cardID, ok := msg["cardId"].(string)
	if !ok {
		h.sendError(conn, "cardId field is required")
		return
	}

	room := h.roomService.GetRoom(connInfo.RoomCode)
	if room == nil {
		h.sendError(conn, "Room not found")
		return
	}

	game, ok := h.games[connInfo.RoomCode]
	if !ok || game == nil {
		h.sendError(conn, "Game not started")
		return
	}

	// Flip the face-down card
	err := services.FlipFaceDown(game, connInfo.PlayerID, cardID)
	if err != nil {
		h.sendError(conn, err.Error())
		return
	}

	// Broadcast game state to all players in room
	h.broadcastGameState(connInfo.RoomCode, game)
}

// broadcastGameState broadcasts the current game state to all players in the room
func (h *RoomHandler) broadcastGameState(roomCode string, game *models.Game) {
	response := map[string]interface{}{
		"type": "GAME_UPDATE",
		"game": h.serializeGame(game),
	}

	h.broadcastToRoom(roomCode, response, nil)
}

