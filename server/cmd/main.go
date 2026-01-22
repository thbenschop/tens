package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/thben/clearthedeck/internal/handlers"
)

func main() {
	// Load .env file if it exists (ignore error in production)
	godotenv.Load()

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Create room handler (replaces old WebSocket handler)
	roomHandler := handlers.NewRoomHandler()

	// Set up routes
	http.HandleFunc("/ws", roomHandler.HandleWebSocket)

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Start server
	addr := ":" + port
	log.Printf("Server starting on port %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
