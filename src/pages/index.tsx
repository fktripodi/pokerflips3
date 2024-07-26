import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import PlayerList from '../components/PlayerList';
import MenuIcon from '../components/MenuIcon';

const HomePage = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<{ [key: string]: { wins: number; money: number; lastUpdated?: string } }>({});
  const [monetaryValue, setMonetaryValue] = useState<number>(0);
  const [allPlayers, setAllPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState<string>('');
  const newPlayerInputRef = useRef<HTMLInputElement>(null);

  const [newData, setNewData] = useState<string>('');
  const [gameCounter, setGameCounter] = useState<number>(0);
  const [backupGameCounter, setBackupGameCounter] = useState<number>(0);

  const updateData = (data: string) => {
    setNewData(data);
  };

  useEffect(() => {
    const savedPlayers = localStorage.getItem('players');
    const savedScores = localStorage.getItem('scores');
    const savedAllPlayers = localStorage.getItem('allPlayers');
    const savedGameCounter = localStorage.getItem('gameCounter');
    const savedBackupGameCounter = localStorage.getItem('backupGameCounter');
    if (savedPlayers && savedScores) {
      setPlayers(JSON.parse(savedPlayers));
      setScores(JSON.parse(savedScores));
    }
    if (savedAllPlayers) {
      setAllPlayers(JSON.parse(savedAllPlayers));
    }
    if (savedGameCounter) {
      setGameCounter(Number(savedGameCounter));
    }
    if (savedBackupGameCounter) {
      setBackupGameCounter(Number(savedBackupGameCounter));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('scores', JSON.stringify(scores));
    localStorage.setItem('allPlayers', JSON.stringify(allPlayers));
    localStorage.setItem('gameCounter', gameCounter.toString());
    localStorage.setItem('backupGameCounter', backupGameCounter.toString());
  }, [players, scores, allPlayers, gameCounter, backupGameCounter]);

  const calculateGameCounter = (updatedScores: { [key: string]: { wins: number; money: number; lastUpdated?: string } }) => {
    const totalWins = Object.values(updatedScores).reduce((acc, score) => acc + score.wins, 0);
    setGameCounter(totalWins + backupGameCounter);
  };

  const addPlayer = (name: string) => {
    if (players.length < 9 && !players.includes(name)) {
      setPlayers([...players, name]);
      const newScores = { ...scores, [name]: { wins: 0, money: 0, lastUpdated: new Date().toISOString() } };
      setScores(newScores);
      calculateGameCounter(newScores);
      if (!allPlayers.includes(name)) {
        setAllPlayers([...allPlayers, name]);
      }
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (newPlayer && !players.includes(newPlayer)) {
      addPlayer(newPlayer);
      setNewPlayer('');
    }
  };

  const handleSelectChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === 'refresh-table') {
      refreshTable();
    } else if (value === 'new-game') {
      await sendGameDataAndNewGame();
    } else {
      addPlayer(value);
    }
  };

  const updateScore = (player: string, delta: number) => {
    const newScores = { ...scores };
    const currentTimestamp = format(new Date(), 'dd-MM-yyyy HH:mm:ss');

    if (monetaryValue > 0 && newScores[player].wins + delta / monetaryValue >= 0) {
      const otherPlayersCount = players.length - 1;
      newScores[player].wins += delta / monetaryValue; // Update wins here
      newScores[player].money += delta * otherPlayersCount;
      newScores[player].lastUpdated = currentTimestamp;

      players.forEach((p) => {
        if (p !== player) {
          newScores[p].money -= delta;
          newScores[p].lastUpdated = currentTimestamp; // Update timestamp for this player as well
        }
      });

      setScores(newScores);
      console.log(`${player} updated at ${currentTimestamp}`);

      // Update the game counter
      calculateGameCounter(newScores);
    }
  };

  const playSound = () => {
    const audio = new Audio('/sounds/caching-chip-value.mp3');
    audio.play();
  };

  const setGameValue = (value: number) => {
    setMonetaryValue(value);
    playSound();
  };

  const handleGameValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value.replace(/[^0-9]+/g, ''), 10);
    if (!isNaN(value)) {
      setMonetaryValue(value);
    }
  };

  const handleGameValueFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const refreshTable = () => {
    setBackupGameCounter(0);
    const newScores = players.reduce((acc, player) => {
      acc[player] = { wins: 0, money: 0, lastUpdated: new Date().toISOString() };
      return acc;
    }, {} as { [key: string]: { wins: number; money: number; lastUpdated?: string } });

    setScores(newScores);
    localStorage.setItem('scores', JSON.stringify(newScores));
    calculateGameCounter(newScores);
  };

  const newGame = () => {
    setPlayers([]);
    setScores({});
    setGameCounter(0);
    setBackupGameCounter(0);
    localStorage.removeItem('players');
    localStorage.removeItem('scores');
    localStorage.removeItem('gameCounter');
    localStorage.removeItem('backupGameCounter');
  };

  async function sendGameDataAndNewGame() {
    try {
      const data = {
        players: players,
        scores: players.reduce((acc, player) => {
          acc[player] = scores[player];
          return acc;
        }, {} as { [key: string]: { wins: number; money: number; lastUpdated?: string } }),
        gameInfo: 'Some game information',
      };

      console.log('Sending data to Google Sheets:', JSON.stringify(data, null, 2));  // Detailed logging

      const response = await fetch('/api/sendToSheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Data sent successfully');
        newGame();
      } else {
        console.error('Failed to send data, response status:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const sendPlayerData = async (player: string, data: { wins: number; money: number; lastUpdated?: string }) => {
    try {
      const playerData = {
        players: [player],
        scores: {
          [player]: {
            wins: data.wins,
            money: data.money,
            lastUpdated: data.lastUpdated,
          }
        },
        gameInfo: 'Individual player data removal',
      };

      console.log('Sending player data to Google Sheets:', playerData);

      const response = await fetch('/api/sendToSheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });

      if (!response.ok) {
        console.error('Failed to send player data', player, await response.text());
      } else {
        console.log('Player data sent successfully:', player);
      }
    } catch (error) {
      console.error('Error sending player data', player, error);
    }
  };

  const removePlayer = (name: string) => {
    const playerWins = scores[name].wins;
    setBackupGameCounter(oldBackup => oldBackup + playerWins);
    setPlayers(players.filter(player => player !== name));
    const { [name]: _, ...restScores } = scores;
    setScores(restScores);
  };

  return (
    <div className="app-container">
      <header>
        <MenuIcon />
        <h1>FRANKIE'S POKER FLIPS</h1>
      </header>
      <div className="chip-container">
        <img src="/images/chip-5.png" alt="$5 Chip" onClick={() => setGameValue(5)} />
        <img src="/images/chip-10.png" alt="$10 Chip" onClick={() => setGameValue(10)} />
        <img src="/images/chip-20.png" alt="$20 Chip" onClick={() => setGameValue(20)} />
        <img src="/images/chip-50.png" alt="$50 Chip" onClick={() => setGameValue(50)} />
        <img src="/images/chip-100.png" alt="$100 Chip" onClick={() => setGameValue(100)} />
      </div>
      <form className="input-container" onSubmit={handleFormSubmit}>
        <div className="input-wrapper">
          <select onChange={handleSelectChange} value={newPlayer} className="small-player-list">
            <option value="" disabled>
              PlayerList
            </option>
            {allPlayers.filter(player => !players.includes(player)).map((player, index) => (
              <option key={index} value={player}>{player}</option>
            ))}
            <option value="refresh-table">REFRESH TABLE</option>
            <option value="new-game">NEW GAME</option>
          </select>
          <input
            type="text"
            id="playerName"
            className="new-player-input"
            placeholder="+NewPlayer"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleFormSubmit(e as any);
              }
            }}
            ref={newPlayerInputRef}
          />
        </div>
        <div className="input-wrapper">
          <label htmlFor="GameCounter">G-</label>
          <span className="game-counter">{gameCounter}</span>
          <input
            type="text"
            placeholder="$0"
            value={`$${monetaryValue}`}
            onChange={handleGameValueChange}
            onFocus={handleGameValueFocus}
          />
        </div>
      </form>
      <PlayerList
        players={players}
        scores={scores}
        valueOfGame={monetaryValue}
        updateScore={updateScore}
        removePlayer={removePlayer}
        sendPlayerData={sendPlayerData}
      />
      <div className="banner-container">
        <img src="/images/GambleRes.PNG" alt="Gamble Responsibly" />
      </div>
      <div className="bottom-buttons">
        <button>SPARE</button>
        <button onClick={sendGameDataAndNewGame}>NEW GAME</button>
        <button>HISTORY</button>
        <button>OTHER</button>
      </div>
    </div>
  );
};

export default HomePage;