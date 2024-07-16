document.addEventListener('DOMContentLoaded', () => {
    let players = JSON.parse(localStorage.getItem('players')) || [];
    const previousPlayers = JSON.parse(localStorage.getItem('previousPlayers')) || [];
    let gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || 0;
    const restartGameButton = document.getElementById('restart-game');
    const handValueInput = document.getElementById('hand-value');
    const playersContainer = document.getElementById('players');
    const gamesPlayedDisplay = document.getElementById('games-played');
    const playersCountDisplay = document.getElementById('players-count');
    const previousPlayersDropdown = document.getElementById('previous-players');
    const dropdownContent = document.getElementById('dropdown-content');
    const pastPlayersContainer = document.getElementById('past-players');

    function renderPreviousPlayers() {
        previousPlayers.sort();
        const currentPlayersNames = players.map(player => player.name);
        previousPlayersDropdown.innerHTML = '<option value="add" disabled selected>Add</option><option value="add-new">Add New Player</option>';
        previousPlayers.forEach(playerName => {
            if (!currentPlayersNames.includes(playerName)) {
                const option = document.createElement('option');
                option.value = playerName;
                option.textContent = playerName;
                previousPlayersDropdown.appendChild(option);
            }
        });
        renderDropdownOptions();
    }

    function renderDropdownOptions() {
        dropdownContent.innerHTML = '';
        previousPlayers.forEach(playerName => {
            const button = document.createElement('button');
            button.textContent = `Delete ${playerName}`;
            button.onclick = () => deletePlayer(playerName);
            dropdownContent.appendChild(button);
        });
    }

    function renderPlayers() {
        playersContainer.innerHTML = '';
        players.forEach((player, index) => {
            const playerRow = document.createElement('tr');
            playerRow.innerHTML = `
                <td class="control-buttons controls">
                    <button onclick="updatePlayer(${index}, 'win', 1)">+1</button>
                    <button onclick="updatePlayer(${index}, 'win', 2)">+2</button>
                    <button onclick="updatePlayer(${index}, 'win', 4)">+4</button>
                    <button onclick="updatePlayer(${index}, 'lose', 1)">-1</button>
                </td>
                <td class="name-column">${player.name}</td>
                <td>${player.wins}</td>
                <td class="results">$${player.result.toFixed(2).replace('.00', '')}</td>
                <td><button class="remove-button" onclick="removePlayer(${index})">R</button></td>
            `;
            playersContainer.appendChild(playerRow);
        });
        playersCountDisplay.textContent = players.length;
        renderGamesPlayed();
        renderPreviousPlayers(); // Re-render dropdown options to reflect current players
    }

    function renderGamesPlayed() {
        gamesPlayedDisplay.textContent = gamesPlayed;
    }

    window.updatePlayer = (index, action, multiplier = 1) => {
        const handValue = parseFloat(handValueInput.value) || 50;
        const adjustedHandValue = handValue * multiplier;
        if (action === 'win') {
            players[index].wins += multiplier;
            players[index].result += adjustedHandValue * (players.length - 1);
            players[index].history += adjustedHandValue * (players.length - 1); // Update history
            players.forEach((player, idx) => {
                if (idx !== index) {
                    player.result -= adjustedHandValue;
                    player.history -= adjustedHandValue; // Update history
                }
            });
            gamesPlayed += multiplier;
        } else if (action === 'lose') {
            players[index].wins -= multiplier;
            players[index].result -= adjustedHandValue * (players.length - 1);
            players[index].history -= adjustedHandValue * (players.length - 1); // Update history
            players.forEach((player, idx) => {
                if (idx !== index) {
                    player.result += adjustedHandValue;
                    player.history += adjustedHandValue; // Update history
                }
            });
            gamesPlayed -= 1;
        }
        localStorage.setItem('players', JSON.stringify(players));
        localStorage.setItem('gamesPlayed', JSON.stringify(gamesPlayed));
        renderPlayers();
        renderGamesPlayed();
        renderPastPlayers(); // Update past players list in real-time
    };

    window.removePlayer = (index) => {
        const playerName = players[index].name;
        const history = JSON.parse(localStorage.getItem('history')) || {};
        history[playerName] = (history[playerName] || 0) + players[index].result;
        localStorage.setItem('history', JSON.stringify(history));
        players.splice(index, 1);
        localStorage.setItem('players', JSON.stringify(players));
        renderPlayers();
        renderGamesPlayed();
        renderPastPlayers(); // Update past players list after removal
    };

    function deletePlayer(playerName) {
        const index = previousPlayers.indexOf(playerName);
        if (index !== -1) {
            previousPlayers.splice(index, 1);
            localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
            renderPreviousPlayers();
        }
    }

    function renderPastPlayers() {
        const history = JSON.parse(localStorage.getItem('history')) || {};
        pastPlayersContainer.innerHTML = '';
        Object.keys(history).forEach(playerName => {
            if (history[playerName] !== 0) {
                const playerRow = document.createElement('tr');
                playerRow.innerHTML = `
                    <td>${playerName}</td>
                    <td>$${history[playerName].toFixed(2).replace('.00', '')}</td>
                    <td><button onclick="removePlayerHistory('${playerName}')">Clear History</button></td>
                `;
                pastPlayersContainer.appendChild(playerRow);
            }
        });
    }

    window.removePlayerHistory = (playerName) => {
        const history = JSON.parse(localStorage.getItem('history')) || {};
        if (history[playerName]) {
            delete history[playerName];
            localStorage.setItem('history', JSON.stringify(history));
            renderPastPlayers(); // Re-render the past players list
        }
    }

    previousPlayersDropdown.addEventListener('change', () => {
        const selectedPlayer = previousPlayersDropdown.value;
        if (selectedPlayer === "add-new") {
            const playerName = prompt("Enter player name:").trim();
            if (playerName && !previousPlayers.includes(playerName)) {
                const player = { name: playerName, wins: 0, result: 0, history: 0 };
                players.push(player);
                previousPlayers.push(playerName);
                localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
                localStorage.setItem('players', JSON.stringify(players));
                renderPlayers();
                renderPreviousPlayers();
            }
        } else if (selectedPlayer !== "add") {
            let player = players.find(p => p.name === selectedPlayer);
            if (!player) {
                const history = JSON.parse(localStorage.getItem('history')) || {};
                const playerHistory = history[selectedPlayer] || 0;
                player = { name: selectedPlayer, wins: 0, result: 0, history: playerHistory };
                players.push(player);
                localStorage.setItem('players', JSON.stringify(players));
                renderPlayers();
            }
        }
        previousPlayersDropdown.value = "add"; // Reset the dropdown to "Add" after selecting a player
    });

    restartGameButton.addEventListener('click', () => {
        const history = JSON.parse(localStorage.getItem('history')) || {};
        players.forEach(player => {
            history[player.name] = (history[player.name] || 0) + player.result;
            player.history += player.result;
            player.result = 0;
            player.wins = 0;
        });
        gamesPlayed = 0;
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('players', JSON.stringify(players));
        localStorage.setItem('gamesPlayed', JSON.stringify(gamesPlayed));
        renderPlayers();
        renderGamesPlayed();
        renderPreviousPlayers();
        renderPastPlayers(); // Update past players list after restarting the game
    });

    renderPlayers();
    renderGamesPlayed();
    renderPreviousPlayers();
    renderPastPlayers(); // Initial render of past players
});
