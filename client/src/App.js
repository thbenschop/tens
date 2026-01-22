import React, { useState } from 'react';
import useWebSocket from './hooks/useWebSocket';

function App() {
  const [messages, setMessages] = useState([]);
  const { isConnected, error, sendMessage } = useWebSocket(
    'ws://localhost:8080/ws',
    {
      onMessage: (data) => {
        setMessages((prev) => [...prev, data]);
      },
    }
  );

  const handleSendTest = () => {
    sendMessage({ type: 'test', message: 'Hello from client!' });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Clear the Deck
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {error && (
            <div className="mt-2 text-red-600 text-sm">
              Error: {error.message}
            </div>
          )}
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">WebSocket Test</h2>
          <button
            onClick={handleSendTest}
            disabled={!isConnected}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            Send Test Message
          </button>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Received Messages:</h3>
            <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-sm">No messages yet...</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="mb-2 text-sm">
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      {JSON.stringify(msg)}
                    </code>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
