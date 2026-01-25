import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableCards from './TableCards';
import { SUITS } from '../../utils/constants';

describe('TableCards', () => {
  const cardsUp = [
    { id: 'u1', value: 'Q', suit: SUITS.DIAMONDS },
    { id: 'u2', value: '3', suit: SUITS.CLUBS },
  ];

  const cardsDown = [
    { id: 'd1', value: 'K', suit: SUITS.SPADES },
    { id: 'd2', value: '7', suit: SUITS.HEARTS },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders face-up cards with suit/value and face-down backs separately', () => {
    render(<TableCards cardsUp={cardsUp} cardsDown={cardsDown} />);

    const upCards = screen.getAllByTestId('table-card-up');
    expect(upCards.map((el) => el.textContent)).toEqual(['Q♦', '3♣']);

    const downCards = screen.getAllByTestId('table-card-down');
    expect(downCards).toHaveLength(cardsDown.length);
    downCards.forEach((card) => {
      expect(card).toHaveTextContent(/back/i);
    });
  });

  it('keeps a face-down card inert while its paired face-up exists', () => {
    const onFlipFaceDown = jest.fn();

    render(
      <TableCards cardsUp={[cardsUp[0]]} cardsDown={cardsDown} onFlipFaceDown={onFlipFaceDown} />
    );

    const downCards = screen.getAllByTestId('table-card-down');

    fireEvent.click(downCards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onFlipFaceDown).not.toHaveBeenCalled();

    fireEvent.click(downCards[1]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onFlipFaceDown).toHaveBeenCalledTimes(1);
    expect(onFlipFaceDown).toHaveBeenCalledWith(cardsDown[1]);
  });

  it('allows selecting a face-down card once its face-up partner is cleared and leaves other slots inert', () => {
    const onFlipFaceDown = jest.fn();

    const { rerender } = render(
      <TableCards
        cardsUp={[cardsUp[0], cardsUp[1]]}
        cardsDown={cardsDown}
        onFlipFaceDown={onFlipFaceDown}
      />
    );

    const initialDownCards = screen.getAllByTestId('table-card-down');

    fireEvent.click(initialDownCards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onFlipFaceDown).not.toHaveBeenCalled();

    rerender(
      <TableCards
        cardsUp={[null, cardsUp[1]]}
        cardsDown={cardsDown}
        onFlipFaceDown={onFlipFaceDown}
      />
    );

    const updatedDownCards = screen.getAllByTestId('table-card-down');

    fireEvent.click(updatedDownCards[0]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onFlipFaceDown).toHaveBeenCalledTimes(1);
    expect(onFlipFaceDown).toHaveBeenCalledWith(cardsDown[0]);

    fireEvent.click(updatedDownCards[1]);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onFlipFaceDown).toHaveBeenCalledTimes(1);
  });
});
