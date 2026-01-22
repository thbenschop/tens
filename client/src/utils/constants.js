/**
 * Game constants for Clear the Deck
 */

// Card suits
export const SUITS = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades',
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

// Card values
export const CARD_VALUES = {
  ACE: 'A',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  TEN: '10',
  JACK: 'J',
  QUEEN: 'Q',
  KING: 'K',
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
