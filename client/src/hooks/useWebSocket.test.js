import { renderHook, waitFor } from '@testing-library/react';
import useWebSocket from './useWebSocket';

describe('useWebSocket', () => {
  let mockWebSocket;
  let mockWebSocketInstances = [];

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocketInstances = [];
    mockWebSocket = class {
      constructor(url) {
        this.url = url;
        this.readyState = WebSocket.CONNECTING;
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        mockWebSocketInstances.push(this);

        // Simulate connection opening
        setTimeout(() => {
          this.readyState = WebSocket.OPEN;
          if (this.onopen) {
            this.onopen(new Event('open'));
          }
        }, 0);
      }

      send(data) {
        // Mock send
      }

      close() {
        this.readyState = WebSocket.CLOSED;
        if (this.onclose) {
          this.onclose(new Event('close'));
        }
      }
    };

    global.WebSocket = mockWebSocket;
  });

  afterEach(() => {
    mockWebSocketInstances.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    mockWebSocketInstances = [];
  });

  test('should connect to WebSocket server', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  test('should handle connection errors', async () => {
    // Override mock to simulate error
    mockWebSocket = class extends mockWebSocket {
      constructor(url) {
        super(url);
        setTimeout(() => {
          this.readyState = WebSocket.CLOSED;
          if (this.onerror) {
            this.onerror(new Event('error'));
          }
        }, 0);
      }
    };
    global.WebSocket = mockWebSocket;

    const { result } = renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.isConnected).toBe(false);
  });

  test('should send messages when connected', async () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const sendSpy = jest.spyOn(mockWebSocketInstances[0], 'send');
    result.current.sendMessage({ type: 'test', data: 'hello' });

    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'test', data: 'hello' }));
  });

  test('should receive messages', async () => {
    const onMessage = jest.fn();
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080/ws', { onMessage }));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate receiving a message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({ type: 'test', data: 'hello' })
    });
    mockWebSocketInstances[0].onmessage(messageEvent);

    expect(onMessage).toHaveBeenCalledWith({ type: 'test', data: 'hello' });
  });

  test('should cleanup on unmount', async () => {
    const { result, unmount } = renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const closeSpy = jest.spyOn(mockWebSocketInstances[0], 'close');
    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });
});
