package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenerateRoomCode(t *testing.T) {
	t.Run("should generate 6 character code", func(t *testing.T) {
		code := GenerateRoomCode()
		assert.Equal(t, 6, len(code), "Code should be 6 characters long")
	})

	t.Run("should generate uppercase alphanumeric code", func(t *testing.T) {
		code := GenerateRoomCode()
		assert.Regexp(t, "^[A-Z0-9]{6}$", code, "Code should only contain uppercase letters and numbers")
	})

	t.Run("should generate unique codes", func(t *testing.T) {
		codes := make(map[string]bool)
		iterations := 1000

		for i := 0; i < iterations; i++ {
			code := GenerateRoomCode()
			assert.False(t, codes[code], "Code should be unique")
			codes[code] = true
		}

		assert.Equal(t, iterations, len(codes), "All generated codes should be unique")
	})
}
