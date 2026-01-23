import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreBoard from './ScoreBoard';

describe('ScoreBoard', () => {
  const mockRoundResult = {
    winner: { id: 'p1', name: 'Alice' },
    players: [
      { id: 'p1', name: 'Alice', roundScore: 0, totalScore: 15 },
      { id: 'p2', name: 'Bob', roundScore: 23, totalScore: 45 },
      { id: 'p3', name: 'Charlie', roundScore: 17, totalScore: 38 },
    ],
    roundNumber: 2,
  };

  const mockOnNextRound = jest.fn();

  beforeEach(() => {
    mockOnNextRound.mockClear();
  });

  it('renders nothing when no round result', () => {
    const { container } = render(
      <ScoreBoard roundResult={null} onNextRound={mockOnNextRound} isHost={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays round number and winner', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={true} />);
    
    expect(screen.getByText(/Round 2 Complete!/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice wins the round!/i)).toBeInTheDocument();
  });

  it('displays all players with their scores', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={true} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    
    // Check scores are displayed
    expect(screen.getByText('15')).toBeInTheDocument(); // Alice total
    expect(screen.getByText('45')).toBeInTheDocument(); // Bob total
    expect(screen.getByText('38')).toBeInTheDocument(); // Charlie total
  });

  it('sorts players by total score', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={true} />);
    
    const playerNames = screen.getAllByRole('row').slice(1).map(row => 
      row.querySelector('td')?.textContent
    );
    
    // Alice (15) should be first, Charlie (38) second, Bob (45) third
    expect(playerNames[0]).toContain('Alice');
    expect(playerNames[1]).toContain('Charlie');
    expect(playerNames[2]).toContain('Bob');
  });

  it('shows winner with 0 round score', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={true} />);
    
    const rows = screen.getAllByRole('row');
    const aliceRow = rows.find(row => row.textContent?.includes('Alice'));
    
    expect(aliceRow).toHaveTextContent('0');
  });

  it('shows next round button for host', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={true} />);
    
    const button = screen.getByRole('button', { name: /Start Next Round/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onNextRound when host clicks button', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={true} />);
    
    const button = screen.getByRole('button', { name: /Start Next Round/i });
    fireEvent.click(button);
    
    expect(mockOnNextRound).toHaveBeenCalledTimes(1);
  });

  it('shows waiting message for non-host', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={false} />);
    
    expect(screen.getByText(/Waiting for host to start next round/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start Next Round/i })).not.toBeInTheDocument();
  });

  it('highlights leading player in subsequent rounds', () => {
    render(<ScoreBoard roundResult={mockRoundResult} onNextRound={mockOnNextRound} isHost={true} />);
    
    // Alice should have the "Leading" badge since she has lowest score and it's round 2
    expect(screen.getByText('Leading')).toBeInTheDocument();
  });
});
