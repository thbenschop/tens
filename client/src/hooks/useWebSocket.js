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
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const { onMessage, onOpen, onClose, onError } = options;

  useEffect(() => {
    if (!url) return;

    // Create WebSocket connection
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = (event) => {
      setIsConnected(true);
      setError(null);
      if (onOpen) onOpen(event);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (onClose) onClose(event);
    };

    ws.onerror = (event) => {
      setError(new Error('WebSocket connection error'));
      setIsConnected(false);
      if (onError) onError(event);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
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
    error,
    sendMessage,
  };
}

export default useWebSocket;
