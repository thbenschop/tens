import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CenterPile from './CenterPile';
import { SUITS } from '../../utils/constants';

describe('CenterPile', () => {
  const pile = [
    { id: 'p1', value: '4', suit: SUITS.CLUBS },
    { id: 'p2', value: '10', suit: SUITS.HEARTS },
    { id: 'p3', value: 'J', suit: SUITS.SPADES },
  ];

  it('renders cards in order with top card last', () => {
    render(<CenterPile cards={pile} />);

    const rendered = screen.getAllByTestId('center-card');
    const labels = rendered.map((el) => el.textContent);

    expect(labels).toEqual(['4♣', '10♥', 'J♠']);
    expect(rendered[rendered.length - 1]).toHaveTextContent('J♠');
  });
});
