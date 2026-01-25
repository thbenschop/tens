import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import CardSelector from '../ui/CardSelector';
import '../../styles/game.css';

function TableCards({
  cardsUp = [],
  cardsDown = [],
  onFaceUpSelectionChange,
  onPlayFaceUp,
  onFlipFaceDown,
}) {
  const safeCardsUp = cardsUp.filter(Boolean);

  return (
    <div className="table-cards" data-testid="table-cards">
      <div className="table-section">
        <div className="section-label">Face Up</div>
        <CardSelector
          cards={safeCardsUp}
          onSelectionChange={onFaceUpSelectionChange}
          onPlay={onPlayFaceUp}
          cardTestId="table-card-up"
        />
      </div>

      <div className="table-section">
        <div className="section-label">Face Down</div>
        <div className="table-row">
          {cardsDown.map((card, index) => {
            const hasFaceUpPair = Boolean(cardsUp[index]);

            const faceDownHandlers = hasFaceUpPair
              ? {}
              : {
                  onSelect: onFlipFaceDown,
                  onPlay: onFlipFaceDown,
                };

            return (
              <Card
                key={card.id}
                card={card}
                faceDown
                dataTestId="table-card-down"
                {...faceDownHandlers}
              />
            );
          })}
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
  onFaceUpSelectionChange: PropTypes.func,
  onPlayFaceUp: PropTypes.func,
  onFlipFaceDown: PropTypes.func,
};

export default TableCards;
