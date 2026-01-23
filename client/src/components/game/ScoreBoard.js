import React from 'react';
import PropTypes from 'prop-types';

/**
 * ScoreBoard component displays round results and player scores
 * Shows winner, individual round scores, and cumulative totals
 */
function ScoreBoard({ roundResult, onNextRound, isHost }) {
  if (!roundResult) return null;

  const { winner, players, roundNumber } = roundResult;

  // Sort players by total score (ascending - lowest wins)
  const sortedPlayers = [...players].sort((a, b) => a.totalScore - b.totalScore);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Round {roundNumber} Complete!
          </h2>
          <p className="text-xl text-green-600 font-semibold">
            {winner.name} wins the round! 🎉
          </p>
        </div>

        {/* Scores Table */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-4 text-gray-700">Player</th>
                <th className="text-right py-2 px-4 text-gray-700">Round Score</th>
                <th className="text-right py-2 px-4 text-gray-700 font-bold">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-b border-gray-200 ${
                    player.id === winner.id ? 'bg-green-50' : ''
                  } ${index === 0 ? 'font-semibold' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {player.name}
                      {player.id === winner.id && (
                        <span className="text-yellow-500">👑</span>
                      )}
                      {index === 0 && roundNumber > 1 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Leading
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    {player.id === winner.id ? (
                      <span className="text-green-600 font-semibold">0</span>
                    ) : (
                      <span className="text-gray-600">{player.roundScore}</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-800">
                    {player.totalScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Text */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <p>Lowest total score wins the game</p>
        </div>

        {/* Next Round Button - Only for Host */}
        {isHost && (
          <div className="text-center">
            <button
              onClick={onNextRound}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start Next Round
            </button>
          </div>
        )}

        {/* Waiting Message - For Non-Hosts */}
        {!isHost && (
          <div className="text-center text-gray-600">
            <p>Waiting for host to start next round...</p>
          </div>
        )}
      </div>
    </div>
  );
}

ScoreBoard.propTypes = {
  roundResult: PropTypes.shape({
    winner: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    players: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        roundScore: PropTypes.number.isRequired,
        totalScore: PropTypes.number.isRequired,
      })
    ).isRequired,
    roundNumber: PropTypes.number.isRequired,
  }),
  onNextRound: PropTypes.func.isRequired,
  isHost: PropTypes.bool.isRequired,
};

export default ScoreBoard;
