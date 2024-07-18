document.addEventListener('DOMContentLoaded', () => {
    let players = JSON.parse(localStorage.getItem('players')) || [];
    let previousPlayers = JSON.parse(localStorage.getItem('previousPlayers')) || [];
    let gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || 0;
    const restartGameButton = document.getElementById('restart-game');
    const deletePlayerButton = document.getElementById('delete-player');
    const playersContainer = document.getElementById('players');
    const gamesPlayedDisplay = document.getElementById('games-played');
    const previousPlayersDropdown = document.getElementById('previous-players');
    const pastPlayersContainer = document.getElementById('past-players');
    const deletePlayerModal = document.getElementById('delete-player-modal');
    const deletePlayerDropdown = document.getElementById('delete-player-dropdown');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const closeModal = document.querySelector('.close');
    const clickSound = document.getElementById('click-sound');
    let gameValue = 50;

    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            gameValue = parseFloat(chip.dataset.value);
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    function playSound() {
        clickSound.play();
    }

    function renderPreviousPlayers() {
        const currentPlayersNames = players.map(player => player.name);
        previousPlayersDropdown.innerHTML = '<option value="add" disabled selected>Add Player</option><option value="add-new">Add New Player</option>';
        previousPlayers.forEach(playerName => {
            if (!currentPlayersNames.includes(playerName)) {
                const option = document.createElement('option');
                option.value = playerName;
                option.textContent = playerName;
                previousPlayersDropdown.appendChild(option);
            }
        });
    }

    function renderPlayers() {
        playersContainer.innerHTML = '';
        players.forEach((player, index) => {
            const playerRow = document.createElement('tr');
            playerRow.innerHTML = `
                <td>
                    <div class="action-buttons">
                        <button onclick="updatePlayer(${index}, 'win', 1)">+1</button>
                        <button onclick="updatePlayer(${index}, 'win', 2)">+2</button>
                        <button onclick="updatePlayer(${index}, 'lose', 1)">-1</button>
                    </div>
                </td>
                <td>${player.name}</td>
                <td>${player.wins}</td>
                <td class="results">$${player.result.toFixed(2).replace(/\.00$/, '')}</td>
                <td><button class="delete-button" onclick="removePlayer(${index})">-</button></td>
            `;
            playersContainer.appendChild(playerRow);
        });
        renderGamesPlayed();
        renderPreviousPlayers();
        updateDeletePlayerDropdown();
        updateAmounts();  // Call to update the amounts' styles

        // Attach sound and color change to action buttons
        const actionButtons = document.querySelectorAll('.action-buttons button');
        actionButtons.forEach(button => {
            button.addEventListener('click', playSound);
            button.addEventListener('click', () => {
                button.classList.add('clicked');
                setTimeout(() => {
                    button.classList.remove('clicked');
                }, 2000);
            });
        });
    }

    function renderGamesPlayed() {
        gamesPlayedDisplay.textContent = gamesPlayed;
    }

    window.updatePlayer = (index, action, multiplier = 1) => {
        const adjustedHandValue = gameValue * multiplier;
        if (action === 'win') {
            players[index].wins += multiplier;
            players[index].result += adjustedHandValue * (players.length - 1);
            players.forEach((player, idx) => {
                if (idx !== index) {
                    player.result -= adjustedHandValue;
                }
            });
            gamesPlayed += multiplier;
        } else if (action === 'lose') {
            players[index].wins -= multiplier;
            players[index].result -= adjustedHandValue * (players.length - 1);
            players.forEach((player, idx) => {
                if (idx !== index) {
                    player.result += adjustedHandValue;
                }
            });
            gamesPlayed -= 1;
        }
        localStorage.setItem('players', JSON.stringify(players));
        localStorage.setItem('gamesPlayed', JSON.stringify(gamesPlayed));
        renderPlayers();
    };

    window.removePlayer = (index) => {
        const playerName = players[index].name;
        players.splice(index, 1);
        localStorage.setItem('players', JSON.stringify(players));
        renderPlayers();
        renderGamesPlayed();
        addPlayerToDropdown(playerName);
    };

    function addPlayerToDropdown(playerName) {
        if (!previousPlayers.includes(playerName)) {
            previousPlayers.push(playerName);
            localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
        }
        renderPreviousPlayers();
    }

    function renderPastPlayers() {
        const history = JSON.parse(localStorage.getItem('history')) || {};
        pastPlayersContainer.innerHTML = '';
        Object.keys(history).forEach(playerName => {
            if (history[playerName] !== 0) {
                const playerRow = document.createElement('tr');
                playerRow.innerHTML = `
                    <td>${playerName}</td>
                    <td>$${history[playerName].toFixed(2).replace(/\.00$/, '')}</td>
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
            renderPastPlayers();
        }
    }

    function updateDeletePlayerDropdown() {
        deletePlayerDropdown.innerHTML = '';
        previousPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            deletePlayerDropdown.appendChild(option);
        });

        // Adjust the size of the dropdown to fit all players
        deletePlayerDropdown.size = previousPlayers.length > 0 ? previousPlayers.length : 1;
    }

    previousPlayersDropdown.addEventListener('change', () => {
        const selectedPlayer = previousPlayersDropdown.value;
        if (selectedPlayer === "add-new") {
            const playerName = prompt("Enter player name:").trim();
            if (playerName && !previousPlayers.includes(playerName)) {
                const player = { name: playerName, wins: 0, result: 0 };
                players.push(player);
                previousPlayers.push(playerName);
                localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
                localStorage.setItem('players', JSON.stringify(players));
                renderPlayers();
            }
        } else if (selectedPlayer !== "add") {
            let player = players.find(p => p.name === selectedPlayer);
            if (!player) {
                player = { name: selectedPlayer, wins: 0, result: 0 };
                players.push(player);
                localStorage.setItem('players', JSON.stringify(players));
                renderPlayers();
            }
        }
        previousPlayersDropdown.value = "add";
    });

    deletePlayerButton.addEventListener('click', () => {
        updateDeletePlayerDropdown();
        deletePlayerModal.style.display = 'block';
    });

    confirmDeleteButton.addEventListener('click', () => {
        const selectedOptions = Array.from(deletePlayerDropdown.selectedOptions);
        selectedOptions.forEach(option => {
            const playerName = option.value;
            previousPlayers = previousPlayers.filter(p => p !== playerName);
        });
        localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
        updateDeletePlayerDropdown();
        renderPreviousPlayers();
    });

    closeModal.addEventListener('click', () => {
        deletePlayerModal.style.display = 'none';
    });

    window.onclick = (event) => {
        if (event.target == deletePlayerModal) {
            deletePlayerModal.style.display = 'none';
        }
    };

    restartGameButton.addEventListener('click', () => {
        players.forEach(player => {
            player.result = 0;
            player.wins = 0;
        });
        gamesPlayed = 0;
        localStorage.setItem('players', JSON.stringify(players));
        localStorage.setItem('gamesPlayed', JSON.stringify(gamesPlayed));
        renderPlayers();
    });

    function updateAmounts() {
        const amountCells = document.querySelectorAll('#players td:nth-child(4)');
        amountCells.forEach(cell => {
            const value = parseFloat(cell.textContent.replace('$', ''));
            if (value < 0) {
                cell.classList.add('negative-amount');
                cell.classList.remove('positive-amount');
            } else if (value > 0) {
                cell.classList.add('positive-amount');
                cell.classList.remove('negative-amount');
            } else {
                cell.classList.remove('positive-amount');
                cell.classList.remove('negative-amount');
            }
        });
    }

    renderPlayers();
    renderGamesPlayed();
    renderPastPlayers();
});
