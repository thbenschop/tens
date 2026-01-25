import { isValidPlay, canPlayCards, detectSet, calculatePoints } from './gameLogic';
import { SUITS } from './constants';

const makeCard = (id, value, suit = SUITS.CLUBS) => ({ id, value, suit });
const centerWith = (value, suit = SUITS.SPADES) => [makeCard(`center-${value}`, value, suit)];
const buildPlayer = () => ({
  id: 'p1',
  name: 'Player One',
  hand: [
    makeCard('hand-high', 'K', SUITS.SPADES),
    makeCard('hand-low', '3', SUITS.HEARTS),
  ],
  tableCardsUp: [makeCard('up-card', '5', SUITS.DIAMONDS)],
  tableCardsDown: [makeCard('down-card', '6', SUITS.CLUBS)],
});

describe('isValidPlay', () => {
  test('fails when no cards are selected', () => {
    const result = isValidPlay([], centerWith('5'));
    expect(result).toEqual({ valid: false, reason: 'No cards selected' });
  });

  test('requires all selected cards to share the same face value', () => {
    const cards = [makeCard('c1', '4'), makeCard('c2', '5')];
    const result = isValidPlay(cards, centerWith('9'));
    expect(result).toEqual({ valid: false, reason: 'Cards must have the same value' });
  });

  test('allows any play onto an empty center pile', () => {
    const result = isValidPlay([makeCard('c1', 'Q')], []);
    expect(result).toEqual({ valid: true, reason: '' });
  });

  test('always allows tens regardless of the top pile rank and clears', () => {
    const result = isValidPlay([makeCard('ten', '10')], centerWith('2'));
    expect(result).toEqual({
      valid: true,
      reason: '',
      clear: true,
      keepTurn: true,
      clearMessage: 'Cleared by 10!',
    });
  });

  test('allows plays that exceed the top pile rank (over-value stays on stack)', () => {
    const result = isValidPlay([makeCard('high', '7')], centerWith('5'));
    expect(result).toEqual({ valid: true, reason: '' });
  });

  test('allows plays that are equal to or lower than the top pile rank', () => {
    const equalPlay = isValidPlay([makeCard('equal', '9')], centerWith('9'));
    const lowerPlay = isValidPlay([makeCard('lower', '3')], centerWith('9'));

    expect(equalPlay).toEqual({ valid: true, reason: '' });
    expect(lowerPlay).toEqual({ valid: true, reason: '' });
  });

  test('after pickup bypass allows any rank against the pile', () => {
    const result = isValidPlay([makeCard('king', 'K')], centerWith('3'), true);
    expect(result).toEqual({ valid: true, reason: '' });
  });
});

describe('calculatePoints', () => {
  test('returns 0 for empty or missing hands', () => {
    expect(calculatePoints([])).toBe(0);
    expect(calculatePoints(undefined)).toBe(0);
  });

  test('sums card values while counting tens as twenty', () => {
    const hand = [
      makeCard('low', '2'),
      makeCard('tenner', '10'),
      makeCard('face', 'K'),
    ];

    // 2 + 20 + 13 = 35
    expect(calculatePoints(hand)).toBe(35);
  });
});

describe('detectSet', () => {
  const pileFromValues = (values) => values.map((value, idx) => makeCard(`c${idx}`, value));

  test('detects when the top four cards share the same value', () => {
    const centerPile = pileFromValues(['3', '3', '3', '3']);
    expect(detectSet(centerPile)).toBe(true);
  });

  test('ignores runs shorter than four of the same value', () => {
    const centerPile = pileFromValues(['5', '5', '5']);
    expect(detectSet(centerPile)).toBe(false);
  });

  test('ignores non-contiguous matches beneath the top card sequence', () => {
    const centerPile = pileFromValues(['7', '7', '7', '8', '7']);
    expect(detectSet(centerPile)).toBe(false);
  });
});

describe('canPlayCards', () => {
  test('rejects when no cards are selected', () => {
    const player = buildPlayer();
    const result = canPlayCards(player, [], centerWith('5'));
    expect(result).toEqual({ canPlay: false, reason: 'No cards selected' });
  });

  test('rejects selections the player does not hold', () => {
    const player = buildPlayer();
    const result = canPlayCards(player, [makeCard('ghost', '4')], []);
    expect(result).toEqual({ canPlay: false, reason: 'Selected cards not available' });
  });

  test('accepts valid selections from hand or table stacks', () => {
    const player = buildPlayer();

    const fromHand = canPlayCards(player, [player.hand[1]], []);
    const fromTableUp = canPlayCards(player, [player.tableCardsUp[0]], []);
    const fromTableDown = canPlayCards(player, [player.tableCardsDown[0]], []);

    expect(fromHand).toEqual({ canPlay: true, reason: '' });
    expect(fromTableUp).toEqual({ canPlay: true, reason: '' });
    expect(fromTableDown).toEqual({ canPlay: true, reason: '' });
  });

  test('allows over-value plays from hand without clearing', () => {
    const player = buildPlayer();
    const result = canPlayCards(player, [player.hand[0]], centerWith('3'));
    expect(result).toEqual({ canPlay: true, reason: '' });
  });

  test('supports playing from face-up cards even when hand still has cards', () => {
    const player = buildPlayer();
    const result = canPlayCards(player, [player.tableCardsUp[0]], centerWith('Q'));
    expect(result).toEqual({ canPlay: true, reason: '' });
  });

  test('explains that a face-up card remains playable even while hand has cards', () => {
    const player = buildPlayer();
    const result = canPlayCards(player, [player.tableCardsUp[0]], centerWith('3'));

    expect(result).toEqual({
      canPlay: true,
      reason: 'Face-up card playable even with cards in hand',
    });
  });
});

describe('over-value single-card play', () => {
  test('permits non-clearing over-value plays and keeps clear metadata empty', () => {
    const player = buildPlayer();
    const centerPile = centerWith('4');
    const selectedCards = [player.hand[0]]; // K over 4 should stay on stack

    const validation = isValidPlay(selectedCards, centerPile);

    expect(validation.valid).toBe(true);
    expect(validation.reason).toBe('');
    expect(validation.clear).toBeFalsy();
    expect(validation.keepTurn).toBeFalsy();
    expect(validation.clearMessage).toBeFalsy();

    const playCheck = canPlayCards(player, selectedCards, centerPile);
    expect(playCheck).toEqual({ canPlay: true, reason: '' });
  });
});

describe('over-value set resolution for UI messaging', () => {
  test('records clear message and turn retention for a 4-card over-value set', () => {
    const centerPile = centerWith('4');
    const cards = [
      makeCard('ov-1', '9'),
      makeCard('ov-2', '9'),
      makeCard('ov-3', '9'),
      makeCard('ov-4', '9'),
    ];

    const result = isValidPlay(cards, centerPile);

    expect(result).toEqual({
      valid: true,
      reason: '',
      clear: true,
      keepTurn: true,
      clearMessage: 'Cleared by 4 9s!',
    });
  });

  test('formats clear message with card count for 5-card sets', () => {
    const centerPile = centerWith('6');
    const cards = [
      makeCard('ov-1', '7'),
      makeCard('ov-2', '7'),
      makeCard('ov-3', '7'),
      makeCard('ov-4', '7'),
      makeCard('ov-5', '7'),
    ];

    const result = isValidPlay(cards, centerPile);

    expect(result.clearMessage).toBe('Cleared by 5 7s!');
    expect(result.keepTurn).toBe(true);
  });
});
