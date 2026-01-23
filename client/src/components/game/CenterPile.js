import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import '../../styles/game.css';

function CenterPile({ cards = [] }) {
  return (
    <div className="center-pile" data-testid="center-pile">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className="center-card-layer"
          style={{
            zIndex: index + 1,
            transform: `translateY(-${index * 4}px) translateX(${index * 2}px)`,
          }}
        >
          <Card card={card} dataTestId="center-card" />
        </div>
      ))}
    </div>
  );
}

CenterPile.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      suit: PropTypes.string.isRequired,
    })
  ),
};

export default CenterPile;
