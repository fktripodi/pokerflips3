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
    const addPlayerButton = document.getElementById('add-player');

    function renderPreviousPlayers() {
        previousPlayers.sort();
        previousPlayersDropdown.innerHTML = '<option value="add" disabled selected>Add</option><option value="add-new">Add New Player</option>';
        previousPlayers.forEach(playerName => {
            const option = document.createElement('option');
            option.value = playerName;
            option.textContent = playerName;
            previousPlayersDropdown.appendChild(option);
        });
        renderDropdownOptions();
    }

    function renderDropdownOptions() {
        dropdownContent.innerHTML = '';
        previousPlayers.forEach(playerName => {
            const button = document.createElement('button');
            button.textContent = `Delete ${playerName}`;
            button.addEventListener('click', () => deletePlayer(playerName));
            dropdownContent.appendChild(button);
        });
    }

    function renderPlayers() {
        playersContainer.innerHTML = '';
        players.forEach((player, index) => {
            const playerRow = document.createElement('tr');
            playerRow.innerHTML = `
                <td class="control-buttons controls">
                    <button data-action="win" data-multiplier="1">+1</button>
                    <button data-action="win" data-multiplier="2">+2</button>
                    <button data-action="win" data-multiplier="4">+4</button>
                    <button data-action="lose" data-multiplier="1">-1</button>
                </td>
                <td class="name-column">${player.name}</td>
                <td>${player.wins}</td>
                <td class="results">$${player.result.toFixed(2)}</td>
                <td class="history">$${player.history.toFixed(2)}</td>
                <td><button class="remove-button" data-index="${index}">Remove</button></td>
            `;
            playersContainer.appendChild(playerRow);
        });
        playersCountDisplay.textContent = players.length;
        renderGamesPlayed();
    }

    function renderGamesPlayed() {
        gamesPlayedDisplay.textContent = gamesPlayed;
    }

    function updatePlayer(index, action, multiplier = 1) {
        const handValue = parseFloat(handValueInput.value) || 50;
        const adjustedHandValue = handValue * multiplier;
        if (action === 'win') {
            players[index].wins += multiplier;
            players[index].result += adjustedHandValue * (players.length - 1);
            players.forEach((player, idx) => {
                if (idx !== index) player.result -= adjustedHandValue;
            });
            gamesPlayed += multiplier;
        } else if (action === 'lose') {
            players[index].wins -= multiplier;
            players[index].result -= adjustedHandValue * (players.length - 1);
            players.forEach((player, idx) => {
                if (idx !== index) player.result += adjustedHandValue;
            });
            gamesPlayed -= 1;
        }
        localStorage.setItem('players', JSON.stringify(players));
        localStorage.setItem('gamesPlayed', JSON.stringify(gamesPlayed));
        renderPlayers();
        renderGamesPlayed();
    }

    function removePlayer(index) {
        const playerName = players[index].name;
        const history = JSON.parse(localStorage.getItem('history')) || {};
        history[playerName] = (history[playerName] || 0) + players[index].result;
        localStorage.setItem('history', JSON.stringify(history));
        players.splice(index, 1);
        localStorage.setItem('players', JSON.stringify(players));
        renderPlayers();
        renderGamesPlayed();
    }

    function deletePlayer(playerName) {
        const index = previousPlayers.indexOf(playerName);
        if (index !== -1) {
            previousPlayers.splice(index, 1);
            localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
            renderPreviousPlayers();
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
    });

    addPlayerButton.addEventListener('click', () => {
        const playerName = prompt("Enter player name:");
        if (playerName && playerName.trim() !== '' && !players.some(player => player.name === playerName.trim())) {
            const player = { name: playerName.trim(), wins: 0, result: 0, history: 0 };
            players.push(player);
            if (!previousPlayers.includes(playerName.trim())) {
                previousPlayers.push(playerName.trim());
                localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
            }
            localStorage.setItem('players', JSON.stringify(players));
            renderPlayers();
            renderPreviousPlayers();
        }
    });

    playersContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const index = event.target.getAttribute('data-index');
            const action = event.target.getAttribute('data-action');
            const multiplier = parseInt(event.target.getAttribute('data-multiplier'), 10);
            if (index !== null) {
                removePlayer(index);
            } else if (action && !isNaN(multiplier)) {
                const playerIndex = Array.from(playersContainer.children).indexOf(event.target.closest('tr'));
                updatePlayer(playerIndex, action, multiplier);
            }
        }
    });

    renderPlayers();
    renderGamesPlayed();
    renderPreviousPlayers();
});
