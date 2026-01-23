import { useState, useCallback } from 'react';
import useWebSocket from './useWebSocket';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';

/**
 * Custom hook for managing game state and room operations
 */
function useGameState() {
  const [gameState, setGameState] = useState({
    playerName: '',
    playerId: null,
    roomCode: null,
    room: null,
    game: null,
    isHost: false,
    gameStarted: false,
    roundResult: null,
    error: null,
  });

  const { isConnected, error: wsError, sendMessage } = useWebSocket(
    WS_URL,
    {
      onMessage: (data) => {
        handleMessage(data);
      },
    }
  );

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'ROOM_CREATED':
        setGameState((prev) => ({
          ...prev,
          playerId: data.playerId,
          roomCode: data.roomCode,
          room: data.room,
          isHost: true,
          error: null,
        }));
        break;

      case 'ROOM_JOINED':
        setGameState((prev) => ({
          ...prev,
          playerId: data.playerId,
          room: data.room,
          isHost: data.room.hostId === data.playerId,
          error: null,
        }));
        break;

      case 'PLAYER_JOINED':
      case 'PLAYER_LEFT':
        setGameState((prev) => ({
          ...prev,
          room: data.room,
        }));
        break;

      case 'GAME_STARTED':
        setGameState((prev) => ({
          ...prev,
          gameStarted: true,
          game: data.game,
        }));
        break;

      case 'GAME_UPDATE':
        setGameState((prev) => ({
          ...prev,
          game: data.game,
        }));
        break;

      case 'ROUND_END':
        setGameState((prev) => ({
          ...prev,
          roundResult: {
            winner: data.winner,
            players: data.scores,
            roundNumber: data.round,
          },
          game: data.game,
        }));
        break;

      case 'ROUND_STARTED':
        setGameState((prev) => ({
          ...prev,
          roundResult: null,
          game: data.game,
        }));
        break;

      case 'ERROR':
        setGameState((prev) => ({
          ...prev,
          error: data.message,
        }));
        break;

      default:
        break;
    }
  }, []);

  const createRoom = useCallback(
    (playerName) => {
      setGameState((prev) => ({
        ...prev,
        playerName,
        error: null,
      }));
      sendMessage({
        type: 'CREATE_ROOM',
        playerName,
      });
    },
    [sendMessage]
  );

  const joinRoom = useCallback(
    (roomCode, playerName) => {
      setGameState((prev) => ({
        ...prev,
        playerName,
        roomCode,
        error: null,
      }));
      sendMessage({
        type: 'JOIN_ROOM',
        roomCode: roomCode.toUpperCase(),
        playerName,
      });
    },
    [sendMessage]
  );

  const leaveRoom = useCallback(() => {
    if (gameState.roomCode && gameState.playerId) {
      sendMessage({
        type: 'LEAVE_ROOM',
        roomCode: gameState.roomCode,
        playerId: gameState.playerId,
      });
      setGameState({
        playerName: '',
        playerId: null,
        roomCode: null,
        room: null,
        isHost: false,
        gameStarted: false,
        error: null,
      });
    }
  }, [gameState.roomCode, gameState.playerId, sendMessage]);

  const startGame = useCallback(() => {
    if (gameState.roomCode && gameState.playerId && gameState.isHost) {
      sendMessage({
        type: 'START_GAME',
        roomCode: gameState.roomCode,
        playerId: gameState.playerId,
      });
    }
  }, [gameState.roomCode, gameState.playerId, gameState.isHost, sendMessage]);

  const clearError = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const startNextRound = useCallback(() => {
    if (gameState.roomCode && gameState.playerId && gameState.isHost) {
      sendMessage({
        type: 'NEXT_ROUND',
        roomCode: gameState.roomCode,
        playerId: gameState.playerId,
      });
    }
  }, [gameState.roomCode, gameState.playerId, gameState.isHost, sendMessage]);

  return {
    ...gameState,
    isConnected,
    wsError,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    startNextRound,
    clearError,
  };
}

export default useGameState;
