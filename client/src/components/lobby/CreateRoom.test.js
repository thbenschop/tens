import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateRoom from './CreateRoom';

describe('CreateRoom Component', () => {
  test('renders create room form', () => {
    render(<CreateRoom onCreateRoom={jest.fn()} />);
    
    expect(screen.getByText('Create a Room')).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Room/i })).toBeInTheDocument();
  });

  test('button is disabled when name is empty', () => {
    render(<CreateRoom onCreateRoom={jest.fn()} />);
    
    const button = screen.getByRole('button', { name: /Create Room/i });
    expect(button).toBeDisabled();
  });

  test('button is enabled when name is entered', () => {
    render(<CreateRoom onCreateRoom={jest.fn()} />);
    
    const input = screen.getByLabelText(/Your Name/i);
    const button = screen.getByRole('button', { name: /Create Room/i });
    
    fireEvent.change(input, { target: { value: 'TestPlayer' } });
    expect(button).not.toBeDisabled();
  });

  test('calls onCreateRoom with player name on submit', () => {
    const mockCreateRoom = jest.fn();
    render(<CreateRoom onCreateRoom={mockCreateRoom} />);
    
    const input = screen.getByLabelText(/Your Name/i);
    const button = screen.getByRole('button', { name: /Create Room/i });
    
    fireEvent.change(input, { target: { value: 'TestPlayer' } });
    fireEvent.click(button);
    
    expect(mockCreateRoom).toHaveBeenCalledWith('TestPlayer');
  });

  test('trims whitespace from player name', () => {
    const mockCreateRoom = jest.fn();
    render(<CreateRoom onCreateRoom={mockCreateRoom} />);
    
    const input = screen.getByLabelText(/Your Name/i);
    const button = screen.getByRole('button', { name: /Create Room/i });
    
    fireEvent.change(input, { target: { value: '  TestPlayer  ' } });
    fireEvent.click(button);
    
    expect(mockCreateRoom).toHaveBeenCalledWith('TestPlayer');
  });

  test('displays error message when provided', () => {
    render(<CreateRoom onCreateRoom={jest.fn()} error="An error occurred" />);
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });
});
