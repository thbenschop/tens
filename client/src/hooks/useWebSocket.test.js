import { renderHook, act } from '@testing-library/react';
import useWebSocket from './useWebSocket';

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onerror = null;
    this.onmessage = null;
    this.send = jest.fn();
    MockWebSocket.instances.push(this);
  }

  open() {
    this.readyState = WebSocket.OPEN;
    this.onopen && this.onopen(new Event('open'));
  }

  emitMessage(data) {
    const event = new MessageEvent('message', { data: JSON.stringify(data) });
    this.onmessage && this.onmessage(event);
  }

  error() {
    this.readyState = WebSocket.CLOSED;
    this.onerror && this.onerror(new Event('error'));
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose && this.onclose(new Event('close'));
  }
}

MockWebSocket.instances = [];
MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

describe('useWebSocket', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    MockWebSocket.instances = [];
    global.WebSocket = MockWebSocket;
  });

  afterEach(() => {
    act(() => {
      MockWebSocket.instances.forEach((ws) => ws.close());
      jest.runOnlyPendingTimers();
    });
    MockWebSocket.instances = [];
    jest.useRealTimers();
  });

  const advance = (ms) => {
    act(() => {
      jest.advanceTimersByTime(ms);
    });
  };

  test('reports connecting then connected and tracks last message', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    expect(result.current.isConnecting).toBe(true);
    expect(result.current.isConnected).toBe(false);

    act(() => {
      MockWebSocket.instances[0].open();
    });

    expect(result.current.isConnecting).toBe(false);
    expect(result.current.isConnected).toBe(true);

    act(() => {
      MockWebSocket.instances[0].emitMessage({ type: 'PING' });
    });

    expect(result.current.lastMessage).toEqual({ type: 'PING' });
  });

  test('sets error and schedules reconnect after socket error', () => {
    renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    const first = MockWebSocket.instances[0];
    act(() => {
      first.error();
    });

    expect(MockWebSocket.instances).toHaveLength(1);

    advance(600);

    expect(MockWebSocket.instances).toHaveLength(2);
    expect(MockWebSocket.instances[1].readyState).toBe(WebSocket.CONNECTING);
  });

  test('retries with backoff and can send after reconnect', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    const first = MockWebSocket.instances[0];
    act(() => first.open());

    act(() => first.close());

    advance(600);

    const second = MockWebSocket.instances[1];
    act(() => second.open());

    act(() => {
      result.current.sendMessage({ type: 'HELLO' });
    });

    expect(second.send).toHaveBeenCalledWith(JSON.stringify({ type: 'HELLO' }));
  });

  test('cleans up sockets on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket('ws://localhost:8080/ws'));

    const first = MockWebSocket.instances[0];
    const closeSpy = jest.spyOn(first, 'close');

    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });
});
