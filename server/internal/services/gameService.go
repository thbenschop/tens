package services

import (
	"fmt"

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

// PlayCards handles a player playing cards to the center pile
func PlayCards(game *models.Game, playerID string, cardIDs []string, afterPickup bool) error {
	// Find the player
	var player *models.Player
	for _, p := range game.Players {
		if p.ID == playerID {
			player = p
			break
		}
	}
	if player == nil {
		return fmt.Errorf("player not found")
	}

	// Check if it's the player's turn
	currentPlayer := game.GetCurrentPlayer()
	if currentPlayer.ID != playerID {
		return fmt.Errorf("not your turn")
	}

	// Find the cards to play
	cardsToPlay := make([]*models.Card, 0)
	for _, cardID := range cardIDs {
		found := false
		// Check in hand
		for _, card := range player.Hand {
			if card.ID == cardID {
				cardsToPlay = append(cardsToPlay, card)
				found = true
				break
			}
		}
		// Check in table up
		if !found {
			for _, card := range player.TableCardsUp {
				if card.ID == cardID {
					cardsToPlay = append(cardsToPlay, card)
					found = true
					break
				}
			}
		}
		if !found {
			return fmt.Errorf("card not found: %s", cardID)
		}
	}

	// Validate all cards are the same value
	if !utils.AllSameValue(cardsToPlay) {
		return fmt.Errorf("all cards must have the same value")
	}

	// Validate play is legal
	valid, reason := utils.IsValidPlay(cardsToPlay, game.CenterPile, afterPickup)
	if !valid {
		return fmt.Errorf("invalid play: %s", reason)
	}

	// Remove cards from player's hand/table
	for _, cardID := range cardIDs {
		// Remove from hand
		for i, card := range player.Hand {
			if card.ID == cardID {
				player.Hand = append(player.Hand[:i], player.Hand[i+1:]...)
				break
			}
		}
		// Remove from table up
		for i, card := range player.TableCardsUp {
			if card.ID == cardID {
				player.TableCardsUp = append(player.TableCardsUp[:i], player.TableCardsUp[i+1:]...)
				break
			}
		}
	}

	// Add cards to center pile
	game.CenterPile = append(game.CenterPile, cardsToPlay...)

	// Check for wild tens (clear deck)
	if len(cardsToPlay) > 0 && cardsToPlay[0].Value == "10" {
		ClearDeck(game)
		return nil
	}

	// Check for set (4+ same value)
	if utils.DetectSet(game.CenterPile) {
		ClearDeck(game)
		return nil
	}

	// Normal play - advance to next player
	game.NextPlayer()
	return nil
}

// ClearDeck moves center pile to discard and keeps turn with current player
func ClearDeck(game *models.Game) {
	// Move center pile to discard
	game.DiscardPile = append(game.DiscardPile, game.CenterPile...)
	game.CenterPile = []*models.Card{}
	// Turn stays with current player (additional turn)
}

// PickupPile moves center pile to player's hand and keeps turn with current player
func PickupPile(game *models.Game, playerID string) error {
	// Find the player
	var player *models.Player
	for _, p := range game.Players {
		if p.ID == playerID {
			player = p
			break
		}
	}
	if player == nil {
		return fmt.Errorf("player not found")
	}

	// Move center pile to player's hand
	player.Hand = append(player.Hand, game.CenterPile...)
	game.CenterPile = []*models.Card{}
	// Turn stays with current player (additional turn)
	return nil
}

// FlipFaceDown reveals a face-down card and attempts to play it
func FlipFaceDown(game *models.Game, playerID string, cardID string) error {
	// Find the player
	var player *models.Player
	for _, p := range game.Players {
		if p.ID == playerID {
			player = p
			break
		}
	}
	if player == nil {
		return fmt.Errorf("player not found")
	}

	// Check if it's the player's turn
	currentPlayer := game.GetCurrentPlayer()
	if currentPlayer.ID != playerID {
		return fmt.Errorf("not your turn")
	}

	// Check if player can play face-down cards (hand and table-up must be empty)
	if len(player.Hand) > 0 || len(player.TableCardsUp) > 0 {
		return fmt.Errorf("must play all hand and table-up cards first")
	}

	// Find and remove the face-down card
	var flippedCard *models.Card
	for i, card := range player.TableCardsDown {
		if card.ID == cardID {
			flippedCard = card
			player.TableCardsDown = append(player.TableCardsDown[:i], player.TableCardsDown[i+1:]...)
			break
		}
	}
	if flippedCard == nil {
		return fmt.Errorf("face-down card not found")
	}

	// Check if card can be played
	valid, _ := utils.IsValidPlay([]*models.Card{flippedCard}, game.CenterPile, false)
	if valid {
		// Play the card
		game.CenterPile = append(game.CenterPile, flippedCard)

		// Check for wild tens or sets
		if flippedCard.Value == "10" {
			ClearDeck(game)
		} else if utils.DetectSet(game.CenterPile) {
			ClearDeck(game)
		} else {
			// Normal play - advance to next player
			game.NextPlayer()
		}
	} else {
		// Invalid play - add flipped card and center pile to hand
		player.Hand = append(player.Hand, flippedCard)
		player.Hand = append(player.Hand, game.CenterPile...)
		game.CenterPile = []*models.Card{}
		// Turn stays with current player (additional turn to play from hand)
	}

	return nil
}
