go test ./...
# Clear the Deck

A browser-based multiplayer card game (3–10 players) built with a React frontend and Go backend over WebSockets. Players create or join rooms, start rounds, play cards using the equal-or-lower rule (tens are wild), flip face-down cards when eligible, and score rounds until a winner emerges. The client includes real-time updates, turn indicators, inline error banners, and resilient WebSocket reconnect with backoff.

## Project Overview

- **Server (Go):** A WebSocket server (`server/`) with handlers for room lifecycle, game actions, and round flow; game/services for dealing, validation, sets, pickups, scoring, and dealer rotation; and utilities/models for cards, decks, scoring, and validation. Entry point lives in `cmd/main.go`.
- **Client (React):** A React app (`client/`) with hooks for WebSocket connectivity and game state (`useWebSocket`, `useGameState`), lobby components for creating/joining/starting games, and game components for the board, hand/table display, center pile, scoreboard, and card UI. Styling uses Tailwind plus custom card/game CSS.
- **Plans & Docs:** `plans/` contains the written plan and phase completion notes for the MVP.

## Development Setup

### Prerequisites

- Go 1.21+
- Node.js 18+
- npm

### Server Setup

```bash
cd server
go mod download
go run cmd/main.go
```

Server listens on `http://localhost:8080` with WebSocket endpoint at `/ws`.

### Client Setup

```bash
cd client
npm install
npm start
```

Client runs on `http://localhost:3000` and connects to `REACT_APP_WS_URL` (defaults to `ws://localhost:8080/ws`).

## Running Tests

### Server Tests

```bash
cd server
go test ./...
```

### Client Tests

Windows:
```bash
cd client
$env:CI="true"; npm test --
```

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

- `SERVER_PORT` — Server port (default: 8080)
- `REACT_APP_WS_URL` — WebSocket URL the client should use (e.g., `ws://localhost:8080/ws`)

## Gameplay Highlights

- Create or join rooms by 6-character code; host can start rounds when 3–10 players are present.
- Real-time game loop with turn enforcement, set detection (4+ of a kind clears the pile), wild tens clearing, and pickup when playing higher than the top card.
- Hand and table views with single-tap select and double-tap play; face-down flips when hand and face-up are empty.
- Round-end scoring with tens worth 20, cumulative totals, and dealer rotation; scoreboard shows results inline.
- Inline error banners and connection status (connecting/reconnecting) with automatic WebSocket retry/backoff.

## License

See LICENSE file for details.
