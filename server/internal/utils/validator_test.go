package utils

import (
	"testing"

	"github.com/thben/clearthedeck/internal/models"
)

func TestAllSameValue(t *testing.T) {
	tests := []struct {
		name     string
		cards    []*models.Card
		expected bool
	}{
		{
			name: "All same value returns true",
			cards: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "5"},
				{ID: "2", Suit: "Diamonds", Value: "5"},
				{ID: "3", Suit: "Clubs", Value: "5"},
			},
			expected: true,
		},
		{
			name: "Mixed values returns false",
			cards: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "5"},
				{ID: "2", Suit: "Diamonds", Value: "6"},
				{ID: "3", Suit: "Clubs", Value: "5"},
			},
			expected: false,
		},
		{
			name:     "Empty slice returns true",
			cards:    []*models.Card{},
			expected: true,
		},
		{
			name: "Single card returns true",
			cards: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "K"},
			},
			expected: true,
		},
		{
			name: "All tens returns true",
			cards: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "10"},
				{ID: "2", Suit: "Diamonds", Value: "10"},
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := AllSameValue(tt.cards)
			if result != tt.expected {
				t.Errorf("AllSameValue() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestIsValidPlay(t *testing.T) {
	tests := []struct {
		name           string
		cardsToPlay    []*models.Card
		centerPile     []*models.Card
		afterPickup    bool
		expectedValid  bool
		expectedReason string
	}{
		{
			name: "Empty center pile is always valid",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "K"},
			},
			centerPile:     []*models.Card{},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "Equal value is valid",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "5"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "5"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "Lesser value is valid",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "4"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "7"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "Greater value is valid and should stay on stack",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "9"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "5"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "Wild tens are always valid",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "10"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "3"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "Wild tens on high card",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "10"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "K"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "After pickup any value is valid",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "K"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "2"},
			},
			afterPickup:    true,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "Ace is value 1 - valid on 2",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "A"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "2"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "Jack (11) valid on King (13)",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "J"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "K"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
		{
			name: "King (13) over-value on Jack (11) stays valid",
			cardsToPlay: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "K"},
			},
			centerPile: []*models.Card{
				{ID: "2", Suit: "Diamonds", Value: "J"},
			},
			afterPickup:    false,
			expectedValid:  true,
			expectedReason: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			valid, reason := IsValidPlay(tt.cardsToPlay, tt.centerPile, tt.afterPickup)
			if valid != tt.expectedValid {
				t.Errorf("IsValidPlay() valid = %v, expected %v", valid, tt.expectedValid)
			}
			if reason != tt.expectedReason {
				t.Errorf("IsValidPlay() reason = %q, expected %q", reason, tt.expectedReason)
			}
		})
	}
}

func TestDetectSet(t *testing.T) {
	tests := []struct {
		name       string
		centerPile []*models.Card
		expected   bool
	}{
		{
			name: "4 same value cards at end is a set",
			centerPile: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "5"},
				{ID: "2", Suit: "Diamonds", Value: "5"},
				{ID: "3", Suit: "Clubs", Value: "5"},
				{ID: "4", Suit: "Spades", Value: "5"},
			},
			expected: true,
		},
		{
			name: "5 same value cards at end is a set",
			centerPile: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "K"},
				{ID: "2", Suit: "Diamonds", Value: "K"},
				{ID: "3", Suit: "Clubs", Value: "K"},
				{ID: "4", Suit: "Spades", Value: "K"},
				{ID: "5", Suit: "Hearts", Value: "K"},
			},
			expected: true,
		},
		{
			name: "Less than 4 same value is not a set",
			centerPile: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "7"},
				{ID: "2", Suit: "Diamonds", Value: "7"},
				{ID: "3", Suit: "Clubs", Value: "7"},
			},
			expected: false,
		},
		{
			name: "4 cards with different values is not a set",
			centerPile: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "5"},
				{ID: "2", Suit: "Diamonds", Value: "6"},
				{ID: "3", Suit: "Clubs", Value: "7"},
				{ID: "4", Suit: "Spades", Value: "8"},
			},
			expected: false,
		},
		{
			name: "4 same values with different before is a set",
			centerPile: []*models.Card{
				{ID: "0", Suit: "Hearts", Value: "3"},
				{ID: "1", Suit: "Hearts", Value: "5"},
				{ID: "2", Suit: "Diamonds", Value: "5"},
				{ID: "3", Suit: "Clubs", Value: "5"},
				{ID: "4", Suit: "Spades", Value: "5"},
			},
			expected: true,
		},
		{
			name: "4 cards but not consecutive same values is not a set",
			centerPile: []*models.Card{
				{ID: "1", Suit: "Hearts", Value: "5"},
				{ID: "2", Suit: "Diamonds", Value: "6"},
				{ID: "3", Suit: "Clubs", Value: "5"},
				{ID: "4", Suit: "Spades", Value: "5"},
			},
			expected: false,
		},
		{
			name:       "Empty center pile is not a set",
			centerPile: []*models.Card{},
			expected:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := DetectSet(tt.centerPile)
			if result != tt.expected {
				t.Errorf("DetectSet() = %v, expected %v", result, tt.expected)
			}
		})
	}
}
