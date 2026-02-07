import React, { useMemo, useState } from 'react';
import CenterPile from './CenterPile';
import TableCards from './TableCards';
import PlayerHand from './PlayerHand';
import PlayerInfo from './PlayerInfo';
import ScoreBoard from './ScoreBoard';
import '../../styles/game.css';

function GameBoard({ state }) {
  const {
    playerId,
    roomCode,
    players = [],
    centerPile = [],
    tableCardsUp = [],
    tableCardsDown = [],
    hand = [],
    isPlayerTurn = false,
    currentTurnPlayerId,
    roundResult,
    error,
    isHost,
    sendPlayCards,
    flipFaceDown,
    startNextRound,
  } = state || {};

  const [selectedHandCards, setSelectedHandCards] = useState([]);
  const [selectedTableCards, setSelectedTableCards] = useState([]);
  const [selectedFaceDownId, setSelectedFaceDownId] = useState(null);
  const safeStartNextRound = startNextRound || (() => {});

  const combinedSelectedCards = useMemo(() => {
    const seen = new Set();
    return [...selectedHandCards, ...selectedTableCards].filter((card) => {
      if (!card || !card.id || seen.has(card.id)) return false;
      seen.add(card.id);
      return true;
    });
  }, [selectedHandCards, selectedTableCards]);

  const otherPlayers = useMemo(
    () => players.filter((player) => player.id !== playerId),
    [players, playerId]
  );

  const handleHandSelectionChange = (cards) => {
    setSelectedHandCards(cards);
    setSelectedFaceDownId(null);
  };

  const handleTableSelectionChange = (cards) => {
    setSelectedTableCards(cards);
    setSelectedFaceDownId(null);
  };

  const handlePlaySelected = () => {
    if (!isPlayerTurn || combinedSelectedCards.length === 0) return;
    setSelectedFaceDownId(null);
    if (sendPlayCards) {
      sendPlayCards(combinedSelectedCards);
    }
  };

  const handlePlayFromHand = (cards) => {
    setSelectedHandCards(cards);
    setSelectedTableCards([]);
    setSelectedFaceDownId(null);
    if (!isPlayerTurn || cards.length === 0) return;
    if (sendPlayCards) {
      sendPlayCards(cards);
    }
  };

  const handlePlayFromTable = (cards) => {
    setSelectedTableCards(cards);
    setSelectedHandCards([]);
    setSelectedFaceDownId(null);
    if (!isPlayerTurn || cards.length === 0) return;
    if (sendPlayCards) {
      sendPlayCards(cards);
    }
  };

  const handleFaceDownSelection = (card) => {
    if (!isPlayerTurn || !card?.id) return;
    setSelectedFaceDownId(card.id);
  };

  const handleFlip = () => {
    if (!isPlayerTurn || tableCardsDown.length === 0) return;
    const targetId =
      selectedFaceDownId && tableCardsDown.some((c) => c?.id === selectedFaceDownId)
        ? selectedFaceDownId
        : tableCardsDown[0].id;
    setSelectedFaceDownId(null);
    if (flipFaceDown) {
      flipFaceDown(targetId);
    }
  };

  const turnText = isPlayerTurn ? 'Your turn' : 'Waiting for other players';
  const playDisabled = !isPlayerTurn || combinedSelectedCards.length === 0;
  const flipDisabled = !isPlayerTurn || tableCardsDown.length === 0;

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      {roundResult && (
        <ScoreBoard
          roundResult={roundResult}
          onNextRound={safeStartNextRound}
          isHost={!!isHost}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Clear the Deck</h1>
            {roomCode && (
              <p className="text-sm text-gray-600">Room {roomCode}</p>
            )}
          </div>
          <div
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              isPlayerTurn ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {turnText}
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            {error}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white shadow-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Center Pile</h2>
                  <p className="text-sm text-gray-500">Stacking and slides as cards land</p>
                </div>
                <span className="text-xs text-gray-500">{centerPile.length} cards</span>
              </div>
              <CenterPile cards={centerPile} />
            </div>

            <div className="bg-white shadow-sm rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Your Table</h3>
                  <p className="text-xs text-gray-500">Play face-up first, then flip</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                      playDisabled
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    onClick={handlePlaySelected}
                    disabled={playDisabled}
                  >
                    Play Selected
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                      flipDisabled
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                    onClick={handleFlip}
                    disabled={flipDisabled}
                  >
                    Flip Face-Down
                  </button>
                </div>
              </div>
              <TableCards
                cardsUp={tableCardsUp}
                cardsDown={tableCardsDown}
                onFaceUpSelectionChange={handleTableSelectionChange}
                onPlayFaceUp={handlePlayFromTable}
                onFaceDownSelect={handleFaceDownSelection}
                selectedFaceDownId={selectedFaceDownId}
              />
            </div>

            <div className="bg-white shadow-sm rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Your Hand</h3>
                <span className="text-xs text-gray-500">{combinedSelectedCards.length} selected</span>
              </div>
              <PlayerHand
                cards={hand}
                onSelectionChange={handleHandSelectionChange}
                onPlay={handlePlayFromHand}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white shadow-sm rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Players</h3>
              <div className="space-y-3">
                {players.map((player) => (
                  <PlayerInfo
                    key={player.id}
                    player={player}
                    isCurrentTurn={currentTurnPlayerId === player.id}
                    isCurrentPlayer={player.id === playerId}
                    showScores={!!roundResult}
                  />
                ))}
              </div>
            </div>

            {otherPlayers.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-semibold mb-1">Table Awareness</p>
                <p className="text-gray-600">{otherPlayers.length} opponents still in.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameBoard;
