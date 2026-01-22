package utils

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/thben/clearthedeck/internal/models"
)

// Initialize random seed
func init() {
	rand.Seed(time.Now().UnixNano())
}

// CreateDeck creates a deck of cards based on the number of players
// 3-5 players: 2 decks (104 cards)
// 6-7 players: 3 decks (156 cards)
// 8-10 players: 4 decks (208 cards)
func CreateDeck(playerCount int) []*models.Card {
	if playerCount < 3 || playerCount > 10 {
		panic(fmt.Sprintf("invalid player count: %d. Must be between 3 and 10", playerCount))
	}

	var numDecks int
	switch {
	case playerCount >= 3 && playerCount <= 5:
		numDecks = 2
	case playerCount >= 6 && playerCount <= 7:
		numDecks = 3
	case playerCount >= 8 && playerCount <= 10:
		numDecks = 4
	}

	suits := []string{"Hearts", "Diamonds", "Clubs", "Spades"}
	values := []string{"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"}

	deck := make([]*models.Card, 0, numDecks*52)
	cardID := 0

	for d := 0; d < numDecks; d++ {
		for _, suit := range suits {
			for _, value := range values {
				card := models.NewCard(fmt.Sprintf("card-%d", cardID), suit, value)
				deck = append(deck, card)
				cardID++
			}
		}
	}

	return deck
}

// ShuffleDeck shuffles a deck of cards using the Fisher-Yates algorithm
func ShuffleDeck(deck []*models.Card) {
	n := len(deck)
	for i := n - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		deck[i], deck[j] = deck[j], deck[i]
	}
}

// DealCards deals cards to players following the game rules:
// 4 face-down cards, then 4 face-up cards, then 12 hand cards per player
// Returns the remaining cards as the discard pile
func DealCards(deck []*models.Card, players []*models.Player) []*models.Card {
	cardIndex := 0

	// Deal 4 face-down cards to each player
	for round := 0; round < 4; round++ {
		for _, player := range players {
			if cardIndex < len(deck) {
				player.TableCardsDown = append(player.TableCardsDown, deck[cardIndex])
				cardIndex++
			}
		}
	}

	// Deal 4 face-up cards to each player
	for round := 0; round < 4; round++ {
		for _, player := range players {
			if cardIndex < len(deck) {
				player.TableCardsUp = append(player.TableCardsUp, deck[cardIndex])
				cardIndex++
			}
		}
	}

	// Deal 12 hand cards to each player
	for round := 0; round < 12; round++ {
		for _, player := range players {
			if cardIndex < len(deck) {
				player.Hand = append(player.Hand, deck[cardIndex])
				cardIndex++
			}
		}
	}

	// Remaining cards become the discard pile
	discardPile := deck[cardIndex:]
	return discardPile
}
