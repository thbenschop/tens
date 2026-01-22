import React from 'react';

function Lobby({ room, playerId, isHost, onStartGame, onLeaveRoom }) {
  if (!room) return null;

  const playerCount = room.players?.length || 0;
  const canStartGame = isHost && playerCount >= 3 && playerCount <= 10;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Lobby</h2>
        <div className="flex items-center justify-between">
          <div className="text-lg">
            <span className="text-gray-600">Room Code:</span>
            <span className="ml-2 font-mono font-bold text-2xl text-blue-600 tracking-wider">
              {room.code}
            </span>
          </div>
          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          Players ({playerCount}/10)
        </h3>
        <ul className="space-y-2">
          {room.players?.map((player) => (
            <li
              key={player.id}
              className={`p-3 rounded-md flex items-center justify-between ${
                player.id === playerId
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100'
              }`}
            >
              <span className="font-medium text-gray-800">{player.name}</span>
              {player.id === room.hostId && (
                <span className="px-2 py-1 text-xs bg-yellow-400 text-yellow-900 rounded-full font-semibold">
                  HOST
                </span>
              )}
              {player.id === playerId && (
                <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full font-semibold">
                  YOU
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {playerCount < 3 && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
          Waiting for more players... (Need at least 3 players to start)
        </div>
      )}

      {isHost && (
        <button
          onClick={onStartGame}
          disabled={!canStartGame}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canStartGame ? 'Start Game' : 'Waiting for players...'}
        </button>
      )}

      {!isHost && (
        <div className="text-center text-gray-600">
          Waiting for host to start the game...
        </div>
      )}
    </div>
  );
}

export default Lobby;
