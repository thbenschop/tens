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
			defer func() {
				if r := recover(); r == nil {
					t.Errorf("StartGame should have panicked for invalid player count")
				}
			}()

			// Create players
			players := make([]*models.Player, tt.playerCount)
			for i := 0; i < tt.playerCount; i++ {
				players[i] = &models.Player{
					ID:   fmt.Sprintf("player-%d", i),
					Name: fmt.Sprintf("Player %d", i),
				}
			}

			StartGame(players)
		})
	}
}

func TestPlayCards(t *testing.T) {
	t.Run("Valid play updates center pile", func(t *testing.T) {
		// Create a simple game with 3 players
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{
					{ID: "card-1", Suit: "Hearts", Value: "5"},
					{ID: "card-2", Suit: "Diamonds", Value: "5"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0

		cardIDs := []string{"card-1", "card-2"}
		err := PlayCards(game, "player-1", cardIDs, false)

		if err != nil {
			t.Fatalf("PlayCards returned error: %v", err)
		}

		// Check center pile has the cards
		if len(game.CenterPile) != 2 {
			t.Errorf("Center pile has %d cards, expected 2", len(game.CenterPile))
		}

		// Check cards removed from hand
		if len(players[0].Hand) != 0 {
			t.Errorf("Player hand has %d cards, expected 0", len(players[0].Hand))
		}
	})

	t.Run("Invalid play returns error", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{
					{ID: "card-1", Suit: "Hearts", Value: "K"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Diamonds", Value: "5"},
		}

		cardIDs := []string{"card-1"}
		err := PlayCards(game, "player-1", cardIDs, false)

		if err == nil {
			t.Fatal("PlayCards should return error for invalid play")
		}
	})

	t.Run("Playing cards removes from hand", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{
					{ID: "card-1", Suit: "Hearts", Value: "3"},
					{ID: "card-2", Suit: "Diamonds", Value: "7"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0

		cardIDs := []string{"card-1"}
		err := PlayCards(game, "player-1", cardIDs, false)

		if err != nil {
			t.Fatalf("PlayCards returned error: %v", err)
		}

		// Card should be removed from hand
		if len(players[0].Hand) != 1 {
			t.Errorf("Player hand has %d cards, expected 1", len(players[0].Hand))
		}
		if players[0].Hand[0].ID != "card-2" {
			t.Errorf("Wrong card remaining in hand")
		}
	})

	t.Run("Set detection triggers clear", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{
					{ID: "card-1", Suit: "Hearts", Value: "5"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Diamonds", Value: "5"},
			{ID: "center-2", Suit: "Clubs", Value: "5"},
			{ID: "center-3", Suit: "Spades", Value: "5"},
		}

		cardIDs := []string{"card-1"}
		err := PlayCards(game, "player-1", cardIDs, false)

		if err != nil {
			t.Fatalf("PlayCards returned error: %v", err)
		}

		// Center pile should be cleared (moved to discard)
		if len(game.CenterPile) != 0 {
			t.Errorf("Center pile has %d cards, expected 0 after set", len(game.CenterPile))
		}

		// Discard pile should have the 4 cards
		if len(game.DiscardPile) < 4 {
			t.Errorf("Discard pile has %d cards, expected at least 4", len(game.DiscardPile))
		}

		// Current player should stay the same (additional turn)
		if game.CurrentPlayerIndex != 0 {
			t.Errorf("Current player index is %d, expected 0 (same player)", game.CurrentPlayerIndex)
		}
	})

	t.Run("Wild tens trigger clear", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{
					{ID: "card-1", Suit: "Hearts", Value: "10"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Diamonds", Value: "3"},
		}

		cardIDs := []string{"card-1"}
		err := PlayCards(game, "player-1", cardIDs, false)

		if err != nil {
			t.Fatalf("PlayCards returned error: %v", err)
		}

		// Center pile should be cleared
		if len(game.CenterPile) != 0 {
			t.Errorf("Center pile has %d cards, expected 0 after ten", len(game.CenterPile))
		}

		// Current player should stay the same (additional turn)
		if game.CurrentPlayerIndex != 0 {
			t.Errorf("Current player index is %d, expected 0 (same player)", game.CurrentPlayerIndex)
		}
	})

	t.Run("Turn stays with player after clear", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{
					{ID: "card-1", Suit: "Hearts", Value: "10"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0

		initialPlayer := game.CurrentPlayerIndex
		cardIDs := []string{"card-1"}
		err := PlayCards(game, "player-1", cardIDs, false)

		if err != nil {
			t.Fatalf("PlayCards returned error: %v", err)
		}

		// Player should not change after clear
		if game.CurrentPlayerIndex != initialPlayer {
			t.Errorf("Current player changed from %d to %d, should stay same after clear",
				initialPlayer, game.CurrentPlayerIndex)
		}
	})
}

func TestClearDeck(t *testing.T) {
	t.Run("Moves center to discard", func(t *testing.T) {
		players := []*models.Player{
			{ID: "player-1", Name: "Player 1"},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Hearts", Value: "5"},
			{ID: "center-2", Suit: "Diamonds", Value: "5"},
			{ID: "center-3", Suit: "Clubs", Value: "5"},
		}
		game.DiscardPile = []*models.Card{
			{ID: "discard-1", Suit: "Spades", Value: "3"},
		}

		initialDiscardCount := len(game.DiscardPile)
		centerCount := len(game.CenterPile)

		ClearDeck(game)

		// Center pile should be empty
		if len(game.CenterPile) != 0 {
			t.Errorf("Center pile has %d cards, expected 0", len(game.CenterPile))
		}

		// Discard pile should have original + center cards
		expectedDiscard := initialDiscardCount + centerCount
		if len(game.DiscardPile) != expectedDiscard {
			t.Errorf("Discard pile has %d cards, expected %d", len(game.DiscardPile), expectedDiscard)
		}
	})

	t.Run("Empties center pile", func(t *testing.T) {
		players := []*models.Player{
			{ID: "player-1", Name: "Player 1"},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Hearts", Value: "10"},
		}

		ClearDeck(game)

		if len(game.CenterPile) != 0 {
			t.Errorf("Center pile should be empty after clear, has %d cards", len(game.CenterPile))
		}
	})

	t.Run("Keeps current player (additional turn)", func(t *testing.T) {
		players := []*models.Player{
			{ID: "player-1", Name: "Player 1"},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 1
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Hearts", Value: "10"},
		}

		initialPlayer := game.CurrentPlayerIndex
		ClearDeck(game)

		if game.CurrentPlayerIndex != initialPlayer {
			t.Errorf("Current player changed from %d to %d, should stay same",
				initialPlayer, game.CurrentPlayerIndex)
		}
	})
}

func TestPickupPile(t *testing.T) {
	t.Run("Moves center pile to hand", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Hearts", Value: "5"},
			{ID: "center-2", Suit: "Diamonds", Value: "7"},
			{ID: "center-3", Suit: "Clubs", Value: "9"},
		}

		err := PickupPile(game, "player-1")
		if err != nil {
			t.Fatalf("PickupPile returned error: %v", err)
		}

		if len(players[0].Hand) != 3 {
			t.Errorf("Player hand has %d cards, expected 3", len(players[0].Hand))
		}
		if len(game.CenterPile) != 0 {
			t.Errorf("Center pile has %d cards, expected 0", len(game.CenterPile))
		}
	})

	t.Run("Keeps current player (additional turn)", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:   "player-1",
				Name: "Player 1",
				Hand: []*models.Card{},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 1
		game.CenterPile = []*models.Card{
			{ID: "center-1", Suit: "Hearts", Value: "5"},
		}

		initialPlayer := game.CurrentPlayerIndex
		err := PickupPile(game, "player-2")
		if err != nil {
			t.Fatalf("PickupPile returned error: %v", err)
		}

		if game.CurrentPlayerIndex != initialPlayer {
			t.Errorf("Current player changed from %d to %d, should stay same",
				initialPlayer, game.CurrentPlayerIndex)
		}
	})

	t.Run("Returns error for invalid player", func(t *testing.T) {
		players := []*models.Player{
			{ID: "player-1", Name: "Player 1"},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true

		err := PickupPile(game, "invalid-player")
		if err == nil {
			t.Error("Expected error for invalid player")
		}
	})
}

func TestFlipFaceDown(t *testing.T) {
	t.Run("Valid flip plays card", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:           "player-1",
				Name:         "Player 1",
				Hand:         []*models.Card{},
				TableCardsUp: []*models.Card{},
				TableCardsDown: []*models.Card{
					{ID: "fd-1", Suit: "Hearts", Value: "3"},
					{ID: "fd-2", Suit: "Clubs", Value: "4"},
				},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{{ID: "c1", Suit: "Diamonds", Value: "5"}}

		err := FlipFaceDown(game, "player-1", "fd-1")
		if err != nil {
			t.Fatalf("FlipFaceDown returned error: %v", err)
		}

		if len(game.CenterPile) != 2 {
			t.Errorf("Center pile has %d cards, expected 2", len(game.CenterPile))
		}
		if game.CenterPile[1].ID != "fd-1" {
			t.Error("Expected flipped card to be on center pile")
		}
		if game.CurrentPlayerIndex != 1 {
			t.Error("Expected turn to advance after valid flip (player still has cards)")
		}
	})

	t.Run("Cannot flip with cards in hand", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:             "player-1",
				Name:           "Player 1",
				Hand:           []*models.Card{{ID: "h1", Suit: "Spades", Value: "2"}},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{{ID: "fd-2", Suit: "Hearts", Value: "5"}},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0

		err := FlipFaceDown(game, "player-1", "fd-2")
		if err == nil {
			t.Error("Expected error when flipping with cards in hand")
		}
	})

	t.Run("Invalid flip picks up pile", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:             "player-1",
				Name:           "Player 1",
				Hand:           []*models.Card{},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{{ID: "fd-3", Suit: "Hearts", Value: "7"}},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{{ID: "c1", Suit: "Diamonds", Value: "5"}}

		err := FlipFaceDown(game, "player-1", "fd-3")
		if err != nil {
			t.Fatalf("FlipFaceDown returned error: %v", err)
		}

		player := game.Players[0]
		if len(player.Hand) != 2 {
			t.Errorf("Player hand has %d cards, expected 2 after invalid flip", len(player.Hand))
		}
		if len(game.CenterPile) != 0 {
			t.Errorf("Center pile has %d cards, expected 0", len(game.CenterPile))
		}
		if game.CurrentPlayerIndex != 0 {
			t.Error("Expected turn to stay with player after invalid flip")
		}
	})

	t.Run("Wild ten clears deck", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:             "player-1",
				Name:           "Player 1",
				Hand:           []*models.Card{},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{{ID: "fd-10", Suit: "Hearts", Value: "10"}},
			},
			{ID: "player-2", Name: "Player 2"},
			{ID: "player-3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.CurrentPlayerIndex = 0
		game.CenterPile = []*models.Card{{ID: "c1", Suit: "Diamonds", Value: "5"}}

		err := FlipFaceDown(game, "player-1", "fd-10")
		if err != nil {
			t.Fatalf("FlipFaceDown returned error: %v", err)
		}

		if len(game.CenterPile) != 0 {
			t.Errorf("Center pile should be empty after wild ten, has %d cards", len(game.CenterPile))
		}
		if game.CurrentPlayerIndex != 0 {
			t.Error("Expected turn to stay with player after wild ten (additional turn)")
		}
	})
}

func TestCheckWinCondition(t *testing.T) {
	t.Run("Player with no cards wins", func(t *testing.T) {
		player := &models.Player{
			ID:             "p1",
			Hand:           []*models.Card{},
			TableCardsUp:   []*models.Card{},
			TableCardsDown: []*models.Card{},
		}

		hasWon := CheckWinCondition(player)
		if !hasWon {
			t.Error("Expected player with 0 cards to win")
		}
	})

	t.Run("Player with hand cards has not won", func(t *testing.T) {
		player := &models.Player{
			ID:             "p1",
			Hand:           []*models.Card{{ID: "c1", Value: "5"}},
			TableCardsUp:   []*models.Card{},
			TableCardsDown: []*models.Card{},
		}

		hasWon := CheckWinCondition(player)
		if hasWon {
			t.Error("Expected player with cards in hand to not win")
		}
	})

	t.Run("Player with face-up cards has not won", func(t *testing.T) {
		player := &models.Player{
			ID:             "p1",
			Hand:           []*models.Card{},
			TableCardsUp:   []*models.Card{{ID: "c1", Value: "5"}},
			TableCardsDown: []*models.Card{},
		}

		hasWon := CheckWinCondition(player)
		if hasWon {
			t.Error("Expected player with face-up cards to not win")
		}
	})

	t.Run("Player with face-down cards has not won", func(t *testing.T) {
		player := &models.Player{
			ID:             "p1",
			Hand:           []*models.Card{},
			TableCardsUp:   []*models.Card{},
			TableCardsDown: []*models.Card{{ID: "c1", Value: "5"}},
		}

		hasWon := CheckWinCondition(player)
		if hasWon {
			t.Error("Expected player with face-down cards to not win")
		}
	})
}

func TestEndRound(t *testing.T) {
	t.Run("Winner gets 0 points", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:             "p1",
				Name:           "Player 1",
				Hand:           []*models.Card{},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
				RoundScore:     0,
				TotalScore:     0,
			},
			{
				ID:   "p2",
				Name: "Player 2",
				Hand: []*models.Card{
					{Value: "5"},
					{Value: "7"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
				RoundScore:     0,
				TotalScore:     0,
			},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true

		EndRound(game, "p1")

		// Winner should have 0 points
		if players[0].RoundScore != 0 {
			t.Errorf("Winner round score = %d, expected 0", players[0].RoundScore)
		}

		// Other player should have points from remaining cards
		if players[1].RoundScore != 12 { // 5 + 7
			t.Errorf("Player 2 round score = %d, expected 12", players[1].RoundScore)
		}
	})

	t.Run("Cumulative score is updated", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:             "p1",
				Name:           "Player 1",
				Hand:           []*models.Card{},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
				RoundScore:     0,
				TotalScore:     10, // Previous rounds
			},
			{
				ID:   "p2",
				Name: "Player 2",
				Hand: []*models.Card{
					{Value: "3"},
				},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
				RoundScore:     0,
				TotalScore:     20, // Previous rounds
			},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true

		EndRound(game, "p1")

		// Winner cumulative stays at 10
		if players[0].TotalScore != 10 {
			t.Errorf("Winner total score = %d, expected 10", players[0].TotalScore)
		}

		// Other player cumulative increases by 3
		if players[1].TotalScore != 23 { // 20 + 3
			t.Errorf("Player 2 total score = %d, expected 23", players[1].TotalScore)
		}
	})

	t.Run("All remaining cards are scored", func(t *testing.T) {
		players := []*models.Player{
			{
				ID:             "p1",
				Name:           "Player 1",
				Hand:           []*models.Card{},
				TableCardsUp:   []*models.Card{},
				TableCardsDown: []*models.Card{},
			},
			{
				ID:   "p2",
				Name: "Player 2",
				Hand: []*models.Card{
					{Value: "2"},
				},
				TableCardsUp: []*models.Card{
					{Value: "K"},
				},
				TableCardsDown: []*models.Card{
					{Value: "10"},
				},
			},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true

		EndRound(game, "p1")

		// Player 2: 2 + 13 + 20 = 35
		if players[1].RoundScore != 35 {
			t.Errorf("Player 2 round score = %d, expected 35", players[1].RoundScore)
		}
	})
}

func TestStartNextRound(t *testing.T) {
	t.Run("Dealer rotates clockwise", func(t *testing.T) {
		players := []*models.Player{
			{ID: "p1", Name: "Player 1"},
			{ID: "p2", Name: "Player 2"},
			{ID: "p3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.DealerIndex = 0

		StartNextRound(game)

		if game.DealerIndex != 1 {
			t.Errorf("Dealer index = %d, expected 1", game.DealerIndex)
		}

		if game.CurrentPlayerIndex != 2 { // Left of dealer starts play
			t.Errorf("Current player index = %d, expected 2", game.CurrentPlayerIndex)
		}
	})

	t.Run("Dealer wraps around", func(t *testing.T) {
		players := []*models.Player{
			{ID: "p1", Name: "Player 1"},
			{ID: "p2", Name: "Player 2"},
			{ID: "p3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.DealerIndex = 2 // Last player

		StartNextRound(game)

		if game.DealerIndex != 0 {
			t.Errorf("Dealer index = %d, expected 0 (wrapped)", game.DealerIndex)
		}
	})

	t.Run("Round number increments", func(t *testing.T) {
		players := []*models.Player{
			{ID: "p1", Name: "Player 1"},
			{ID: "p2", Name: "Player 2"},
			{ID: "p3", Name: "Player 3"},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true
		game.Round = 1

		StartNextRound(game)

		if game.Round != 2 {
			t.Errorf("Round = %d, expected 2", game.Round)
		}
	})

	t.Run("Round scores reset", func(t *testing.T) {
		players := []*models.Player{
			{ID: "p1", Name: "Player 1", RoundScore: 10},
			{ID: "p2", Name: "Player 2", RoundScore: 20},
			{ID: "p3", Name: "Player 3", RoundScore: 15},
		}

		game := models.NewGame("game-1", "ABCD", players)
		game.IsStarted = true

		StartNextRound(game)

		for i, player := range game.Players {
			if player.RoundScore != 0 {
				t.Errorf("Player %d round score = %d, expected 0", i, player.RoundScore)
			}
		}
	})
}
