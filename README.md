# Clear the Deck

A multiplayer card game where players compete to clear all their cards by making combinations that sum to 10.

## Project Structure

```
/
├── server/                 # Go WebSocket server
│   ├── cmd/
│   │   └── main.go        # Server entry point
│   ├── internal/
│   │   ├── handlers/      # WebSocket handlers
│   │   └── models/        # Data models
│   ├── go.mod
│   └── go.sum
│
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── hooks/         # Custom React hooks
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Application entry point
│   ├── package.json
│   └── tailwind.config.js
│
└── plans/                  # Development plans and documentation
```

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

Server runs on `http://localhost:8080`

### Client Setup

```bash
cd client
npm install
npm start
```

Client runs on `http://localhost:3000`

## Running Tests

### Server Tests

```bash
cd server
go test ./...
```

### Client Tests

```bash
cd client
npm test
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `SERVER_PORT` - Server port (default: 8080)
- `REACT_APP_WS_URL` - WebSocket URL for client

## Current Status

Phase 1 Complete:
- ✅ Go WebSocket server with connection handling
- ✅ React client with WebSocket connection hook
- ✅ Tailwind CSS styling setup
- ✅ Test infrastructure for both server and client
- ✅ CORS configuration
- ✅ Basic project structure

## Next Steps

- Phase 2: Room Management & Player Join
- Phase 3: Game State Management
- Phase 4: Card Distribution & Display
- Phase 5: Game Logic & Actions
- Phase 6: Polish & Production Ready

## License

See LICENSE file for details.
