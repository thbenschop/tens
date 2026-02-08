import { useState, useCallback, useMemo, useEffect } from 'react';
import useWebSocket from './useWebSocket';
import { canFlipFaceDown } from '../utils/gameLogic';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';

const normalizePlayer = (player) => ({
  id: player?.id || player?.ID || '',
  name: player?.name || player?.Name || 'Player',
  hand: player?.hand || player?.Hand || [],
  tableCardsUp: player?.tableCardsUp || player?.TableCardsUp || [],
  tableCardsDown: player?.tableCardsDown || player?.TableCardsDown || [],
  roundScore: player?.roundScore ?? player?.RoundScore ?? 0,
  totalScore: player?.totalScore ?? player?.TotalScore ?? 0,
});

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
          roomCode: data.room?.code || prev.roomCode,
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
          gameStarted: prev.gameStarted || !!data.game,
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
        console.error('Server error received:', data.message);
        setGameState((prev) => ({
          ...prev,
          error: data.message,
        }));
        break;

      default:
        break;
    }
  }, []);

  const {
    isConnected,
    isConnecting,
    error: wsError,
    connectionAttempts,
    sendMessage,
  } = useWebSocket(
    WS_URL,
    {
      onMessage: (data) => {
        handleMessage(data);
      },
    }
  );

  useEffect(() => {
    if (wsError) {
      console.error('WebSocket error encountered', wsError);
    }
  }, [wsError]);

  const normalizedPlayers = useMemo(() => {
    const players = gameState.game?.players || gameState.game?.Players || [];
    return players.map(normalizePlayer).filter((player) => player.id);
  }, [gameState.game]);

  const currentPlayer = useMemo(
    () => normalizedPlayers.find((player) => player.id === gameState.playerId) || null,
    [normalizedPlayers, gameState.playerId]
  );

  const currentTurnPlayerId = useMemo(() => {
    const currentIndex =
      gameState.game?.currentPlayerIndex ?? gameState.game?.CurrentPlayerIndex;

    if (currentIndex === null || currentIndex === undefined) {
      return null;
    }

    return normalizedPlayers[currentIndex]?.id || null;
  }, [gameState.game, normalizedPlayers]);

  const isPlayerTurn = currentTurnPlayerId === gameState.playerId;

  const centerPile = useMemo(
    () => gameState.game?.centerPile || gameState.game?.CenterPile || [],
    [gameState.game]
  );

  const tableCardsUp = currentPlayer?.tableCardsUp || [];
  const tableCardsDown = currentPlayer?.tableCardsDown || [];
  const hand = currentPlayer?.hand || [];
  const canFlip = canFlipFaceDown(currentPlayer);

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
        game: null,
        roundResult: null,
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

  const sendPlayCards = useCallback(
    (cards = [], afterPickup = false) => {
      const cardIds = cards
        .map((card) => card?.id || card?.ID)
        .filter(Boolean);

      if (!cardIds.length) return;

      sendMessage({
        type: 'PLAY_CARDS',
        cardIds,
        afterPickup,
      });
    },
    [sendMessage]
  );

  const flipFaceDown = useCallback(
    (cardId) => {
      if (!cardId) return;

      sendMessage({
        type: 'FLIP_FACE_DOWN',
        cardId,
      });
    },
    [sendMessage]
  );

  return {
    ...gameState,
    isConnected,
    isConnecting,
    connectionAttempts,
    wsError,
    players: normalizedPlayers,
    hand,
    tableCardsUp,
    tableCardsDown,
    centerPile,
    currentTurnPlayerId,
    isPlayerTurn,
    canFlip,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    startNextRound,
    sendPlayCards,
    flipFaceDown,
    clearError,
  };
}

export default useGameState;
