package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/thben/clearthedeck/internal/models"
	"github.com/thben/clearthedeck/internal/services"
)

// Message types
const (
	TypeCreateRoom    = "CREATE_ROOM"
	TypeRoomCreated   = "ROOM_CREATED"
	TypeJoinRoom      = "JOIN_ROOM"
	TypeRoomJoined    = "ROOM_JOINED"
	TypeLeaveRoom     = "LEAVE_ROOM"
	TypePlayerJoined  = "PLAYER_JOINED"
	TypePlayerLeft    = "PLAYER_LEFT"
	TypeStartGame     = "START_GAME"
	TypeGameStarted   = "GAME_STARTED"
	TypePlayCards     = "PLAY_CARDS"
	TypeFlipFaceDown  = "FLIP_FACE_DOWN"
	TypeGameUpdate    = "GAME_UPDATE"
	TypeError         = "ERROR"
)

// RoomHandler handles room-related WebSocket messages
type RoomHandler struct {
	roomService *services.RoomService
	// Map of room code to connections
	roomConnections map[string]map[*websocket.Conn]bool
	// Map of connection to player info
	connInfo map[*websocket.Conn]*ConnectionInfo
	// Map of room code to game instance
	games map[string]*models.Game
}

// ConnectionInfo stores player info for a connection
type ConnectionInfo struct {
	RoomCode string
	PlayerID string
}

// NewRoomHandler creates a new room handler
func NewRoomHandler() *RoomHandler {
	return &RoomHandler{
		roomService:     services.NewRoomService(),
		roomConnections: make(map[string]map[*websocket.Conn]bool),
		connInfo:        make(map[*websocket.Conn]*ConnectionInfo),
		games:           make(map[string]*models.Game),
	}
}

// HandleWebSocket upgrades HTTP connection to WebSocket and handles room messages
func (h *RoomHandler) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Send welcome message
	welcomeMsg := map[string]interface{}{
		"type":    "connected",
		"message": "Successfully connected to server",
	}
	if err := conn.WriteJSON(welcomeMsg); err != nil {
		log.Printf("Failed to send welcome message: %v", err)
		conn.Close()
		return
	}

	// Handle disconnection
	defer func() {
		h.handleDisconnect(conn)
		conn.Close()
		log.Printf("Client disconnected")
	}()

	// Listen for messages
	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Read error: %v", err)
			break
		}

		var msg map[string]interface{}
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			h.sendError(conn, "Invalid message format")
			continue
		}

		msgType, ok := msg["type"].(string)
		if !ok {
			h.sendError(conn, "Message type is required")
			continue
		}

		h.handleMessage(conn, msgType, msg)
	}
}

func (h *RoomHandler) handleMessage(conn *websocket.Conn, msgType string, msg map[string]interface{}) {
	switch msgType {
	case TypeCreateRoom:
		h.handleCreateRoom(conn, msg)
	case TypeJoinRoom:
		h.handleJoinRoom(conn, msg)
	case TypeLeaveRoom:
		h.handleLeaveRoom(conn, msg)
	case TypeStartGame:
		h.handleStartGame(conn, msg)
	case TypePlayCards:
		h.handlePlayCards(conn, msg)
	case TypeFlipFaceDown:
		h.handleFlipFaceDown(conn, msg)
	default:
		h.sendError(conn, "Unknown message type")
	}
}

func (h *RoomHandler) handleCreateRoom(conn *websocket.Conn, msg map[string]interface{}) {
	playerName, ok := msg["playerName"].(string)
	if !ok || playerName == "" {
		h.sendError(conn, "Player name is required")
		return
	}

	room, playerID, err := h.roomService.CreateRoom(playerName)
	if err != nil {
		h.sendError(conn, err.Error())
		return
	}

	// Store connection info
	h.connInfo[conn] = &ConnectionInfo{
		RoomCode: room.Code,
		PlayerID: playerID,
	}

	// Add connection to room
	if h.roomConnections[room.Code] == nil {
		h.roomConnections[room.Code] = make(map[*websocket.Conn]bool)
	}
	h.roomConnections[room.Code][conn] = true

	// Update player connection in room
	if player, ok := room.GetPlayer(playerID); ok {
		player.Connection = conn
	}

	// Send response
	response := map[string]interface{}{
		"type":     TypeRoomCreated,
		"roomCode": room.Code,
		"playerId": playerID,
		"room":     h.serializeRoom(room),
	}
	conn.WriteJSON(response)
}

func (h *RoomHandler) handleJoinRoom(conn *websocket.Conn, msg map[string]interface{}) {
	roomCode, ok := msg["roomCode"].(string)
	if !ok || roomCode == "" {
		h.sendError(conn, "Room code is required")
		return
	}

	playerName, ok := msg["playerName"].(string)
	if !ok || playerName == "" {
		h.sendError(conn, "Player name is required")
		return
	}

	playerID, err := h.roomService.JoinRoom(roomCode, playerName)
	if err != nil {
		h.sendError(conn, err.Error())
		return
	}

	room := h.roomService.GetRoom(roomCode)
	if room == nil {
		h.sendError(conn, "Room not found")
		return
	}

	// Store connection info
	h.connInfo[conn] = &ConnectionInfo{
		RoomCode: roomCode,
		PlayerID: playerID,
	}

	// Add connection to room
	if h.roomConnections[roomCode] == nil {
		h.roomConnections[roomCode] = make(map[*websocket.Conn]bool)
	}
	h.roomConnections[roomCode][conn] = true

	// Update player connection in room
	if player, ok := room.GetPlayer(playerID); ok {
		player.Connection = conn
	}

	// Send response to joining player
	response := map[string]interface{}{
		"type":     TypeRoomJoined,
		"playerId": playerID,
		"room":     h.serializeRoom(room),
	}
	conn.WriteJSON(response)

	// Broadcast to other players in room
	broadcast := map[string]interface{}{
		"type":       TypePlayerJoined,
		"playerName": playerName,
		"playerId":   playerID,
		"room":       h.serializeRoom(room),
	}
	h.broadcastToRoom(roomCode, broadcast, conn)
}

func (h *RoomHandler) handleLeaveRoom(conn *websocket.Conn, msg map[string]interface{}) {
	roomCode, ok := msg["roomCode"].(string)
	if !ok {
		h.sendError(conn, "Room code is required")
		return
	}

	playerID, ok := msg["playerId"].(string)
	if !ok {
		h.sendError(conn, "Player ID is required")
		return
	}

	room := h.roomService.GetRoom(roomCode)
	if room == nil {
		h.sendError(conn, "Room not found")
		return
	}

	player, ok := room.GetPlayer(playerID)
	if !ok {
		h.sendError(conn, "Player not in room")
		return
	}
	playerName := player.Name

	err := h.roomService.LeaveRoom(roomCode, playerID)
	if err != nil {
		h.sendError(conn, err.Error())
		return
	}

	// Remove connection from room
	if connections, exists := h.roomConnections[roomCode]; exists {
		delete(connections, conn)
		if len(connections) == 0 {
			delete(h.roomConnections, roomCode)
		}
	}
	delete(h.connInfo, conn)

	// Broadcast to remaining players
	broadcast := map[string]interface{}{
		"type":       TypePlayerLeft,
		"playerName": playerName,
		"playerId":   playerID,
		"room":       h.serializeRoom(room),
	}
	h.broadcastToRoom(roomCode, broadcast, nil)
}

func (h *RoomHandler) handleStartGame(conn *websocket.Conn, msg map[string]interface{}) {
	roomCode, ok := msg["roomCode"].(string)
	if !ok {
		h.sendError(conn, "Room code is required")
		return
	}

	playerID, ok := msg["playerId"].(string)
	if !ok {
		h.sendError(conn, "Player ID is required")
		return
	}

	room := h.roomService.GetRoom(roomCode)
	if room == nil {
		h.sendError(conn, "Room not found")
		return
	}

	// Check if player is host
	if room.HostID != playerID {
		h.sendError(conn, "Only the host can start the game")
		return
	}

	// Check minimum players
	if room.GetPlayerCount() < services.MinPlayers {
		h.sendError(conn, "Need at least 3 players to start")
		return
	}

	// Convert room players to slice for game service
	players := make([]*models.Player, 0, len(room.Players))
	for _, player := range room.Players {
		players = append(players, player)
	}

	// Start the game - this creates deck, shuffles, and deals cards
	game := services.StartGame(players)
	game.RoomCode = roomCode

	// Store game instance
	h.games[roomCode] = game

	// Broadcast game started to all players with game state
	broadcast := map[string]interface{}{
		"type": TypeGameStarted,
		"game": h.serializeGame(game),
	}
	h.broadcastToRoom(roomCode, broadcast, nil)
}

func (h *RoomHandler) handleDisconnect(conn *websocket.Conn) {
	info, ok := h.connInfo[conn]
	if !ok {
		return
	}

	room := h.roomService.GetRoom(info.RoomCode)
	if room == nil {
		return
	}

	player, ok := room.GetPlayer(info.PlayerID)
	if !ok {
		return
	}
	playerName := player.Name

	// Remove player from room
	h.roomService.LeaveRoom(info.RoomCode, info.PlayerID)

	// Remove connection from room
	if connections, exists := h.roomConnections[info.RoomCode]; exists {
		delete(connections, conn)
		if len(connections) == 0 {
			delete(h.roomConnections, info.RoomCode)
		}
	}
	delete(h.connInfo, conn)

	// Broadcast to remaining players
	broadcast := map[string]interface{}{
		"type":       TypePlayerLeft,
		"playerName": playerName,
		"playerId":   info.PlayerID,
		"room":       h.serializeRoom(room),
	}
	h.broadcastToRoom(info.RoomCode, broadcast, nil)
}

func (h *RoomHandler) broadcastToRoom(roomCode string, msg map[string]interface{}, exclude *websocket.Conn) {
	connections, exists := h.roomConnections[roomCode]
	if !exists {
		return
	}

	for conn := range connections {
		if conn != exclude {
			if err := conn.WriteJSON(msg); err != nil {
				log.Printf("Failed to broadcast to connection: %v", err)
			}
		}
	}
}

func (h *RoomHandler) sendError(conn *websocket.Conn, message string) {
	response := map[string]interface{}{
		"type":    TypeError,
		"message": message,
	}
	conn.WriteJSON(response)
}

func (h *RoomHandler) serializeRoom(room *models.Room) map[string]interface{} {
	if room == nil {
		return nil
	}

	players := make([]map[string]interface{}, 0, len(room.Players))
	for _, player := range room.Players {
		players = append(players, map[string]interface{}{
			"id":   player.ID,
			"name": player.Name,
		})
	}

	return map[string]interface{}{
		"code":        room.Code,
		"hostId":      room.HostID,
		"players":     players,
		"playerCount": room.GetPlayerCount(),
	}
}

func (h *RoomHandler) serializeGame(game *models.Game) map[string]interface{} {
	if game == nil {
		return nil
	}

	// Serialize players with their cards
	players := make([]map[string]interface{}, 0, len(game.Players))
	for _, player := range game.Players {
		// Serialize hand cards
		hand := make([]map[string]interface{}, 0, len(player.Hand))
		for _, card := range player.Hand {
			hand = append(hand, map[string]interface{}{
				"id":    card.ID,
				"suit":  card.Suit,
				"value": card.Value,
			})
		}

		// Serialize table cards up
		tableUp := make([]map[string]interface{}, 0, len(player.TableCardsUp))
		for _, card := range player.TableCardsUp {
			tableUp = append(tableUp, map[string]interface{}{
				"id":    card.ID,
				"suit":  card.Suit,
				"value": card.Value,
			})
		}

		// Table cards down - hide value/suit
		tableDown := make([]map[string]interface{}, 0, len(player.TableCardsDown))
		for _, card := range player.TableCardsDown {
			tableDown = append(tableDown, map[string]interface{}{
				"id":     card.ID,
				"hidden": true,
			})
		}

		players = append(players, map[string]interface{}{
			"id":             player.ID,
			"name":           player.Name,
			"hand":           hand,
			"tableCardsUp":   tableUp,
			"tableCardsDown": tableDown,
		})
	}

	// Serialize center pile
	centerPile := make([]map[string]interface{}, 0, len(game.CenterPile))
	for _, card := range game.CenterPile {
		centerPile = append(centerPile, map[string]interface{}{
			"id":    card.ID,
			"suit":  card.Suit,
			"value": card.Value,
		})
	}

	return map[string]interface{}{
		"players":            players,
		"centerPile":         centerPile,
		"discardCount":       len(game.DiscardPile),
		"currentPlayerIndex": game.CurrentPlayerIndex,
		"dealerIndex":        game.DealerIndex,
		"round":              game.Round,
	}
}
