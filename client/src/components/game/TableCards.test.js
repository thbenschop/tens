import React from 'react';
import { render, screen } from '@testing-library/react';
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
});
