import React from 'react';
import PropTypes from 'prop-types';

/**
 * PlayerInfo component displays a player's current status
 * Shows name, card count, turn indicator, and scores
 */
function PlayerInfo({ 
  player, 
  isCurrentTurn = false, 
  isCurrentPlayer = false, 
  showScores = false 
}) {
  const totalCards =
    player.hand.length +
    player.tableUp.length +
    player.tableDown.length;

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-4 border-2 transition-all
        ${isCurrentTurn ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
        ${isCurrentPlayer ? 'bg-blue-50' : ''}
      `}
    >
      {/* Player Name and Turn Indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">
            {player.name}
            {isCurrentPlayer && (
              <span className="text-xs ml-2 text-blue-600">(You)</span>
            )}
          </h3>
          {isCurrentTurn && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-medium">
              Current Turn
            </span>
          )}
        </div>
      </div>

      {/* Card Count */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-medium">Cards:</span>
          <span className="font-semibold text-gray-800">{totalCards}</span>
        </div>

        {/* Breakdown of card locations */}
        <div className="flex items-center gap-2 text-xs">
          {player.hand.length > 0 && (
            <span title="Cards in hand">
              🃏 {player.hand.length}
            </span>
          )}
          {player.tableUp.length > 0 && (
            <span title="Face-up table cards">
              ⬆️ {player.tableUp.length}
            </span>
          )}
          {player.tableDown.length > 0 && (
            <span title="Face-down table cards">
              ⬇️ {player.tableDown.length}
            </span>
          )}
        </div>
      </div>

      {/* Scores - Only show if scores are being displayed */}
      {showScores && (
        <div className="flex items-center gap-4 text-sm mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Round:</span>
            <span className="font-semibold text-gray-800">
              {player.roundScore || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">Total:</span>
            <span className="font-bold text-blue-600">
              {player.totalScore || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

PlayerInfo.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hand: PropTypes.array.isRequired,
    tableUp: PropTypes.array.isRequired,
    tableDown: PropTypes.array.isRequired,
    roundScore: PropTypes.number,
    totalScore: PropTypes.number,
  }).isRequired,
  isCurrentTurn: PropTypes.bool,
  isCurrentPlayer: PropTypes.bool,
  showScores: PropTypes.bool,
};

export default PlayerInfo;
