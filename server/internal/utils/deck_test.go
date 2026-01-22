package utils

import (
	"fmt"
	"testing"

	"github.com/thben/clearthedeck/internal/models"
)

// Alias for convenience in tests
type Card = models.Card

func TestCreateDeck(t *testing.T) {
	tests := []struct {
		name        string
		playerCount int
		expectedLen int
	}{
		{"3 players - 2 decks", 3, 104},
		{"4 players - 2 decks", 4, 104},
		{"5 players - 2 decks", 5, 104},
		{"6 players - 3 decks", 6, 156},
		{"7 players - 3 decks", 7, 156},
		{"8 players - 4 decks", 8, 208},
		{"9 players - 4 decks", 9, 208},
		{"10 players - 4 decks", 10, 208},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			deck := CreateDeck(tt.playerCount)

			if len(deck) != tt.expectedLen {
				t.Errorf("CreateDeck(%d) returned %d cards, expected %d", tt.playerCount, len(deck), tt.expectedLen)
			}

			// Verify we have the correct distribution of cards
			cardCounts := make(map[string]int)
			for _, card := range deck {
				key := card.Suit + card.Value
				cardCounts[key]++
			}

			// Each unique card should appear the correct number of times
			expectedDecks := tt.expectedLen / 52
			for key, count := range cardCounts {
				if count != expectedDecks {
					t.Errorf("Card %s appears %d times, expected %d", key, count, expectedDecks)
				}
			}
		})
	}
}

func TestCreateDeckInvalidPlayerCount(t *testing.T) {
	tests := []struct {
		name        string
		playerCount int
	}{
		{"Too few players", 2},
		{"Too many players", 11},
		{"Zero players", 0},
		{"Negative players", -1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			defer func() {
				if r := recover(); r == nil {
					t.Errorf("CreateDeck(%d) should panic but did not", tt.playerCount)
				}
			}()
			CreateDeck(tt.playerCount)
		})
	}
}

func TestShuffleDeck(t *testing.T) {
	// Create a deck for testing
	deck := CreateDeck(4)
	originalOrder := make([]*Card, len(deck))
	copy(originalOrder, deck)

	// Shuffle the deck
	ShuffleDeck(deck)

	// Verify deck has same length
	if len(deck) != len(originalOrder) {
		t.Errorf("Shuffled deck has %d cards, expected %d", len(deck), len(originalOrder))
	}

	// Verify all cards are still present (no cards lost or duplicated)
	cardIDs := make(map[string]bool)
	for _, card := range deck {
		if cardIDs[card.ID] {
			t.Errorf("Card %s appears multiple times after shuffle", card.ID)
		}
		cardIDs[card.ID] = true
	}

	// Verify deck order has changed (not strictly necessary but good sanity check)
	// With 104 cards, the probability of shuffle returning same order is astronomically low
	sameOrder := true
	for i := range deck {
		if deck[i].ID != originalOrder[i].ID {
			sameOrder = false
			break
		}
	}

	if sameOrder {
		t.Error("Shuffled deck has the same order as original - shuffle may not be working")
	}
}

func TestShuffleDeckMultipleTimes(t *testing.T) {
	// Test that shuffling produces different results each time
	deck := CreateDeck(4)

	// Shuffle multiple times and collect orders
	orders := make([]string, 5)
	for i := 0; i < 5; i++ {
		ShuffleDeck(deck)
		// Record the order using first 10 card IDs as a fingerprint
		fingerprint := ""
		for j := 0; j < 10 && j < len(deck); j++ {
			fingerprint += deck[j].ID + ","
		}
		orders[i] = fingerprint
	}

	// Check that at least some orders are different
	allSame := true
	for i := 1; i < len(orders); i++ {
		if orders[i] != orders[0] {
			allSame = false
			break
		}
	}

	if allSame {
		t.Error("Shuffling 5 times produced the same order - shuffle may not be random")
	}
}

func TestDealCards(t *testing.T) {
	tests := []struct {
		name        string
		playerCount int
	}{
		{"3 players", 3},
		{"5 players", 5},
		{"7 players", 7},
		{"10 players", 10},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create and shuffle deck
			deck := CreateDeck(tt.playerCount)
			ShuffleDeck(deck)

			// Create players
			players := make([]*models.Player, tt.playerCount)
			for i := 0; i < tt.playerCount; i++ {
				players[i] = &models.Player{
					ID:             fmt.Sprintf("player-%d", i),
					Name:           fmt.Sprintf("Player %d", i),
					Hand:           []*models.Card{},
					TableCardsUp:   []*models.Card{},
					TableCardsDown: []*models.Card{},
				}
			}

			// Deal cards
			discardPile := DealCards(deck, players)

			// Verify each player has correct number of cards
			for i, player := range players {
				if len(player.TableCardsDown) != 4 {
					t.Errorf("Player %d has %d face-down cards, expected 4", i, len(player.TableCardsDown))
				}
				if len(player.TableCardsUp) != 4 {
					t.Errorf("Player %d has %d face-up cards, expected 4", i, len(player.TableCardsUp))
				}
				if len(player.Hand) != 12 {
					t.Errorf("Player %d has %d hand cards, expected 12", i, len(player.Hand))
				}
			}

			// Verify total cards dealt + discard = total deck size
			totalDealt := tt.playerCount * 20 // Each player gets 20 cards
			expectedDiscard := len(deck) - totalDealt

			if len(discardPile) != expectedDiscard {
				t.Errorf("Discard pile has %d cards, expected %d", len(discardPile), expectedDiscard)
			}

			// Verify no duplicate cards
			cardIDs := make(map[string]bool)
			for _, player := range players {
				for _, card := range player.TableCardsDown {
					if cardIDs[card.ID] {
						t.Errorf("Card %s appears multiple times", card.ID)
					}
					cardIDs[card.ID] = true
				}
				for _, card := range player.TableCardsUp {
					if cardIDs[card.ID] {
						t.Errorf("Card %s appears multiple times", card.ID)
					}
					cardIDs[card.ID] = true
				}
				for _, card := range player.Hand {
					if cardIDs[card.ID] {
						t.Errorf("Card %s appears multiple times", card.ID)
					}
					cardIDs[card.ID] = true
				}
			}
			for _, card := range discardPile {
				if cardIDs[card.ID] {
					t.Errorf("Card %s appears multiple times", card.ID)
				}
				cardIDs[card.ID] = true
			}
		})
	}
}
