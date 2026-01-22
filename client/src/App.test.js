import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import useGameState from './hooks/useGameState';

//Mock the custom hooks
jest.mock('./hooks/useGameState');

jest.mock('./components/lobby/CreateRoom', () => {
  return function CreateRoom() {
    return <div data-testid="create-room">Create Room Component</div>;
  };
});

jest.mock('./components/lobby/JoinRoom', () => {
  return function JoinRoom() {
    return <div data-testid="join-room">Join Room Component</div>;
  };
});

jest.mock('./components/lobby/Lobby', () => {
  return function Lobby() {
    return <div data-testid="lobby">Lobby Component</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    useGameState.mockReturnValue({
      room: null,
      playerId: null,
      isHost: false,
      gameStarted: false,
      error: null,
      isConnected: true,
      wsError: null,
      createRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      startGame: jest.fn(),
      clearError: jest.fn(),
    });
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Clear the Deck')).toBeInTheDocument();
  });

  test('shows main menu by default', () => {
    render(<App />);
    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Room/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Room/i })).toBeInTheDocument();
  });

  test('displays connection status', () => {
    render(<App />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });
});

