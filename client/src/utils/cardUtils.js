/**
 * Card utility functions for sorting, grouping, and display
 */

import { SUITS, CARD_VALUES, SUIT_SYMBOLS, CARD_POINTS, SUIT_ORDER, SUIT_COLORS } from './constants';

const getFaceValue = (cardOrValue) => (
  typeof cardOrValue === 'string' ? cardOrValue : cardOrValue?.value
);

export const getCardValue = (cardOrValue) => {
  const face = getFaceValue(cardOrValue);
  return CARD_VALUES[face] || 0;
};

export const getCardPoints = (cardOrValue) => {
  const face = getFaceValue(cardOrValue);
  return CARD_POINTS[face] || 0;
};

export const getSuitSymbol = (suit) => SUIT_SYMBOLS[suit] || '';

const isCardValidForSort = (card) => {
  if (!card || card.isFaceDown || card.faceDown) return false;
  const value = getCardValue(card);
  return value > 0 && SUIT_ORDER[card.suit] !== undefined;
};

/**
 * Sort cards by value (low to high) and then by suit
 * @param {Array} cards - Array of card objects
 * @returns {Array} Sorted array of cards
 */
export const sortCards = (cards) => {
  if (!cards || cards.length === 0) return [];

  return [...cards].sort((a, b) => {
    const aValid = isCardValidForSort(a);
    const bValid = isCardValidForSort(b);

    if (!aValid && !bValid) return 0;
    if (!aValid) return 1;
    if (!bValid) return -1;

    const valueA = getCardValue(a);
    const valueB = getCardValue(b);

    if (valueA !== valueB) return valueA - valueB;
    return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
  });
};

/**
 * Group cards by their value
 * @param {Array} cards - Array of card objects
 * @returns {Object} Object with values as keys and arrays of cards as values
 */
export const groupByValue = (cards) => {
  if (!cards || cards.length === 0) return {};

  return cards.reduce((groups, card) => {
    if (!card || card.isFaceDown || card.faceDown) return groups;
    const rank = getCardValue(card);
    if (!rank) return groups;

    const key = String(rank);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(card);
    return groups;
  }, {});
};

/**
 * Group cards by suit
 * @param {Array} cards - Array of card objects
 * @returns {Object} Object with suits as keys and arrays of cards as values
 */
export const groupBySuit = (cards) => {
  if (!cards || cards.length === 0) return {};

  return cards.reduce((groups, card) => {
    if (!card || card.isFaceDown || card.faceDown) return groups;
    const suit = card?.suit;
    if (SUIT_ORDER[suit] === undefined) return groups;
    if (!groups[suit]) {
      groups[suit] = [];
    }
    groups[suit].push(card);
    return groups;
  }, {});
};

/**
 * Get the display name for a card
 * @param {Object} card - Card object
 * @returns {string} Display name (e.g., "Ace of Hearts")
 */
export const getCardDisplayName = (card) => {
  if (!card) return '';

  const valueNames = {
    'A': 'Ace',
    '2': 'Two',
    '3': 'Three',
    '4': 'Four',
    '5': 'Five',
    '6': 'Six',
    '7': 'Seven',
    '8': 'Eight',
    '9': 'Nine',
    '10': 'Ten',
    'J': 'Jack',
    'Q': 'Queen',
    'K': 'King'
  };

  const valueName = valueNames[card.value] || card.value;
  return `${valueName} of ${card.suit}`;
};

/**
 * Get the short display name for a card
 * @param {Object} card - Card object
 * @returns {string} Short name (e.g., "A♥")
 */
export const getCardShortName = (card) => {
  if (!card) return '';
  const face = card.value || '';
  return `${face}${getSuitSymbol(card.suit)}`;
};

/**
 * Get color for a card based on suit
 * @param {Object} card - Card object
 * @returns {string} Color ('red' or 'black')
 */
export const getCardColor = (card) => {
  const suit = card?.suit;
  return SUIT_COLORS[suit] || SUIT_COLORS[SUITS.SPADES];
};

/**
 * Find cards that can be played together (same value)
 * @param {Array} cards - Array of card objects
 * @param {string} value - Value to match
 * @returns {Array} Array of cards with matching value
 */
export const findPlayableGroup = (cards, value) => {
  if (!cards || !value) return [];
  return cards.filter(card => card.value === value);
};

/**
 * Check if cards can be selected together
 * @param {Array} cards - Cards to check
 * @returns {boolean} True if all cards have same value
 */
export const canSelectTogether = (cards) => {
  if (!cards || cards.length <= 1) return true;
  
  const firstValue = cards[0].value;
  return cards.every(card => card.value === firstValue);
};

/**
 * Get suggested plays from player's available cards
 * @param {Array} availableCards - Player's available cards
 * @param {Array} centerPile - Current center pile
 * @returns {Array} Array of suggested play groups
 */
export const getSuggestedPlays = (availableCards, centerPile) => {
  if (!availableCards || availableCards.length === 0) return [];

  const groups = groupByValue(availableCards);
  const suggestions = [];

  // If center pile is empty, all groups are valid
  if (!centerPile || centerPile.length === 0) {
    Object.values(groups).forEach(group => {
      suggestions.push(group);
    });
    return suggestions;
  }

  const lastCard = centerPile[centerPile.length - 1];
  const lastValue = getCardValue(lastCard);

  Object.values(groups).forEach((group) => {
    const faceValue = group[0]?.value;
    const playValue = getCardValue(group[0]);

    if (faceValue === '10') {
      suggestions.push(group);
    } else if (playValue && playValue <= lastValue) {
      suggestions.push(group);
    }
  });

  return suggestions;
};

/**
 * Format card count for display
 * @param {number} count - Number of cards
 * @returns {string} Formatted string (e.g., "5 cards", "1 card")
 */
export const formatCardCount = (count) => {
  if (count === 0) return 'No cards';
  if (count === 1) return '1 card';
  return `${count} cards`;
};
