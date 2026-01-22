package services

import (
	"github.com/thben/clearthedeck/internal/models"
	"github.com/thben/clearthedeck/internal/utils"
)

// StartGame initializes a new game with deck creation, shuffling, and dealing
func StartGame(players []*models.Player) *models.Game {
	// Validate player count
	playerCount := len(players)
	if playerCount < 3 || playerCount > 10 {
		panic("invalid player count for starting game")
	}

	// Create deck based on player count
	deck := utils.CreateDeck(playerCount)

	// Shuffle the deck
	utils.ShuffleDeck(deck)

	// Deal cards to players
	discardPile := utils.DealCards(deck, players)

	// Create game instance
	game := models.NewGame("", "", players)
	game.DiscardPile = discardPile
	game.CenterPile = []*models.Card{}
	game.CurrentPlayerIndex = 0
	game.IsStarted = true
	game.IsFinished = false

	return game
}

// InitializeRound prepares a new round in an existing game
func InitializeRound(game *models.Game) {
	playerCount := len(game.Players)

	// Create and shuffle new deck
	deck := utils.CreateDeck(playerCount)
	utils.ShuffleDeck(deck)

	// Clear existing cards from all players
	for _, player := range game.Players {
		player.Hand = []*models.Card{}
		player.TableCardsUp = []*models.Card{}
		player.TableCardsDown = []*models.Card{}
	}

	// Deal new cards
	discardPile := utils.DealCards(deck, game.Players)

	// Reset game state
	game.DiscardPile = discardPile
	game.CenterPile = []*models.Card{}
	game.CurrentPlayerIndex = 0
	game.IsFinished = false
}
