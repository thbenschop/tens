/**
 * Card utility functions for sorting, grouping, and display
 */

import { SUITS, CARD_VALUES } from './constants';

/**
 * Sort cards by value (low to high) and then by suit
 * @param {Array} cards - Array of card objects
 * @returns {Array} Sorted array of cards
 */
export const sortCards = (cards) => {
  if (!cards || cards.length === 0) return [];

  return [...cards].sort((a, b) => {
    const valueA = CARD_VALUES[a.value] || 0;
    const valueB = CARD_VALUES[b.value] || 0;

    if (valueA !== valueB) {
      return valueA - valueB;
    }

    // If values are equal, sort by suit
    const suitOrder = { 'Hearts': 0, 'Diamonds': 1, 'Clubs': 2, 'Spades': 3 };
    return (suitOrder[a.suit] || 0) - (suitOrder[b.suit] || 0);
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
    const value = card.value;
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(card);
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
    const suit = card.suit;
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

  const suitSymbols = {
    'Hearts': '♥',
    'Diamonds': '♦',
    'Clubs': '♣',
    'Spades': '♠'
  };

  return `${card.value}${suitSymbols[card.suit] || ''}`;
};

/**
 * Get color for a card based on suit
 * @param {Object} card - Card object
 * @returns {string} Color ('red' or 'black')
 */
export const getCardColor = (card) => {
  if (!card) return 'black';
  return (card.suit === 'Hearts' || card.suit === 'Diamonds') ? 'red' : 'black';
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
  const lastValue = CARD_VALUES[lastCard.value] || 0;

  Object.entries(groups).forEach(([value, group]) => {
    const playValue = CARD_VALUES[value] || 0;
    
    // Tens are always valid (wild)
    if (value === '10') {
      suggestions.push(group);
    }
    // Equal or lesser values are valid
    else if (playValue <= lastValue) {
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
