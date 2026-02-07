import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from './GameBoard';

const makeCard = (id, value = '5', suit = 'Hearts') => ({ id, value, suit });

const mockSendPlayCards = jest.fn();
const mockFlipFaceDown = jest.fn();
const mockStartNextRound = jest.fn();

const basePlayers = [
  {
    id: 'p1',
    name: 'Alice',
    hand: [makeCard('h1')],
    tableCardsUp: [makeCard('u1')],
    tableCardsDown: [makeCard('d1')],
    roundScore: 0,
    totalScore: 0,
  },
  {
    id: 'p2',
    name: 'Bob',
    hand: [makeCard('h2')],
    tableCardsUp: [],
    tableCardsDown: [],
    roundScore: 0,
    totalScore: 5,
  },
];

const renderBoard = (overrides = {}) => {
  return render(
    <GameBoard
      state={{
        playerId: 'p1',
        roomCode: 'ROOM1',
        centerPile: [makeCard('c1')],
        hand: [makeCard('h1')],
        tableCardsUp: [makeCard('u1')],
        tableCardsDown: [makeCard('d1')],
        players: basePlayers,
        currentTurnPlayerId: 'p1',
        isPlayerTurn: true,
        canFlip: false,
        roundResult: null,
        error: null,
        isHost: true,
        sendPlayCards: mockSendPlayCards,
        flipFaceDown: mockFlipFaceDown,
        startNextRound: mockStartNextRound,
        ...overrides,
      }}
    />
  );
};

beforeEach(() => {
  jest.useFakeTimers();
  mockSendPlayCards.mockClear();
  mockFlipFaceDown.mockClear();
  mockStartNextRound.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('GameBoard', () => {
  it('renders core layout elements', () => {
    renderBoard();

    expect(screen.getByTestId('center-pile')).toBeInTheDocument();
    expect(screen.getByTestId('table-cards')).toBeInTheDocument();
    expect(screen.getByTestId('player-hand')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows current turn indicator', () => {
    renderBoard({ isPlayerTurn: true });

    expect(screen.getByText(/Your turn/i)).toBeInTheDocument();
  });

  it('disables play button when it is not the player turn', () => {
    renderBoard({ isPlayerTurn: false });

    const firstCard = screen.getByTestId('hand-card');
    act(() => {
      fireEvent.click(firstCard);
      jest.runAllTimers();
    });

    const playButton = screen.getByRole('button', { name: /Play Selected/i });
    expect(playButton).toBeDisabled();
  });

  it('dispatches play action with selected cards when allowed', () => {
    renderBoard();

    const firstCard = screen.getByTestId('hand-card');
    act(() => {
      fireEvent.click(firstCard);
      jest.runAllTimers();
    });

    const playButton = screen.getByRole('button', { name: /Play Selected/i });
    fireEvent.click(playButton);

    expect(mockSendPlayCards).toHaveBeenCalledTimes(1);
    expect(mockSendPlayCards).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'h1' }),
    ]);
  });

  it('enables flip button when player has face-down cards, regardless of canFlip flag', () => {
    renderBoard({ canFlip: false, tableCardsDown: [makeCard('d1')] });

    const flipButton = screen.getByRole('button', { name: /Flip Face-Down/i });
    expect(flipButton).toBeEnabled();
  });

  it('triggers flip action for the selected face-down card, falling back to first when none selected', () => {
    renderBoard({ tableCardsDown: [makeCard('d1'), makeCard('d2')], tableCardsUp: [null, null] });

    const downCards = screen.getAllByTestId('table-card-down');

    act(() => {
      fireEvent.click(downCards[1]);
      jest.runAllTimers();
    });

    const flipButton = screen.getByRole('button', { name: /Flip Face-Down/i });
    fireEvent.click(flipButton);

    expect(mockFlipFaceDown).toHaveBeenCalledTimes(1);
    expect(mockFlipFaceDown).toHaveBeenCalledWith('d2');
  });

  it('does not flip when selecting a face-down card whose paired face-up is present, but flip button can still flip an eligible one', () => {
    renderBoard({
      tableCardsUp: [makeCard('u1'), null],
      tableCardsDown: [makeCard('d1'), makeCard('d2')],
    });

    const downCards = screen.getAllByTestId('table-card-down');

    act(() => {
      fireEvent.click(downCards[0]);
      jest.runAllTimers();
    });
    expect(mockFlipFaceDown).not.toHaveBeenCalled();

    const flipButton = screen.getByRole('button', { name: /Flip Face-Down/i });
    fireEvent.click(flipButton);

    expect(mockFlipFaceDown).toHaveBeenCalledTimes(1);
    expect(mockFlipFaceDown).toHaveBeenCalledWith('d2');
  });

  it('shows inline error banner when an error is present', () => {
    renderBoard({ error: 'Not your turn' });

    expect(screen.getByText('Not your turn')).toBeInTheDocument();
  });

  it('renders ScoreBoard when round results are available', () => {
    renderBoard({
      roundResult: {
        winner: { id: 'p2', name: 'Bob' },
        players: basePlayers,
        roundNumber: 2,
      },
    });

    expect(screen.getByText(/Round 2 Complete/i)).toBeInTheDocument();
  });
});
