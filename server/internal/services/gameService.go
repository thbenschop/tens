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

	// Reset after-pickup state at the start of every round
	game.AfterPickup = false
	game.SetLastClearMessage("")

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
	// Reset clear message for this action
	game.SetLastClearMessage("")

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

	// Determine if this play follows a pickup (allows any value)
	effectiveAfterPickup := afterPickup || game.AfterPickup

	// Validate play is legal
	valid, reason := utils.IsValidPlay(cardsToPlay, game.CenterPile, effectiveAfterPickup)
	if !valid {
		return fmt.Errorf("invalid play: %s", reason)
	}

	// Valid play consumes after-pickup state
	game.AfterPickup = false

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

	// Snapshot previous top for over-value resolution
	var prevTop *models.Card
	if len(game.CenterPile) > 0 {
		prevTop = game.CenterPile[len(game.CenterPile)-1]
	}

	// Add cards to center pile
	game.CenterPile = append(game.CenterPile, cardsToPlay...)

	// Check for wild tens (clear deck)
	if len(cardsToPlay) > 0 && cardsToPlay[0].Value == "10" {
		game.SetLastClearMessage("Cleared by 10!")
		ClearDeck(game)
		// Check if player has won after clearing
		if CheckWinCondition(player) {
			return nil
		}
		return nil
	}

	// Check for set (4+ same value)
	if count, value := utils.CountTrailingSet(game.CenterPile); count >= 4 {
		game.SetLastClearMessage(formatSetClearMessage(count, value))
		ClearDeck(game)
		// Check if player has won after clearing
		if CheckWinCondition(player) {
			return nil
		}
		return nil
	}

	// Resolve over-value pickup: keep only matching value on pile, pick up the rest
	if prevTop != nil && utils.GetCardValue(cardsToPlay[0]) > utils.GetCardValue(prevTop) {
		keep := make([]*models.Card, 0)
		pickup := make([]*models.Card, 0)
		for _, c := range game.CenterPile {
			if c.Value == cardsToPlay[0].Value {
				keep = append(keep, c)
			} else {
				pickup = append(pickup, c)
			}
		}
		game.CenterPile = keep
		player.Hand = append(player.Hand, pickup...)
		// Over value cards form set after pickup, clear board and allow player to have another turn
		if count, value := utils.CountTrailingSet(game.CenterPile); count >= 4 {
			game.SetLastClearMessage(formatSetClearMessage(count, value))
			ClearDeck(game)
			return nil
		}
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
	game.AfterPickup = true
	// Turn stays with current player (additional turn)
	return nil
}

// FlipFaceDown reveals a face-down card and attempts to play it
func FlipFaceDown(game *models.Game, playerID string, cardID string) error {
	// Reset clear message for this action
	game.SetLastClearMessage("")

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

	// Find and remove the face-down card
	var flippedCard *models.Card
	var flippedIndex int
	for i, card := range player.TableCardsDown {
		if card.ID == cardID {
			flippedCard = card
			flippedIndex = i
			break
		}
	}
	if flippedCard == nil {
		return fmt.Errorf("face-down card not found")
	}

	// Enforce paired face-up (same slot index) must be played first
	if flippedIndex < len(player.TableCardsUp) {
		if partner := player.TableCardsUp[flippedIndex]; partner != nil {
			return fmt.Errorf("cannot flip face-down card until paired face-up is played") // TODO this error is showing up unexpectedly, probably need to link the face up/down cards to avoid client/server mismatch in ordering. Or we remove cards from the array, reducing size
		}
	}

	// Remove the card now that validation passed
	player.TableCardsDown = append(player.TableCardsDown[:flippedIndex], player.TableCardsDown[flippedIndex+1:]...)

	// Check if card can be played
	valid, _ := utils.IsValidPlay([]*models.Card{flippedCard}, game.CenterPile, false)
	if valid {
		var prevTop *models.Card
		if len(game.CenterPile) > 0 {
			prevTop = game.CenterPile[len(game.CenterPile)-1]
		}

		// Play the card
		game.CenterPile = append(game.CenterPile, flippedCard)

		// Check for wild tens or sets
		if flippedCard.Value == "10" {
			game.SetLastClearMessage("Cleared by 10!")
			ClearDeck(game)
			// Check if player has won after clearing
			if CheckWinCondition(player) {
				return nil
			}
		} else if count, value := utils.CountTrailingSet(game.CenterPile); count >= 4 {
			game.SetLastClearMessage(formatSetClearMessage(count, value))
			ClearDeck(game)
			// Check if player has won after clearing
			if CheckWinCondition(player) {
				return nil
			}
		} else {
			// Over-value flip pickup: keep matching value, pick others
			if prevTop != nil && utils.GetCardValue(flippedCard) > utils.GetCardValue(prevTop) {
				keep := make([]*models.Card, 0)
				pickup := make([]*models.Card, 0)
				for _, c := range game.CenterPile {
					if c.Value == flippedCard.Value {
						keep = append(keep, c)
					} else {
						pickup = append(pickup, c)
					}
				}
				game.CenterPile = keep
				player.Hand = append(player.Hand, pickup...)
			}

			// Over value cards form set after pickup, clear board and allow player to have another turn
			if count, value := utils.CountTrailingSet(game.CenterPile); count >= 4 {
				game.SetLastClearMessage(formatSetClearMessage(count, value))
				ClearDeck(game)
				return nil
			}
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

// CheckWinCondition checks if a player has won (0 cards remaining)
func CheckWinCondition(player *models.Player) bool {
	totalCards := len(player.Hand) + len(player.TableCardsUp) + len(player.TableCardsDown)
	return totalCards == 0
}

// EndRound calculates scores for all players and updates cumulative totals
// Winner receives 0 points for the round
func EndRound(game *models.Game, winnerID string) {
	for _, player := range game.Players {
		if player.ID == winnerID {
			// Winner gets 0 points
			player.RoundScore = 0
		} else {
			// Calculate score from remaining cards
			player.RoundScore = utils.CalculatePlayerScore(player)
		}

		// Add round score to cumulative total
		player.TotalScore += player.RoundScore
	}
}

// StartNextRound prepares the game for the next round
// Rotates dealer clockwise, resets round scores, and deals new cards
func StartNextRound(game *models.Game) {
	// Increment round number
	game.Round++

	// Rotate dealer clockwise
	game.DealerIndex = (game.DealerIndex + 1) % len(game.Players)

	// Reset round scores
	for _, player := range game.Players {
		player.RoundScore = 0
	}

	// Initialize new round with fresh cards
	InitializeRound(game)

	// Set current player to left of dealer (after dealing)
	game.CurrentPlayerIndex = (game.DealerIndex + 1) % len(game.Players)
}

func formatSetClearMessage(count int, value string) string {
	return fmt.Sprintf("Cleared by %d %ss!", count, value)
}
