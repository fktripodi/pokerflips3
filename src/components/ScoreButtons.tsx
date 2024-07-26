import React from 'react';

interface ScoreButtonsProps {
  players: string[];
  updateScore: (name: string) => void;
}

const ScoreButtons: React.FC<ScoreButtonsProps> = ({ players, updateScore }) => {
  return (
    <div className="score-buttons">
      {players.map((player) => (
        <div key={player}>
          <h3>{player}</h3>
          <button onClick={() => updateScore(player)}>+1 Win</button>
        </div>
      ))}
    </div>
  );
};

export default ScoreButtons;