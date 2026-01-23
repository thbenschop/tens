import { isValidPlay, canPlayCards } from './gameLogic';
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

  test('always allows tens regardless of the top pile rank', () => {
    const result = isValidPlay([makeCard('ten', '10')], centerWith('2'));
    expect(result).toEqual({ valid: true, reason: '' });
  });

  test('rejects plays that exceed the top pile rank when not tens', () => {
    const result = isValidPlay([makeCard('high', '7')], centerWith('5'));
    expect(result).toEqual({ valid: false, reason: 'Card value too high' });
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

  test('propagates validation failures such as playing too high', () => {
    const player = buildPlayer();
    const result = canPlayCards(player, [player.hand[0]], centerWith('3'));
    expect(result).toEqual({ canPlay: false, reason: 'Card value too high' });
  });
});
