package utils

import (
	"github.com/thben/clearthedeck/internal/models"
)

// AllSameValue checks if all cards in the slice have the same value
func AllSameValue(cards []*models.Card) bool {
	if len(cards) == 0 {
		return true
	}

	firstValue := cards[0].Value
	for _, card := range cards {
		if card.Value != firstValue {
			return false
		}
	}
	return true
}

// GetCardValue returns the numeric value of a card
// A=1, 2-9=face value, 10=10, J=11, Q=12, K=13
func GetCardValue(card *models.Card) int {
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
		return 10
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

// IsValidPlay checks if the cards can be played on the center pile
// Returns (isValid, reason)
func IsValidPlay(cardsToPlay []*models.Card, centerPile []*models.Card, afterPickup bool) (bool, string) {
	// After pickup, any card can be played
	if afterPickup {
		return true, ""
	}

	// Empty center pile, any card can be played
	if len(centerPile) == 0 {
		return true, ""
	}

	// If playing tens (wild), always valid
	if len(cardsToPlay) > 0 && cardsToPlay[0].Value == "10" {
		return true, ""
	}

	// Get the last card in center pile
	lastCard := centerPile[len(centerPile)-1]
	lastValue := GetCardValue(lastCard)

	// Get value of cards to play (all should be same value)
	playValue := GetCardValue(cardsToPlay[0])

	// Valid if equal or lesser
	if playValue <= lastValue {
		return true, ""
	}

	return false, "card value too high"
}

// DetectSet checks if the last 4 or more cards in the center pile are all the same value
func DetectSet(centerPile []*models.Card) bool {
	// Need at least 4 cards to form a set
	if len(centerPile) < 4 {
		return false
	}

	// Check from the end backwards to see how many consecutive cards have the same value
	lastCard := centerPile[len(centerPile)-1]
	count := 1

	for i := len(centerPile) - 2; i >= 0; i-- {
		if centerPile[i].Value == lastCard.Value {
			count++
		} else {
			break
		}
	}

	return count >= 4
}
