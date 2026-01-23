import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import '../../styles/game.css';

function TableCards({ cardsUp = [], cardsDown = [] }) {
  return (
    <div className="table-cards" data-testid="table-cards">
      <div className="table-section">
        <div className="section-label">Face Up</div>
        <div className="table-row">
          {cardsUp.map((card) => (
            <Card key={card.id} card={card} dataTestId="table-card-up" />
          ))}
        </div>
      </div>

      <div className="table-section">
        <div className="section-label">Face Down</div>
        <div className="table-row">
          {cardsDown.map((card) => (
            <Card key={card.id} card={card} faceDown dataTestId="table-card-down" />
          ))}
        </div>
      </div>
    </div>
  );
}

TableCards.propTypes = {
  cardsUp: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      suit: PropTypes.string.isRequired,
    })
  ),
  cardsDown: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      suit: PropTypes.string.isRequired,
    })
  ),
};

export default TableCards;
