import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the useWebSocket hook
const mockSendMessage = jest.fn();
jest.mock('./hooks/useWebSocket', () => ({
  __esModule: true,
  default: () => ({
    isConnected: false,
    error: null,
    sendMessage: mockSendMessage,
  }),
}));

test('renders Clear the Deck header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Clear the Deck/i);
  expect(headerElement).toBeInTheDocument();
});
