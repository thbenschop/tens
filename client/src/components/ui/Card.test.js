import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from './Card';
import { SUITS } from '../../utils/constants';

describe('Card', () => {
  const baseCard = { id: 'c1', value: 'A', suit: SUITS.HEARTS };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders value and suit symbol when face up', () => {
    render(<Card card={baseCard} />);

    expect(screen.getByText('A♥')).toBeInTheDocument();
    expect(screen.queryByTestId('card-back')).not.toBeInTheDocument();
  });

  it('renders back when forced face down', () => {
    render(<Card card={baseCard} faceDown />);

    expect(screen.getByTestId('card-back')).toBeInTheDocument();
    expect(screen.queryByText('A♥')).not.toBeInTheDocument();
  });

  it.each([null, undefined])('renders an X placeholder when card is %s', (missingCard) => {
    render(<Card card={missingCard} />);

    const placeholder = screen.getByTestId('card-placeholder');

    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('X');
    expect(screen.queryByTestId('card-face')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-back')).not.toBeInTheDocument();
  });

  it('calls onSelect on single tap', () => {
    const onSelect = jest.fn();
    render(<Card card={baseCard} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId('card'));
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(baseCard);
  });

  it('double tap triggers onPlay', () => {
    const onPlay = jest.fn();
    render(<Card card={baseCard} selected onPlay={onPlay} />);

    fireEvent.doubleClick(screen.getByTestId('card'));
    expect(onPlay).toHaveBeenCalledWith(baseCard);
  });

  it('double tap skips selection toggle', () => {
    const onSelect = jest.fn();
    const onPlay = jest.fn();
    render(<Card card={baseCard} onSelect={onSelect} onPlay={onPlay} />);

    const card = screen.getByTestId('card');

    fireEvent.click(card);
    fireEvent.click(card);
    fireEvent.doubleClick(card);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onSelect).not.toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith(baseCard);
  });

  it('delayed second tap still prevents selection when double click occurs', () => {
    const onSelect = jest.fn();
    const onPlay = jest.fn();
    render(<Card card={baseCard} onSelect={onSelect} onPlay={onPlay} />);

    const card = screen.getByTestId('card');

    fireEvent.click(card);
    act(() => {
      jest.advanceTimersByTime(350);
    });

    fireEvent.doubleClick(card);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(onSelect).not.toHaveBeenCalled();
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPlay).toHaveBeenCalledWith(baseCard);
  });
});
