import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JoinRoom from './JoinRoom';

describe('JoinRoom Component', () => {
  test('renders join room form', () => {
    render(<JoinRoom onJoinRoom={jest.fn()} />);
    
    expect(screen.getByText('Join a Room')).toBeInTheDocument();
    expect(screen.getByLabelText(/Room Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Room/i })).toBeInTheDocument();
  });

  test('button is disabled when fields are empty', () => {
    render(<JoinRoom onJoinRoom={jest.fn()} />);
    
    const button = screen.getByRole('button', { name: /Join Room/i });
    expect(button).toBeDisabled();
  });

  test('button is disabled when room code is less than 6 characters', () => {
    render(<JoinRoom onJoinRoom={jest.fn()} />);
    
    const roomCodeInput = screen.getByLabelText(/Room Code/i);
    const nameInput = screen.getByLabelText(/Your Name/i);
    const button = screen.getByRole('button', { name: /Join Room/i });
    
    fireEvent.change(roomCodeInput, { target: { value: 'ABC12' } });
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    
    expect(button).toBeDisabled();
  });

  test('button is enabled when all fields are valid', () => {
    render(<JoinRoom onJoinRoom={jest.fn()} />);
    
    const roomCodeInput = screen.getByLabelText(/Room Code/i);
    const nameInput = screen.getByLabelText(/Your Name/i);
    const button = screen.getByRole('button', { name: /Join Room/i });
    
    fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    
    expect(button).not.toBeDisabled();
  });

  test('converts room code to uppercase', () => {
    render(<JoinRoom onJoinRoom={jest.fn()} />);
    
    const roomCodeInput = screen.getByLabelText(/Room Code/i);
    
    fireEvent.change(roomCodeInput, { target: { value: 'abc123' } });
    
    expect(roomCodeInput.value).toBe('ABC123');
  });

  test('limits room code to 6 characters', () => {
    render(<JoinRoom onJoinRoom={jest.fn()} />);
    
    const roomCodeInput = screen.getByLabelText(/Room Code/i);
    
    fireEvent.change(roomCodeInput, { target: { value: 'ABCDEFGH' } });
    
    expect(roomCodeInput.value).toBe('ABCDEF');
  });

  test('calls onJoinRoom with room code and player name on submit', () => {
    const mockJoinRoom = jest.fn();
    render(<JoinRoom onJoinRoom={mockJoinRoom} />);
    
    const roomCodeInput = screen.getByLabelText(/Room Code/i);
    const nameInput = screen.getByLabelText(/Your Name/i);
    const button = screen.getByRole('button', { name: /Join Room/i });
    
    fireEvent.change(roomCodeInput, { target: { value: 'ABC123' } });
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(button);
    
    expect(mockJoinRoom).toHaveBeenCalledWith('ABC123', 'TestPlayer');
  });

  test('displays error message when provided', () => {
    render(<JoinRoom onJoinRoom={jest.fn()} error="Room not found" />);
    
    expect(screen.getByText('Room not found')).toBeInTheDocument();
  });
});
