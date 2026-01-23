/**
 * Game logic utilities for client-side validation
 */

import { CARD_VALUES } from './constants';

/**
 * Get the numeric value of a card
 * @param {Object} card - Card object with value property
 * @returns {number} Numeric value of the card
 */
export const getCardValue = (card) => {
  return CARD_VALUES[card.value] || 0;
};

/**
 * Check if all cards have the same value
 * @param {Array} cards - Array of card objects
 * @returns {boolean} True if all cards have same value
 */
export const allSameValue = (cards) => {
  if (!cards || cards.length === 0) return true;
  const firstValue = cards[0].value;
  return cards.every(card => card.value === firstValue);
};

/**
 * Check if cards can be validly played on the center pile
 * @param {Array} cardsToPlay - Cards the player wants to play
 * @param {Array} centerPile - Current center pile
 * @param {boolean} afterPickup - Whether this is after picking up the pile
 * @returns {Object} { valid: boolean, reason: string }
 */
export const isValidPlay = (cardsToPlay, centerPile, afterPickup = false) => {
  // Must play at least one card
  if (!cardsToPlay || cardsToPlay.length === 0) {
    return { valid: false, reason: 'No cards selected' };
  }

  // All cards must be the same value
  if (!allSameValue(cardsToPlay)) {
    return { valid: false, reason: 'Cards must have the same value' };
  }

  // After pickup, any card can be played
  if (afterPickup) {
    return { valid: true, reason: '' };
  }

  // Empty center pile, any card can be played
  if (!centerPile || centerPile.length === 0) {
    return { valid: true, reason: '' };
  }

  // Wild tens are always valid
  if (cardsToPlay[0].value === '10') {
    return { valid: true, reason: '' };
  }

  // Get the last card in center pile
  const lastCard = centerPile[centerPile.length - 1];
  const lastValue = getCardValue(lastCard);
  const playValue = getCardValue(cardsToPlay[0]);

  // Valid if equal or lesser
  if (playValue <= lastValue) {
    return { valid: true, reason: '' };
  }

  return { valid: false, reason: 'Card value too high' };
};

/**
 * Check if the last 4+ cards in center pile form a set (same value)
 * @param {Array} centerPile - Current center pile
 * @returns {boolean} True if a set is detected
 */
export const detectSet = (centerPile) => {
  if (!centerPile || centerPile.length < 4) {
    return false;
  }

  const lastCard = centerPile[centerPile.length - 1];
  let count = 1;

  for (let i = centerPile.length - 2; i >= 0; i--) {
    if (centerPile[i].value === lastCard.value) {
      count++;
    } else {
      break;
    }
  }

  return count >= 4;
};

/**
 * Check if player can play cards from their hand or table
 * @param {Object} player - Player object
 * @param {Array} selectedCards - Cards player has selected
 * @param {Array} centerPile - Current center pile
 * @param {boolean} afterPickup - Whether this is after picking up
 * @returns {Object} { canPlay: boolean, reason: string }
 */
export const canPlayCards = (player, selectedCards, centerPile, afterPickup = false) => {
  if (!player || !selectedCards || selectedCards.length === 0) {
    return { canPlay: false, reason: 'No cards selected' };
  }

  // Check if all selected cards are available to the player
  const availableCards = [
    ...(player.hand || []),
    ...(player.tableCardsUp || []),
    ...(player.tableCardsDown || [])
  ];

  const allCardsAvailable = selectedCards.every(card => 
    availableCards.some(available => available.id === card.id)
  );

  if (!allCardsAvailable) {
    return { canPlay: false, reason: 'Selected cards not available' };
  }

  // Validate the play
  const validation = isValidPlay(selectedCards, centerPile, afterPickup);
  return { canPlay: validation.valid, reason: validation.reason };
};

/**
 * Check if player can flip a face-down card
 * @param {Object} player - Player object
 * @returns {boolean} True if player can flip face-down cards
 */
export const canFlipFaceDown = (player) => {
  if (!player) return false;
  
  const hasHand = player.hand && player.hand.length > 0;
  const hasTableUp = player.tableCardsUp && player.tableCardsUp.length > 0;
  const hasFaceDown = player.tableCardsDown && player.tableCardsDown.length > 0;

  return !hasHand && !hasTableUp && hasFaceDown;
};

/**
 * Check if it's the player's turn
 * @param {Object} game - Game state object
 * @param {string} playerID - Player's ID
 * @returns {boolean} True if it's the player's turn
 */
export const isPlayerTurn = (game, playerID) => {
  if (!game || !game.players || !playerID) return false;
  
  const currentPlayer = game.players[game.currentPlayerIndex];
  return currentPlayer && currentPlayer.id === playerID;
};

/**
 * Get the current player from game state
 * @param {Object} game - Game state object
 * @returns {Object|null} Current player or null
 */
export const getCurrentPlayer = (game) => {
  if (!game || !game.players || game.currentPlayerIndex === undefined) {
    return null;
  }
  return game.players[game.currentPlayerIndex];
};

/**
 * Calculate points for remaining cards in hand
 * @param {Array} cards - Array of cards
 * @returns {number} Total points
 */
export const calculatePoints = (cards) => {
  if (!cards || cards.length === 0) return 0;

  return cards.reduce((total, card) => {
    const value = getCardValue(card);
    // Tens are worth 20 points
    if (card.value === '10') return total + 20;
    return total + value;
  }, 0);
};
