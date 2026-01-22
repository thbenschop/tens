package models

// Card represents a playing card in the game
type Card struct {
	ID    string `json:"id"`    // Unique identifier for tracking
	Suit  string `json:"suit"`  // Hearts, Diamonds, Clubs, Spades
	Value string `json:"value"` // A, 2-10, J, Q, K
}

// NewCard creates a new card with a unique ID
func NewCard(id, suit, value string) *Card {
	return &Card{
		ID:    id,
		Suit:  suit,
		Value: value,
	}
}
