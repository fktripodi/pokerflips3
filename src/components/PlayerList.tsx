import React from 'react';

interface PlayerListProps {
  players: string[];
  scores: { [key: string]: { wins: number; money: number } };
  valueOfGame: number;
  updateScore: (name: string, delta: number) => void;
  removePlayer: (name: string) => void;
  sendPlayerData: (player: string, data: { wins: number; money: number }) => Promise<void>; // New prop
}

const PlayerList: React.FC<PlayerListProps> = ({ players, scores, valueOfGame, updateScore, removePlayer, sendPlayerData }) => {
  const playSound = (soundFile: string) => {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play();
  };

  const removePlayerAndSendData = async (player: string) => {
    const playerData = scores[player];
    await sendPlayerData(player, playerData);
    removePlayer(player); // Ensure this function does not call sendPlayerData
  };

  // Ensure we always render 9 rows
  const rows = [...players];
  while (rows.length < 9) {
    rows.push('');
  }

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="player-list">
      <table>
        <thead>
          <tr>
            <th className="small-column">Add Wins</th>
            <th>Players</th>
            <th>W</th>
            <th>$W</th>
            <th>$V</th>
            <th className="remove-column">R.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((player, index) => (
            <tr key={index} className="dark-blue-row">
              <td className="small-column">
                {player && (
                  <div className="button-container">
                    <button onClick={() => { updateScore(player, valueOfGame); playSound('hallelujah-Minus1-Button.mp3'); }}>+1</button>
                    <button onClick={() => { updateScore(player, 2 * valueOfGame); playSound('plus2-bull-rush-button.m4a'); }}>+2</button>
                    <button onClick={() => { updateScore(player, -valueOfGame); playSound('Doh-1-Button.mp3'); }}>-1</button>
                  </div>
                )}
              </td>
              <td>{player}</td>
              <td>{player ? scores[player].wins : ''}</td>
              <td style={{ color: player && scores[player].money > 0 ? 'green' : player && scores[player].money < 0 ? 'red' : 'inherit', fontWeight: 'bold' }}>
                {player ? formatCurrency(scores[player].money) : ''}
              </td>
              <td>{player ? formatCurrency(valueOfGame) : ''}</td>
              <td className="remove-column">
                {player && <button className="remove-button" onClick={() => removePlayerAndSendData(player)}>-</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerList;