import React, { useState } from 'react';
import useGameState from './hooks/useGameState';
import CreateRoom from './components/lobby/CreateRoom';
import JoinRoom from './components/lobby/JoinRoom';
import Lobby from './components/lobby/Lobby';
import GameBoard from './components/game/GameBoard';

function App() {
  const [view, setView] = useState('menu'); // 'menu', 'create', 'join', 'lobby', 'game'
  
  const gameState = useGameState();
  const {
    room,
    playerId,
    isHost,
    gameStarted,
    error,
    isConnected,
    wsError,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    clearError,
  } = gameState;

  const handleCreateRoom = (playerName) => {
    createRoom(playerName);
    setView('lobby');
  };

  const handleJoinRoom = (roomCode, playerName) => {
    joinRoom(roomCode, playerName);
    setView('lobby');
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setView('menu');
  };

  const handleStartGame = () => {
    startGame();
  };

  if (gameStarted) {
    return <GameBoard state={gameState} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Clear the Deck
          </h1>
          <div className="flex items-center justify-center gap-2 text-white">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {(error || wsError) && (
            <div className="mt-3 max-w-md mx-auto">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error || wsError?.message}
                <button
                  onClick={clearError}
                  className="absolute top-0 right-0 px-3 py-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </header>

        {view === 'lobby' && room ? (
          <Lobby
            room={room}
            playerId={playerId}
            isHost={isHost}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : view === 'create' ? (
          <div>
            <button
              onClick={() => setView('menu')}
              className="mb-4 text-white hover:text-gray-200 flex items-center gap-2"
            >
              ← Back
            </button>
            <CreateRoom onCreateRoom={handleCreateRoom} error={error} />
          </div>
        ) : view === 'join' ? (
          <div>
            <button
              onClick={() => setView('menu')}
              className="mb-4 text-white hover:text-gray-200 flex items-center gap-2"
            >
              ← Back
            </button>
            <JoinRoom onJoinRoom={handleJoinRoom} error={error} />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Welcome!
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => setView('create')}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg"
                  disabled={!isConnected}
                >
                  Create Room
                </button>
                <button
                  onClick={() => setView('join')}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold text-lg"
                  disabled={!isConnected}
                >
                  Join Room
                </button>
              </div>
              {!isConnected && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  Connecting to server...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
