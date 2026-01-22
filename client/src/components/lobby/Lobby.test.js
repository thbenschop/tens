import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Lobby from './Lobby';

describe('Lobby Component', () => {
  const mockRoom = {
    code: 'ABC123',
    hostId: 'player-1',
    players: [
      { id: 'player-1', name: 'Host Player' },
      { id: 'player-2', name: 'Player 2' },
      { id: 'player-3', name: 'Player 3' },
    ],
  };

  test('renders nothing when no room provided', () => {
    const { container } = render(<Lobby room={null} playerId="player-1" isHost={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders room code', () => {
    render(
      <Lobby
        room={mockRoom}
        playerId="player-1"
        isHost={true}
        onStartGame={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );
    
    expect(screen.getByText('ABC123')).toBeInTheDocument();
  });

  test('renders player list', () => {
    render(
      <Lobby
        room={mockRoom}
        playerId="player-1"
        isHost={true}
        onStartGame={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );
    
    expect(screen.getByText('Host Player')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('Players (3/10)')).toBeInTheDocument();
  });

  test('highlights current player', () => {
    render(
      <Lobby
        room={mockRoom}
        playerId="player-2"
        isHost={false}
        onStartGame={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );
    
    const youBadges = screen.getAllByText('YOU');
    expect(youBadges).toHaveLength(1);
  });

  test('shows host badge', () => {
    render(
      <Lobby
        room={mockRoom}
        playerId="player-2"
        isHost={false}
        onStartGame={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );
    
    expect(screen.getByText('HOST')).toBeInTheDocument();
  });

  test('shows start game button for host with enough players', () => {
    render(
      <Lobby
        room={mockRoom}
        playerId="player-1"
        isHost={true}
        onStartGame={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );
    
    const button = screen.getByRole('button', { name: /Start Game/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test('disables start game button when less than 3 players', () => {
    const smallRoom = {
      ...mockRoom,
      players: [
        { id: 'player-1', name: 'Host Player' },
        { id: 'player-2', name: 'Player 2' },
      ],
    };

    render(
      <Lobby
        room={smallRoom}
        playerId="player-1"
        isHost={true}
        onStartGame={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );
    
    const button = screen.getByRole('button', { name: /Waiting for players.../i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/Need at least 3 players to start/i)).toBeInTheDocument();
  });

  test('shows waiting message for non-host players', () => {
    render(
      <Lobby
        room={mockRoom}
        playerId="player-2"
        isHost={false}
        onStartGame={jest.fn()}
        onLeaveRoom={jest.fn()}
      />
    );
    
    expect(screen.getByText(/Waiting for host to start the game.../i)).toBeInTheDocument();
  });

  test('calls onStartGame when start button clicked', () => {
    const mockStartGame = jest.fn();
    render(
      <Lobby
        room={mockRoom}
        playerId="player-1"
        isHost={true}
        onStartGame={mockStartGame}
        onLeaveRoom={jest.fn()}
      />
    );
    
    const button = screen.getByRole('button', { name: /Start Game/i });
    fireEvent.click(button);
    
    expect(mockStartGame).toHaveBeenCalled();
  });

  test('calls onLeaveRoom when leave button clicked', () => {
    const mockLeaveRoom = jest.fn();
    render(
      <Lobby
        room={mockRoom}
        playerId="player-1"
        isHost={true}
        onStartGame={jest.fn()}
        onLeaveRoom={mockLeaveRoom}
      />
    );
    
    const button = screen.getByRole('button', { name: /Leave Room/i });
    fireEvent.click(button);
    
    expect(mockLeaveRoom).toHaveBeenCalled();
  });
});
