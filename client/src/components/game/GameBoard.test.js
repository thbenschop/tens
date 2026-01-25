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

  it('disables flip button when flipping is not allowed', () => {
    renderBoard({ canFlip: false });

    const flipButton = screen.getByRole('button', { name: /Flip Face-Down/i });
    expect(flipButton).toBeDisabled();
  });

  it('triggers flip action for the top face-down card when allowed', () => {
    renderBoard({ canFlip: true, tableCardsDown: [makeCard('d1'), makeCard('d2')] });

    const flipButton = screen.getByRole('button', { name: /Flip Face-Down/i });
    fireEvent.click(flipButton);

    expect(mockFlipFaceDown).toHaveBeenCalledTimes(1);
    expect(mockFlipFaceDown).toHaveBeenCalledWith('d1');
  });

  it('flips a face-down card when its paired face-up slot is empty', () => {
    renderBoard({
      canFlip: true,
      tableCardsUp: [null],
      tableCardsDown: [makeCard('d1')],
    });

    const downCard = screen.getByTestId('table-card-down');

    act(() => {
      fireEvent.click(downCard);
      jest.runAllTimers();
    });

    expect(mockFlipFaceDown).toHaveBeenCalledTimes(1);
    expect(mockFlipFaceDown).toHaveBeenCalledWith('d1');
  });

  it('blocks flipping a face-down card when its paired face-up card still exists', () => {
    renderBoard({
      canFlip: true,
      tableCardsUp: [makeCard('u1')],
      tableCardsDown: [makeCard('d1')],
    });

    const downCard = screen.getByTestId('table-card-down');

    act(() => {
      fireEvent.click(downCard);
      jest.runAllTimers();
    });

    expect(mockFlipFaceDown).not.toHaveBeenCalled();
  });

  it('allows selecting an extra face-down card without a matching face-up slot', () => {
    renderBoard({
      canFlip: true,
      tableCardsUp: [makeCard('u1')],
      tableCardsDown: [makeCard('d1'), makeCard('d2')],
    });

    const downCards = screen.getAllByTestId('table-card-down');

    act(() => {
      fireEvent.click(downCards[0]);
      jest.runAllTimers();
    });
    expect(mockFlipFaceDown).not.toHaveBeenCalled();

    act(() => {
      fireEvent.click(downCards[1]);
      jest.runAllTimers();
    });

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
