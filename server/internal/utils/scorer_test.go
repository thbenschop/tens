package utils

import (
	"testing"

	"github.com/thben/clearthedeck/internal/models"
)

func TestGetCardPointValue(t *testing.T) {
	tests := []struct {
		name          string
		card          *models.Card
		expectedValue int
	}{
		{
			name:          "Ace is 1 point",
			card:          &models.Card{Value: "A"},
			expectedValue: 1,
		},
		{
			name:          "Two is 2 points",
			card:          &models.Card{Value: "2"},
			expectedValue: 2,
		},
		{
			name:          "Three is 3 points",
			card:          &models.Card{Value: "3"},
			expectedValue: 3,
		},
		{
			name:          "Four is 4 points",
			card:          &models.Card{Value: "4"},
			expectedValue: 4,
		},
		{
			name:          "Five is 5 points",
			card:          &models.Card{Value: "5"},
			expectedValue: 5,
		},
		{
			name:          "Six is 6 points",
			card:          &models.Card{Value: "6"},
			expectedValue: 6,
		},
		{
			name:          "Seven is 7 points",
			card:          &models.Card{Value: "7"},
			expectedValue: 7,
		},
		{
			name:          "Eight is 8 points",
			card:          &models.Card{Value: "8"},
			expectedValue: 8,
		},
		{
			name:          "Nine is 9 points",
			card:          &models.Card{Value: "9"},
			expectedValue: 9,
		},
		{
			name:          "Ten is 20 points",
			card:          &models.Card{Value: "10"},
			expectedValue: 20,
		},
		{
			name:          "Jack is 11 points",
			card:          &models.Card{Value: "J"},
			expectedValue: 11,
		},
		{
			name:          "Queen is 12 points",
			card:          &models.Card{Value: "Q"},
			expectedValue: 12,
		},
		{
			name:          "King is 13 points",
			card:          &models.Card{Value: "K"},
			expectedValue: 13,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GetCardPointValue(tt.card)
			if result != tt.expectedValue {
				t.Errorf("GetCardPointValue(%s) = %d, expected %d", tt.card.Value, result, tt.expectedValue)
			}
		})
	}
}

func TestCalculatePlayerScore(t *testing.T) {
	t.Run("Empty player has 0 points", func(t *testing.T) {
		player := &models.Player{
			ID:             "p1",
			Hand:           []*models.Card{},
			TableCardsUp:   []*models.Card{},
			TableCardsDown: []*models.Card{},
		}

		score := CalculatePlayerScore(player)
		if score != 0 {
			t.Errorf("Expected 0 points for empty player, got %d", score)
		}
	})

	t.Run("Score includes cards in hand", func(t *testing.T) {
		player := &models.Player{
			ID: "p1",
			Hand: []*models.Card{
				{Value: "5"},
				{Value: "7"},
				{Value: "A"},
			},
			TableCardsUp:   []*models.Card{},
			TableCardsDown: []*models.Card{},
		}

		score := CalculatePlayerScore(player)
		// 5 + 7 + 1 = 13
		if score != 13 {
			t.Errorf("Expected 13 points, got %d", score)
		}
	})

	t.Run("Score includes face-up cards", func(t *testing.T) {
		player := &models.Player{
			ID:   "p1",
			Hand: []*models.Card{},
			TableCardsUp: []*models.Card{
				{Value: "K"},
				{Value: "Q"},
			},
			TableCardsDown: []*models.Card{},
		}

		score := CalculatePlayerScore(player)
		// 13 + 12 = 25
		if score != 25 {
			t.Errorf("Expected 25 points, got %d", score)
		}
	})

	t.Run("Score includes face-down cards", func(t *testing.T) {
		player := &models.Player{
			ID:           "p1",
			Hand:         []*models.Card{},
			TableCardsUp: []*models.Card{},
			TableCardsDown: []*models.Card{
				{Value: "3"},
				{Value: "J"},
			},
		}

		score := CalculatePlayerScore(player)
		// 3 + 11 = 14
		if score != 14 {
			t.Errorf("Expected 14 points, got %d", score)
		}
	})

	t.Run("Score includes all card locations", func(t *testing.T) {
		player := &models.Player{
			ID: "p1",
			Hand: []*models.Card{
				{Value: "2"},
			},
			TableCardsUp: []*models.Card{
				{Value: "3"},
			},
			TableCardsDown: []*models.Card{
				{Value: "4"},
			},
		}

		score := CalculatePlayerScore(player)
		// 2 + 3 + 4 = 9
		if score != 9 {
			t.Errorf("Expected 9 points, got %d", score)
		}
	})

	t.Run("Ten is worth 20 points", func(t *testing.T) {
		player := &models.Player{
			ID: "p1",
			Hand: []*models.Card{
				{Value: "10"},
				{Value: "10"},
			},
			TableCardsUp:   []*models.Card{},
			TableCardsDown: []*models.Card{},
		}

		score := CalculatePlayerScore(player)
		// 20 + 20 = 40
		if score != 40 {
			t.Errorf("Expected 40 points for two tens, got %d", score)
		}
	})

	t.Run("Complex scoring with multiple card types", func(t *testing.T) {
		player := &models.Player{
			ID: "p1",
			Hand: []*models.Card{
				{Value: "A"},
				{Value: "10"},
				{Value: "K"},
			},
			TableCardsUp: []*models.Card{
				{Value: "5"},
				{Value: "Q"},
			},
			TableCardsDown: []*models.Card{
				{Value: "7"},
			},
		}

		score := CalculatePlayerScore(player)
		// 1 + 20 + 13 + 5 + 12 + 7 = 58
		if score != 58 {
			t.Errorf("Expected 58 points, got %d", score)
		}
	})
}
