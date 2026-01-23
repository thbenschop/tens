import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerHand from './PlayerHand';
import { SUITS } from '../../utils/constants';
import { sortCards } from '../../utils/cardUtils';

describe('PlayerHand', () => {
  const cards = [
    { id: 'c1', value: '5', suit: SUITS.SPADES },
    { id: 'c2', value: 'A', suit: SUITS.CLUBS },
    { id: 'c3', value: '5', suit: SUITS.DIAMONDS },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sorts cards before rendering', () => {
    render(<PlayerHand cards={cards} />);
    const handCards = screen.getAllByTestId('hand-card');
    const order = handCards.map((el) => el.textContent);

    expect(order).toEqual(['A♣', '5♦', '5♠']);
  });

  it('highlights selected card and bubbles selection changes', () => {
    const onSelectionChange = jest.fn();
    render(<PlayerHand cards={cards} onSelectionChange={onSelectionChange} />);

    const firstCard = screen.getAllByTestId('hand-card')[0];
    fireEvent.click(firstCard);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onSelectionChange).toHaveBeenLastCalledWith([cards[1]]);
    expect(firstCard).toHaveClass('card-selected');
  });

  it('double tap triggers onPlay with selected cards', () => {
    const onPlay = jest.fn();
    const pair = [
      { id: 'p1', value: '9', suit: SUITS.HEARTS },
      { id: 'p2', value: '9', suit: SUITS.CLUBS },
    ];

    render(<PlayerHand cards={pair} onPlay={onPlay} />);
    const handCards = screen.getAllByTestId('hand-card');

    fireEvent.click(handCards[0]);
    fireEvent.click(handCards[1]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    fireEvent.doubleClick(handCards[0]);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onPlay).toHaveBeenCalledWith(sortCards(pair));
  });
});
