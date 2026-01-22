package main

import (
	"log"
	"net/http"

	"github.com/thben/clearthedeck/internal/handlers"
)

func main() {
	// Create WebSocket handler
	wsHandler := handlers.NewWebSocketHandler()

	// Set up routes
	http.HandleFunc("/ws", wsHandler.HandleWebSocket)

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Start server
	port := ":8080"
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
