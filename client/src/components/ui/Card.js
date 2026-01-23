import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getSuitSymbol, getCardColor } from '../../utils/cardUtils';
import '../../styles/cards.css';

const isFaceDown = (card, faceDown) => faceDown || card?.isFaceDown || card?.faceDown;
const SINGLE_TAP_DELAY_MS = 400;

function Card({ card, selected = false, faceDown = false, onSelect, onPlay, dataTestId = 'card' }) {
  if (!card) return null;

  const faceDownStatus = isFaceDown(card, faceDown);
  const suitSymbol = getSuitSymbol(card.suit);
  const shortLabel = `${card.value}${suitSymbol}`;
  const colorClass = faceDownStatus ? '' : getCardColor(card);
  const clickTimeoutRef = useRef();

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = (event) => {
    event.preventDefault();
    if (event.detail > 1 && clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    if (clickTimeoutRef.current) return;

    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      onSelect?.(card);
    }, SINGLE_TAP_DELAY_MS);
  };

  const handleDoubleClick = (event) => {
    event.preventDefault();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    onPlay?.(card);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(card);
    }
  };

  return (
    <div
      className={`playing-card ${selected ? 'card-selected' : ''} ${faceDownStatus ? 'card-down' : 'card-up'} ${colorClass || ''}`.trim()}
      data-testid={dataTestId}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      {faceDownStatus ? (
        <div className="card-back" data-testid="card-back" aria-label="Card back">
          Card Back
        </div>
      ) : (
        <div className="card-face" data-testid="card-face" aria-label={`${card.value} of ${card.suit}`}>
          <span className="card-value">{shortLabel}</span>
        </div>
      )}
    </div>
  );
}

Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    suit: PropTypes.string.isRequired,
    isFaceDown: PropTypes.bool,
    faceDown: PropTypes.bool,
  }).isRequired,
  selected: PropTypes.bool,
  faceDown: PropTypes.bool,
  onSelect: PropTypes.func,
  onPlay: PropTypes.func,
  dataTestId: PropTypes.string,
};

export default Card;
