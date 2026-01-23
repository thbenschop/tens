import { renderHook, waitFor, act } from '@testing-library/react';
import useGameState from './useGameState';

// Reusable mock WebSocket with controllable instances
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    MockWebSocket.instances.push(this);
    queueMicrotask(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen(new Event('open'));
    });
  }

  send(data) {
    this.lastSent = data;
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose(new Event('close'));
  }
}
MockWebSocket.instances = [];

describe('useGameState', () => {
  beforeEach(() => {
    MockWebSocket.instances = [];
    global.WebSocket = MockWebSocket;
  });

  afterEach(() => {
    act(() => {
      MockWebSocket.instances.forEach((ws) => ws.close());
    });
    MockWebSocket.instances = [];
  });

  const sendServerMessage = (payload) => {
    const ws = MockWebSocket.instances[0];
    if (ws && ws.onmessage) {
      const event = new MessageEvent('message', { data: JSON.stringify(payload) });
      act(() => {
        ws.onmessage(event);
      });
    }
  };

  test('handles GAME_STARTED and GAME_UPDATE payloads', async () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      const ws = MockWebSocket.instances[0];
      ws.onopen && ws.onopen(new Event('open'));
    });

    // Seed player identity via ROOM_CREATED
    sendServerMessage({
      type: 'ROOM_CREATED',
      playerId: 'p1',
      roomCode: 'ABC123',
      room: { hostId: 'p1', code: 'ABC123' },
    });

    const gamePayload = { players: [{ id: 'p1' }], currentPlayerIndex: 0 };
    sendServerMessage({ type: 'GAME_STARTED', game: gamePayload });

    expect(result.current.gameStarted).toBe(true);
    expect(result.current.game).toEqual(gamePayload);

    const updatedGame = { players: [{ id: 'p1' }, { id: 'p2' }], currentPlayerIndex: 1 };
    sendServerMessage({ type: 'GAME_UPDATE', game: updatedGame });

    expect(result.current.game).toEqual(updatedGame);
  });

  test('handles ROUND_END and ROUND_STARTED payloads', async () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      const ws = MockWebSocket.instances[0];
      ws.onopen && ws.onopen(new Event('open'));
    });

    sendServerMessage({
      type: 'ROUND_END',
      winner: { id: 'p1' },
      scores: [{ id: 'p1', roundScore: 0 }, { id: 'p2', roundScore: 10 }],
      round: 2,
      game: { round: 2 },
    });

    expect(result.current.roundResult).toEqual({
      winner: { id: 'p1' },
      players: [
        { id: 'p1', roundScore: 0 },
        { id: 'p2', roundScore: 10 },
      ],
      roundNumber: 2,
    });
    expect(result.current.game).toEqual({ round: 2 });

    sendServerMessage({ type: 'ROUND_STARTED', game: { round: 3 } });

    expect(result.current.roundResult).toBeNull();
    expect(result.current.game).toEqual({ round: 3 });
  });

  test('derives turn state and player-facing fields from game updates', async () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      const ws = MockWebSocket.instances[0];
      ws.onopen && ws.onopen(new Event('open'));
    });

    sendServerMessage({
      type: 'ROOM_CREATED',
      playerId: 'p1',
      roomCode: 'ROOMX',
      room: { hostId: 'p1', code: 'ROOMX' },
    });

    const gamePayload = {
      players: [
        {
          id: 'p1',
          name: 'Alice',
          hand: [],
          tableCardsUp: [],
          tableCardsDown: [{ id: 'd1', value: '7', suit: 'Clubs' }],
        },
        {
          id: 'p2',
          name: 'Bob',
          hand: [{ id: 'h2', value: '9', suit: 'Spades' }],
          tableCardsUp: [],
          tableCardsDown: [],
        },
      ],
      centerPile: [{ id: 'c1', value: '5', suit: 'Hearts' }],
      currentPlayerIndex: 0,
    };

    sendServerMessage({ type: 'GAME_UPDATE', game: gamePayload });

    await waitFor(() => expect(result.current.players).toHaveLength(2));

    expect(result.current.hand).toEqual([]);
    expect(result.current.tableCardsDown).toHaveLength(1);
    expect(result.current.centerPile[0].id).toBe('c1');
    expect(result.current.isPlayerTurn).toBe(true);
    expect(result.current.canFlip).toBe(true);
  });

  test('sends play and flip commands to the websocket', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      const ws = MockWebSocket.instances[0];
      ws.onopen && ws.onopen(new Event('open'));
    });

    sendServerMessage({
      type: 'ROOM_CREATED',
      playerId: 'p1',
      roomCode: 'ROOM1',
      room: { hostId: 'p1', code: 'ROOM1' },
    });

    act(() => {
      result.current.sendPlayCards([
        { id: 'c1', value: '4', suit: 'Diamonds' },
        { id: 'c2', value: '4', suit: 'Hearts' },
      ], true);
    });

    const ws = MockWebSocket.instances[0];
    expect(JSON.parse(ws.lastSent)).toEqual({
      type: 'PLAY_CARDS',
      cardIds: ['c1', 'c2'],
      afterPickup: true,
    });

    act(() => {
      result.current.flipFaceDown('down1');
    });

    expect(JSON.parse(ws.lastSent)).toEqual({
      type: 'FLIP_FACE_DOWN',
      cardId: 'down1',
    });
  });
});
