import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
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

  it('pairs face-up and face-down cards in the same overlap slot for each index', () => {
    render(<TableCards cardsUp={cardsUp} cardsDown={cardsDown} />);

    const slots = screen.getAllByTestId('table-slot');
    expect(slots).toHaveLength(cardsDown.length);

    const firstSlot = slots[0];
    const slotDown = within(firstSlot).getByTestId('table-card-down');
    const slotUp = within(firstSlot).getByTestId('table-card-up');

    expect(slotDown).toBeInTheDocument();
    expect(slotUp).toBeInTheDocument();

    const stack = firstSlot.querySelector('.card-stack');
    expect(stack).not.toBeNull();
    expect(firstSlot.querySelector('.card-stack-back')).toContainElement(slotDown);
    expect(firstSlot.querySelector('.card-stack-front')).toContainElement(slotUp);
  });

  it('keeps a face-up card anchored to its matching slot index, leaving earlier empty slots untouched', () => {
    render(<TableCards cardsUp={[null, cardsUp[1]]} cardsDown={cardsDown} />);

    const slots = screen.getAllByTestId('table-slot');
    expect(within(slots[0]).queryByTestId('table-card-up')).toBeNull();

    const slotOneUp = within(slots[1]).getByTestId('table-card-up');
    expect(slotOneUp).toHaveTextContent('3♣');
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
