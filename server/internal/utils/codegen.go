package utils

import (
	"math/rand"
	"time"
)

const (
	codeLength = 6
	charset    = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

// Initialize random seed
func init() {
	rand.Seed(time.Now().UnixNano())
}

// GenerateRoomCode generates a unique 6-character alphanumeric room code
func GenerateRoomCode() string {
	code := make([]byte, codeLength)
	for i := range code {
		code[i] = charset[rand.Intn(len(charset))]
	}
	return string(code)
}
