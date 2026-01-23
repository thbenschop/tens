import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import CardSelector from '../ui/CardSelector';
import { sortCards } from '../../utils/cardUtils';
import '../../styles/game.css';

function PlayerHand({ cards = [], onSelectionChange, onPlay }) {
  const sortedCards = useMemo(() => sortCards(cards), [cards]);

  return (
    <div className="hand-row" data-testid="player-hand">
      <CardSelector
        cards={sortedCards}
        onSelectionChange={onSelectionChange}
        onPlay={onPlay}
        cardTestId="hand-card"
      />
    </div>
  );
}

PlayerHand.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      suit: PropTypes.string.isRequired,
      faceDown: PropTypes.bool,
      isFaceDown: PropTypes.bool,
    })
  ),
  onSelectionChange: PropTypes.func,
  onPlay: PropTypes.func,
};

export default PlayerHand;
