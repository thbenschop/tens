import {
  sortCards,
  groupByValue,
  getCardShortName,
  getCardColor,
  getSuggestedPlays,
  getCardValue,
  getCardPoints,
  getSuitSymbol,
} from './cardUtils';
import { SUITS, SUIT_ORDER, SUIT_COLORS } from './constants';

describe('card value mapping', () => {
  test('maps face values to numeric ranks and points for tens', () => {
    const rankedValues = [
      { face: 'A', expectedRank: 1 },
      { face: '2', expectedRank: 2 },
      { face: '3', expectedRank: 3 },
      { face: '4', expectedRank: 4 },
      { face: '5', expectedRank: 5 },
      { face: '6', expectedRank: 6 },
      { face: '7', expectedRank: 7 },
      { face: '8', expectedRank: 8 },
      { face: '9', expectedRank: 9 },
      { face: '10', expectedRank: 10 },
      { face: 'J', expectedRank: 11 },
      { face: 'Q', expectedRank: 12 },
      { face: 'K', expectedRank: 13 },
    ];

    rankedValues.forEach(({ face, expectedRank }) => {
      const card = { value: face, suit: SUITS.SPADES };
      expect(getCardValue(card)).toBe(expectedRank);
    });

    expect(getCardPoints({ value: '10', suit: SUITS.CLUBS })).toBe(20);
    expect(getCardPoints({ value: 'Q', suit: SUITS.HEARTS })).toBe(12);
  });
});

describe('suit ordering constant', () => {
  test('uses clubs < diamonds < hearts < spades ordering', () => {
    expect(SUIT_ORDER).toMatchObject({
      [SUITS.CLUBS]: 0,
      [SUITS.DIAMONDS]: 1,
      [SUITS.HEARTS]: 2,
      [SUITS.SPADES]: 3,
    });

    const orderedSuits = Object.entries(SUIT_ORDER)
      .sort(([, a], [, b]) => a - b)
      .map(([suit]) => suit);

    expect(orderedSuits).toEqual([
      SUITS.CLUBS,
      SUITS.DIAMONDS,
      SUITS.HEARTS,
      SUITS.SPADES,
    ]);
  });
});

describe('card sorting', () => {
  test('orders by rank then suit order and keeps invalid cards at the end', () => {
    const cards = [
      { id: 'fiveH', value: '5', suit: SUITS.HEARTS },
      { id: 'fiveC', value: '5', suit: SUITS.CLUBS },
      { id: 'fiveS', value: '5', suit: SUITS.SPADES },
      { id: 'fiveD', value: '5', suit: SUITS.DIAMONDS },
      { id: 'aceS', value: 'A', suit: SUITS.SPADES },
      { id: 'queenC', value: 'Q', suit: SUITS.CLUBS },
      { id: 'invalid', isFaceDown: true },
    ];

    const sorted = sortCards(cards);
    expect(sorted.map((c) => c.id)).toEqual([
      'aceS',
      'fiveC',
      'fiveD',
      'fiveH',
      'fiveS',
      'queenC',
      'invalid',
    ]);
  });
});

describe('card grouping', () => {
  test('clusters by numeric rank regardless of suit', () => {
    const cards = [
      { id: 'aH', value: 'A', suit: SUITS.HEARTS },
      { id: 'aC', value: 'A', suit: SUITS.CLUBS },
      { id: 'tenS', value: '10', suit: SUITS.SPADES },
      { id: 'tenH', value: '10', suit: SUITS.HEARTS },
      { id: 'threeD', value: '3', suit: SUITS.DIAMONDS },
    ];

    const grouped = groupByValue(cards);
    expect(Object.keys(grouped).sort()).toEqual(['1', '10', '3']);
    expect(grouped['1'].map((c) => c.id).sort()).toEqual(['aC', 'aH']);
    expect(grouped['10'].map((c) => c.id).sort()).toEqual(['tenH', 'tenS']);
    expect(grouped['3'].map((c) => c.id)).toEqual(['threeD']);
  });
});

describe('suit display helpers', () => {
  test('returns symbols and colors for capitalized suits with fallback', () => {
    expect(getSuitSymbol(SUITS.HEARTS)).toBe('♥');
    expect(getSuitSymbol(SUITS.DIAMONDS)).toBe('♦');
    expect(getSuitSymbol(SUITS.CLUBS)).toBe('♣');
    expect(getSuitSymbol(SUITS.SPADES)).toBe('♠');
    expect(getSuitSymbol('Invalid')).toBe('');

    expect(getCardColor({ suit: SUITS.HEARTS })).toBe(SUIT_COLORS[SUITS.HEARTS]);
    expect(getCardColor({ suit: SUITS.DIAMONDS })).toBe(SUIT_COLORS[SUITS.DIAMONDS]);
    expect(getCardColor({ suit: SUITS.CLUBS })).toBe(SUIT_COLORS[SUITS.CLUBS]);
    expect(getCardColor({ suit: SUITS.SPADES })).toBe(SUIT_COLORS[SUITS.SPADES]);
    expect(getCardColor({ suit: 'Invalid' })).toBe(SUIT_COLORS[SUITS.SPADES]);
  });

  test('short name uses mapped suit symbol', () => {
    expect(getCardShortName({ value: '10', suit: SUITS.HEARTS })).toBe('10♥');
    expect(getCardShortName({ value: 'K', suit: SUITS.SPADES })).toBe('K♠');
  });
});

describe('suggested plays', () => {
  test('uses numeric ranks with tens as wildcards', () => {
    const available = [
      { id: 'eight', value: '8', suit: SUITS.CLUBS },
      { id: 'jack', value: 'J', suit: SUITS.HEARTS },
      { id: 'ten', value: '10', suit: SUITS.DIAMONDS },
      { id: 'two', value: '2', suit: SUITS.SPADES },
    ];
    const centerPile = [{ id: 'top', value: '9', suit: SUITS.CLUBS }];

    const suggestions = getSuggestedPlays(available, centerPile);
    const suggestedValues = suggestions.map((group) => group[0].value).sort();

    expect(suggestedValues).toEqual(['10', '2', '8']);
    expect(suggestions.some((group) => group[0].value === 'J')).toBe(false);
  });
});
