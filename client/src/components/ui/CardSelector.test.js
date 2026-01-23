import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardSelector from './CardSelector';
import { SUITS } from '../../utils/constants';

describe('CardSelector', () => {
  const fiveClubs = { id: 'c1', value: '5', suit: SUITS.CLUBS };
  const fiveHearts = { id: 'c2', value: '5', suit: SUITS.HEARTS };
  const kingSpades = { id: 'c3', value: 'K', suit: SUITS.SPADES };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('toggles selection and notifies selection change', () => {
    const onSelectionChange = jest.fn();
    render(
      <CardSelector
        cards={[fiveClubs, fiveHearts]}
        onSelectionChange={onSelectionChange}
      />
    );

    const cards = screen.getAllByTestId('card');

    fireEvent.click(cards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith([fiveClubs]);
    expect(cards[0]).toHaveClass('card-selected');

    fireEvent.click(cards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    expect(cards[0]).not.toHaveClass('card-selected');
  });

  it('resets selection when attempting to mix values', () => {
    const onSelectionChange = jest.fn();
    render(
      <CardSelector
        cards={[fiveClubs, kingSpades]}
        onSelectionChange={onSelectionChange}
      />
    );

    const cards = screen.getAllByTestId('card');

    fireEvent.click(cards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith([fiveClubs]);

    fireEvent.click(cards[1]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith([kingSpades]);
    expect(cards[0]).not.toHaveClass('card-selected');
    expect(cards[1]).toHaveClass('card-selected');
  });

  it('double tap plays currently selected group', () => {
    const onPlay = jest.fn();
    render(
      <CardSelector
        cards={[fiveClubs, fiveHearts]}
        onPlay={onPlay}
      />
    );

    const cards = screen.getAllByTestId('card');

    fireEvent.click(cards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    fireEvent.click(cards[1]);
    act(() => {
      jest.runOnlyPendingTimers();
    });

    fireEvent.doubleClick(cards[0]);

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith([fiveClubs, fiveHearts]);
  });

  it('double tap plays without altering selection state', () => {
    const onSelectionChange = jest.fn();
    const onPlay = jest.fn();
    render(
      <CardSelector
        cards={[fiveClubs, fiveHearts]}
        onSelectionChange={onSelectionChange}
        onPlay={onPlay}
      />
    );

    const cards = screen.getAllByTestId('card');

    fireEvent.click(cards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    fireEvent.click(cards[1]);
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onSelectionChange).toHaveBeenCalledTimes(2);

    fireEvent.doubleClick(cards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(cards[0]).toHaveClass('card-selected');
    expect(cards[1]).toHaveClass('card-selected');
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith([fiveClubs, fiveHearts]);
  });
});
