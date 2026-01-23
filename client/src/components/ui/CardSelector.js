import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import { canSelectTogether } from '../../utils/cardUtils';
import '../../styles/cards.css';

function CardSelector({ cards = [], onSelectionChange, onPlay, cardTestId = 'card' }) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const validIds = cards.map((card) => card.id);
    const filteredIds = selectedIds.filter((id) => validIds.includes(id));
    if (filteredIds.length !== selectedIds.length) {
      setSelectedIds(filteredIds);
      onSelectionChange?.(cards.filter((card) => filteredIds.includes(card.id)));
    }
  }, [cards, onSelectionChange, selectedIds]);

  const emitSelection = (ids) => {
    const uniqueIds = Array.from(new Set(ids));
    const nextSelection = cards.filter((card) => uniqueIds.includes(card.id));
    onSelectionChange?.(nextSelection);
    return uniqueIds;
  };

  const handleToggleSelect = (card) => {
    if (!card) return;

    setSelectedIds((prev) => {
      const alreadySelected = prev.includes(card.id);
      let nextIds = alreadySelected ? prev.filter((id) => id !== card.id) : [...prev, card.id];
      const candidateCards = cards.filter((item) => nextIds.includes(item.id));

      if (!canSelectTogether(candidateCards)) {
        nextIds = [card.id];
      }

      return emitSelection(nextIds);
    });
  };

  const handlePlay = (primaryCard) => {
    if (!onPlay) return;

    const idSet = new Set(selectedIds);
    if (primaryCard?.id) {
      idSet.add(primaryCard.id);
    }

    if (!idSet.size) return;

    const orderedSelection = cards.filter((card) => idSet.has(card.id));
    onPlay(orderedSelection);
  };

  return (
    <div className="card-selector" data-testid="card-selector">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          selected={selectedIds.includes(card.id)}
          onSelect={handleToggleSelect}
          onPlay={() => handlePlay(card)}
          dataTestId={cardTestId}
        />
      ))}
    </div>
  );
}

CardSelector.propTypes = {
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
  cardTestId: PropTypes.string,
};

export default CardSelector;
