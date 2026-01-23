/**
 * Game constants for Clear the Deck
 */

// Card suits
export const SUITS = {
  HEARTS: 'Hearts',
  DIAMONDS: 'Diamonds',
  CLUBS: 'Clubs',
  SPADES: 'Spades',
};

// Card suit symbols for display
export const SUIT_SYMBOLS = {
  [SUITS.HEARTS]: '♥',
  [SUITS.DIAMONDS]: '♦',
  [SUITS.CLUBS]: '♣',
  [SUITS.SPADES]: '♠',
};

// Card suit colors for display
export const SUIT_COLORS = {
  [SUITS.HEARTS]: 'text-red-600',
  [SUITS.DIAMONDS]: 'text-red-600',
  [SUITS.CLUBS]: 'text-black',
  [SUITS.SPADES]: 'text-black',
};

// Suit order for deterministic sorting
export const SUIT_ORDER = {
  [SUITS.CLUBS]: 0,
  [SUITS.DIAMONDS]: 1,
  [SUITS.HEARTS]: 2,
  [SUITS.SPADES]: 3,
};

// Card values
export const CARD_VALUES = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
};

// Card point values for scoring
export const CARD_POINTS = {
  'A': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 20,  // Tens are worth 20 points
  'J': 11,
  'Q': 12,
  'K': 13,
};

// Game configuration
export const GAME_CONFIG = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 10,
  HAND_SIZE: 12,
  TABLE_CARDS_UP: 4,
  TABLE_CARDS_DOWN: 4,
  TOTAL_CARDS_PER_PLAYER: 20,
};

// Deck configuration based on player count
export const DECK_CONFIG = {
  3: 2,  // 3-5 players = 2 decks
  4: 2,
  5: 2,
  6: 3,  // 6-7 players = 3 decks
  7: 3,
  8: 4,  // 8-10 players = 4 decks
  9: 4,
  10: 4,
};

// WebSocket message types
export const MESSAGE_TYPES = {
  CREATE_ROOM: 'CREATE_ROOM',
  ROOM_CREATED: 'ROOM_CREATED',
  JOIN_ROOM: 'JOIN_ROOM',
  ROOM_JOINED: 'ROOM_JOINED',
  LEAVE_ROOM: 'LEAVE_ROOM',
  PLAYER_LEFT: 'PLAYER_LEFT',
  PLAYER_JOINED: 'PLAYER_JOINED',
  START_GAME: 'START_GAME',
  GAME_STARTED: 'GAME_STARTED',
  PLAY_CARDS: 'PLAY_CARDS',
  CARDS_PLAYED: 'CARDS_PLAYED',
  FLIP_FACE_DOWN: 'FLIP_FACE_DOWN',
  FACE_DOWN_FLIPPED: 'FACE_DOWN_FLIPPED',
  ROUND_END: 'ROUND_END',
  NEXT_ROUND: 'NEXT_ROUND',
  ROUND_STARTED: 'ROUND_STARTED',
  GAME_END: 'GAME_END',
  ERROR: 'ERROR',
};

// Game states
export const GAME_STATES = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  ROUND_END: 'round_end',
  GAME_END: 'game_end',
};
