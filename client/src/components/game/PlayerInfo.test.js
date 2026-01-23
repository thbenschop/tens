import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerInfo from './PlayerInfo';

describe('PlayerInfo', () => {
  const mockPlayer = {
    id: 'p1',
    name: 'Alice',
    hand: [
      { id: 'c1', suit: 'Hearts', value: '5' },
      { id: 'c2', suit: 'Clubs', value: 'K' },
    ],
    tableUp: [
      { id: 'c3', suit: 'Diamonds', value: '9' },
    ],
    tableDown: [
      { id: 'c4', suit: 'Spades', value: '2' },
      { id: 'c5', suit: 'Hearts', value: 'A' },
    ],
    roundScore: 12,
    totalScore: 45,
  };

  it('renders player name', () => {
    render(<PlayerInfo player={mockPlayer} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('displays total card count', () => {
    render(<PlayerInfo player={mockPlayer} />);
    // 2 hand + 1 tableUp + 2 tableDown = 5 total
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows breakdown of card locations', () => {
    render(<PlayerInfo player={mockPlayer} />);
    expect(screen.getByText('🃏 2')).toBeInTheDocument(); // hand
    expect(screen.getByText('⬆️ 1')).toBeInTheDocument(); // tableUp
    expect(screen.getByText('⬇️ 2')).toBeInTheDocument(); // tableDown
  });

  it('highlights current turn player', () => {
    const { container } = render(<PlayerInfo player={mockPlayer} isCurrentTurn={true} />);
    
    expect(screen.getByText('Current Turn')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('border-blue-500');
  });

  it('marks current player with (You)', () => {
    render(<PlayerInfo player={mockPlayer} isCurrentPlayer={true} />);
    expect(screen.getByText('(You)')).toBeInTheDocument();
  });

  it('shows scores when showScores is true', () => {
    render(<PlayerInfo player={mockPlayer} showScores={true} />);
    
    expect(screen.getByText('12')).toBeInTheDocument(); // roundScore
    expect(screen.getByText('45')).toBeInTheDocument(); // totalScore
  });

  it('hides scores when showScores is false', () => {
    render(<PlayerInfo player={mockPlayer} showScores={false} />);
    
    // Should not show the score section
    expect(screen.queryByText('Round:')).not.toBeInTheDocument();
    expect(screen.queryByText('Total:')).not.toBeInTheDocument();
  });

  it('handles player with no cards', () => {
    const emptyPlayer = {
      ...mockPlayer,
      hand: [],
      tableUp: [],
      tableDown: [],
    };
    
    render(<PlayerInfo player={emptyPlayer} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles player with no scores', () => {
    const playerNoScores = {
      ...mockPlayer,
      roundScore: undefined,
      totalScore: undefined,
    };
    
    render(<PlayerInfo player={playerNoScores} showScores={true} />);
    
    // Should show 0 for undefined scores
    const scoreElements = screen.getAllByText('0');
    expect(scoreElements.length).toBeGreaterThanOrEqual(2);
  });

  it('only shows card location icons for non-empty locations', () => {
    const playerOnlyHand = {
      ...mockPlayer,
      tableUp: [],
      tableDown: [],
    };
    
    render(<PlayerInfo player={playerOnlyHand} />);
    
    expect(screen.getByText('🃏 2')).toBeInTheDocument(); // hand
    expect(screen.queryByText(/⬆️/)).not.toBeInTheDocument(); // no tableUp
    expect(screen.queryByText(/⬇️/)).not.toBeInTheDocument(); // no tableDown
  });
});
