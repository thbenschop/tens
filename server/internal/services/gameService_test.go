package services

import (
	"fmt"
	"testing"

	"github.com/thben/clearthedeck/internal/models"
)

func TestStartGame(t *testing.T) {
	tests := []struct {
		name        string
		playerCount int
		expectedLen int
	}{
		{"3 players", 3, 104},
		{"5 players", 5, 104},
		{"7 players", 7, 156},
		{"10 players", 10, 208},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
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

			// Start game
			game := StartGame(players)

			// Verify game was created
			if game == nil {
				t.Fatal("StartGame returned nil")
			}

			// Verify correct number of players
			if len(game.Players) != tt.playerCount {
				t.Errorf("Game has %d players, expected %d", len(game.Players), tt.playerCount)
			}

			// Verify each player has correct cards dealt
			for i, player := range game.Players {
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

			// Verify discard pile has remaining cards
			totalDealt := tt.playerCount * 20
			expectedDiscard := tt.expectedLen - totalDealt
			if len(game.DiscardPile) != expectedDiscard {
				t.Errorf("Discard pile has %d cards, expected %d", len(game.DiscardPile), expectedDiscard)
			}

			// Verify center pile is empty at start
			if len(game.CenterPile) != 0 {
				t.Errorf("Center pile has %d cards, expected 0", len(game.CenterPile))
			}

			// Verify current player is first player (index 0)
			if game.CurrentPlayerIndex != 0 {
				t.Errorf("Current player index is %d, expected 0", game.CurrentPlayerIndex)
			}

			// Verify game state is initialized
			if game.IsStarted != true {
				t.Error("Game IsStarted should be true")
			}

			if game.IsFinished != false {
				t.Error("Game IsFinished should be false")
			}
		})
	}
}

func TestStartGameInvalidPlayerCount(t *testing.T) {
	tests := []struct {
		name        string
		playerCount int
	}{
		{"Too few players", 2},
		{"Too many players", 11},
		{"No players", 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create players
			players := make([]*models.Player, tt.playerCount)
			for i := 0; i < tt.playerCount; i++ {
				players[i] = &models.Player{
					ID:   fmt.Sprintf("player-%d", i),
					Name: fmt.Sprintf("Player %d", i),
				}
			}

			// Should panic with invalid player count
			defer func() {
				if r := recover(); r == nil {
					t.Errorf("StartGame should panic with %d players but did not", tt.playerCount)
				}
			}()
			StartGame(players)
		})
	}
}
