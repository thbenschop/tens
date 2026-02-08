import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from './App';

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.send = jest.fn();
    MockWebSocket.instances.push(this);
  }

  open() {
    this.readyState = WebSocket.OPEN;
    this.onopen && this.onopen(new Event('open'));
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose && this.onclose(new Event('close'));
  }

  error() {
    this.readyState = WebSocket.CLOSED;
    this.onerror && this.onerror(new Event('error'));
  }

  emitMessage(data) {
    const event = new MessageEvent('message', { data: JSON.stringify(data) });
    this.onmessage && this.onmessage(event);
  }
}

MockWebSocket.instances = [];
MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

const getSocket = () => MockWebSocket.instances[MockWebSocket.instances.length - 1];
const sendServer = (payload) => {
  const socket = getSocket();
  act(() => {
    socket.emitMessage(payload);
  });
};

describe('App integration', () => {
  let realWebSocket;

  beforeEach(() => {
    jest.useFakeTimers();
    realWebSocket = global.WebSocket;
    MockWebSocket.instances = [];
    global.WebSocket = MockWebSocket;
  });

  afterEach(() => {
    act(() => {
      MockWebSocket.instances.forEach((ws) => ws.close());
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    global.WebSocket = realWebSocket;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('keeps status light and helper text without showing connection banner text', async () => {
    render(<App />);

    const statusLight = screen.getByTestId('connection-status');

    expect(screen.getByText(/Clear the Deck/i)).toBeInTheDocument();
    expect(statusLight).toHaveAttribute('aria-label', expect.stringMatching(/Connecting/i));
    expect(screen.queryByText(/^Connecting$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Connecting to server/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: /Connecting to server/i })
    ).not.toBeInTheDocument();
  });

  test('relies on the status light instead of alerts when socket errors occur', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    act(() => {
      getSocket().error();
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    const statusLight = screen.getByTestId('connection-status');

    await waitFor(() => {
      expect(statusLight.getAttribute('aria-label')).toMatch(/Reconnecting/i);
    });

    expect(screen.queryByText(/^Reconnecting$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Reconnecting to server/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('flows from lobby to game and shows round end scoreboard', async () => {
    render(<App />);

    act(() => {
      getSocket().open();
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Room/i }));

    fireEvent.change(screen.getByLabelText(/Your Name/i), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: /^Create Room$/i }));

    sendServer({
      type: 'ROOM_CREATED',
      playerId: 'p1',
      roomCode: 'ROOM1',
      room: { code: 'ROOM1', hostId: 'p1', players: [{ id: 'p1', name: 'Alice' }] },
    });

    await waitFor(() => expect(screen.getByText(/Game Lobby/i)).toBeInTheDocument());

    const game = {
      players: [
        { id: 'p1', name: 'Alice', hand: [], tableCardsUp: [], tableCardsDown: [], roundScore: 0, totalScore: 0 },
      ],
      centerPile: [],
      currentPlayerIndex: 0,
    };

    sendServer({ type: 'GAME_STARTED', game });

    await waitFor(() => expect(screen.getByText(/Clear the Deck/i)).toBeInTheDocument());

    sendServer({
      type: 'ROUND_END',
      winner: { id: 'p1', name: 'Alice' },
      scores: [{ id: 'p1', name: 'Alice', roundScore: 0, totalScore: 0 }],
      round: 1,
      game: { ...game, round: 1 },
    });

    await waitFor(() => expect(screen.getByText(/Round 1 Complete/i)).toBeInTheDocument());
    expect(screen.getByText(/Alice wins the round/i)).toBeInTheDocument();
  });

  test('does not render a global error alert for server errors', async () => {
    render(<App />);

    act(() => {
      getSocket().open();
    });

    sendServer({ type: 'ERROR', message: 'Bad request' });

    await waitFor(() => {
      expect(screen.queryByText(/Bad request/)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /×/i })).not.toBeInTheDocument();
  });
});

