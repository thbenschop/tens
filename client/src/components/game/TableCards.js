import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import { canSelectTogether } from '../../utils/cardUtils';
import '../../styles/game.css';

function TableCards({
  cardsUp = [],
  cardsDown = [],
  onFaceUpSelectionChange,
  onPlayFaceUp,
  onFaceDownSelect,
  selectedFaceDownId,
}) {
  const [selectedFaceUpIds, setSelectedFaceUpIds] = useState([]);

  const slots = useMemo(() => {
    const maxLength = Math.max(cardsDown.length, cardsUp.length);
    return Array.from({ length: maxLength }).map((_, index) => ({
      down: cardsDown[index],
      up: cardsUp[index],
      key: cardsDown[index]?.id || cardsUp[index]?.id || `slot-${index}`,
    }));
  }, [cardsDown, cardsUp]);

  useEffect(() => {
    const validFaceUpIds = cardsUp.filter(Boolean).map((card) => card.id);
    const filteredIds = selectedFaceUpIds.filter((id) => validFaceUpIds.includes(id));

    if (filteredIds.length !== selectedFaceUpIds.length) {
      setSelectedFaceUpIds(filteredIds);
      onFaceUpSelectionChange?.(cardsUp.filter((card) => card && filteredIds.includes(card.id)));
    }
  }, [cardsUp, onFaceUpSelectionChange, selectedFaceUpIds]);

  const emitFaceUpSelection = (ids) => {
    const uniqueIds = Array.from(new Set(ids));
    const nextSelection = cardsUp.filter((card) => card && uniqueIds.includes(card.id));
    onFaceUpSelectionChange?.(nextSelection);
    return uniqueIds;
  };

  const handleToggleFaceUp = (card) => {
    if (!card) return;

    setSelectedFaceUpIds((prev) => {
      const alreadySelected = prev.includes(card.id);
      let nextIds = alreadySelected ? prev.filter((id) => id !== card.id) : [...prev, card.id];
      const candidateCards = cardsUp.filter((item) => item && nextIds.includes(item.id));

      if (!canSelectTogether(candidateCards)) {
        nextIds = [card.id];
      }

      return emitFaceUpSelection(nextIds);
    });
  };

  const handlePlayFaceUp = (primaryCard) => {
    if (!onPlayFaceUp) return;

    const idSet = new Set(selectedFaceUpIds);
    if (primaryCard?.id) {
      idSet.add(primaryCard.id);
    }

    if (!idSet.size) return;

    const orderedSelection = cardsUp.filter((card) => card && idSet.has(card.id));
    onPlayFaceUp(orderedSelection);
  };

  return (
    <div className="table-cards" data-testid="table-cards">
      <div className="table-section table-section-stacked">
        <div className="section-label">Table Cards</div>

        <div className="table-row table-row-stacked" data-testid="table-row-stacked">
          {slots.map((slot, index) => {
            const hasFaceUpPair = Boolean(slot.up);
            const faceDownHandlers = hasFaceUpPair
              ? {}
              : {
                  onSelect: () => onFaceDownSelect?.(slot.down, index),
                };

            return (
              <div className="table-slot" data-testid="table-slot" data-slot-index={index} key={slot.key}>
                <div className="card-stack">
                  {slot.down && (
                    <div className="card-stack-back">
                      <Card
                        card={slot.down}
                        faceDown
                        selected={selectedFaceDownId === slot.down.id}
                        dataTestId="table-card-down"
                        {...faceDownHandlers}
                      />
                    </div>
                  )}

                  {slot.up && (
                    <div className="card-stack-front">
                      <Card
                        card={slot.up}
                        selected={selectedFaceUpIds.includes(slot.up.id)}
                        onSelect={handleToggleFaceUp}
                        onPlay={() => handlePlayFaceUp(slot.up)}
                        dataTestId="table-card-up"
                      />
                    </div>
                  )}
                </div>
              </div>
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
  onFaceDownSelect: PropTypes.func,
  selectedFaceDownId: PropTypes.string,
};

export default TableCards;
