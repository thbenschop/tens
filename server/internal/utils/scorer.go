package utils

import "github.com/thben/clearthedeck/internal/models"

// GetCardPointValue returns the point value of a card for scoring
// A=1, 2-9=face value, 10=20 points, J=11, Q=12, K=13
func GetCardPointValue(card *models.Card) int {
	switch card.Value {
	case "A":
		return 1
	case "2":
		return 2
	case "3":
		return 3
	case "4":
		return 4
	case "5":
		return 5
	case "6":
		return 6
	case "7":
		return 7
	case "8":
		return 8
	case "9":
		return 9
	case "10":
		return 25 // Tens are worth 25 points for scoring per game rules
	case "J":
		return 11
	case "Q":
		return 12
	case "K":
		return 13
	default:
		return 0
	}
}

// CalculatePlayerScore calculates total points for a player's remaining cards
// Includes cards in hand, face-up, and face-down
func CalculatePlayerScore(player *models.Player) int {
	score := 0

	// Score cards in hand
	for _, card := range player.Hand {
		score += GetCardPointValue(card)
	}

	// Score face-up cards
	for _, card := range player.TableCardsUp {
		score += GetCardPointValue(card)
	}

	// Score face-down cards
	for _, card := range player.TableCardsDown {
		score += GetCardPointValue(card)
	}

	return score
}
