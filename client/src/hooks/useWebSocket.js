import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection management
 * @param {string} url - WebSocket server URL
 * @param {Object} options - Configuration options
 * @param {Function} options.onMessage - Callback for incoming messages
 * @param {Function} options.onOpen - Callback when connection opens
 * @param {Function} options.onClose - Callback when connection closes
 * @param {Function} options.onError - Callback for errors
 * @returns {Object} WebSocket connection state and methods
 */
function useWebSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(!!url);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  const reconnectScheduledRef = useRef(false);
  const { onMessage, onOpen, onClose, onError } = options;

  const clearReconnectTimer = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!url) return undefined;

    shouldReconnectRef.current = true;

    const connect = () => {
      setIsConnecting(true);
      setConnectionAttempts((prev) => prev + 1);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (event) => {
        reconnectAttemptsRef.current = 0;
        reconnectScheduledRef.current = false;
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        if (onOpen) onOpen(event);
      };

      const scheduleReconnect = () => {
        if (!shouldReconnectRef.current) return;
        if (reconnectScheduledRef.current) return;
        reconnectScheduledRef.current = true;
        const delay = Math.min(500 * 2 ** reconnectAttemptsRef.current, 4000);
        reconnectAttemptsRef.current += 1;
        setIsConnected(false);
        setIsConnecting(true);
        clearReconnectTimer();
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onclose = (event) => {
        reconnectScheduledRef.current = false;
        setIsConnected(false);
        if (onClose) onClose(event);
        scheduleReconnect();
      };

      ws.onerror = (event) => {
        setError(new Error('WebSocket connection error'));
        setIsConnected(false);
        if (onError) onError(event);
        scheduleReconnect();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
    };

    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        wsRef.current.close();
      }
    };
  }, [url, onMessage, onOpen, onClose, onError]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data);
    }
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    lastMessage,
    connectionAttempts,
    sendMessage,
  };
}

export default useWebSocket;
