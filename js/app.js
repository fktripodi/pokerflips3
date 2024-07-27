document.addEventListener('DOMContentLoaded', () => {
    // New code for handling the dropdown menu and page navigation
    const menuIcon = document.querySelector('.menu-icon');
    const dropdownContent = document.querySelector('.dropdown-content');
    const content = document.querySelector('.content');
    const addPlayersPage = document.getElementById('add-players-page');
    const addPlayersForm = document.getElementById('add-players-form');
    const addSelectedPlayersButton = document.getElementById('add-selected-players');
    const returnMainButton = document.getElementById('return-main');

    menuIcon.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', (event) => {
        if (!event.target.matches('.menu-icon')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });

    function showPage(pageNumber) {
        content.style.display = 'none';
        addPlayersPage.style.display = 'none';

        if (pageNumber === 1) {
            addPlayersPage.style.display = 'block';
            renderAddPlayersPage();
        } else {
            content.style.display = 'block';
        }
    }

    document.getElementById('add-players').addEventListener('click', () => {
        showPage(1);
    });

    document.getElementById('remove-players').addEventListener('click', () => {
        showPage(2);
    });

    document.getElementById('delete-names').addEventListener('click', () => {
        showPage(3);
    });

    document.getElementById('history').addEventListener('click', () => {
        showPage(4);
    });

    returnMainButton.addEventListener('click', () => {
        showPage(0);
    });

    addSelectedPlayersButton.addEventListener('click', () => {
        const selectedPlayers = document.querySelectorAll('#add-players-form input[type="checkbox"]:checked');
        selectedPlayers.forEach(checkbox => {
            const playerName = checkbox.value;
            if (!players.some(player => player.name === playerName)) {
                players.push({ name: playerName, wins: 0, result: 0 });
            }
        });
        localStorage.setItem('players', JSON.stringify(players));
        renderPlayers();
        showPage(0);
    });

    function handleCheckboxChange(event) {
        const checkbox = event.target;
        const playerName = checkbox.value;

        if (checkbox.checked) {
            // Add player
            if (!players.some(player => player.name === playerName)) {
                players.push({ name: playerName, wins: 0, result: 0 });
            }
        } else {
            // Remove player
            players = players.filter(player => player.name !== playerName);
        }

        localStorage.setItem('players', JSON.stringify(players));
        renderPlayers();
    }

    function renderAddPlayersPage() {
        addPlayersForm.innerHTML = '';
        const allPlayers = Array.from(new Set([...previousPlayers, ...players.map(p => p.name)])); // Combine and deduplicate
        allPlayers.sort((a, b) => a.localeCompare(b)); // Sort players alphabetically

        let leftColumn = document.createElement('div');
        leftColumn.classList.add('player-column');
        let rightColumn = document.createElement('div');
        rightColumn.classList.add('player-column');
        
        allPlayers.forEach((player, index) => {
            const isPlayerInGame = players.some(p => p.name === player);
            const playerCheckbox = document.createElement('div');
            playerCheckbox.classList.add('player-checkbox');
            playerCheckbox.innerHTML = `
                <label>
                    <input type="checkbox" value="${player}" ${isPlayerInGame ? 'checked' : ''}> 
                    ${player}
                </label>
            `;
            if (index % 2 === 0) {
                leftColumn.appendChild(playerCheckbox);
            } else {
                rightColumn.appendChild(playerCheckbox);
            }
        });

        addPlayersForm.appendChild(leftColumn);
        addPlayersForm.appendChild(rightColumn);

        // Attach event listeners to checkboxes
        const checkboxes = document.querySelectorAll('#add-players-form input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
    }

    // Existing code in the DOMContentLoaded event listener
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
    let gameValue = 50; // Default game value

    const chips = document.querySelectorAll('.chip');
    const customValueInput = document.getElementById('custom-value');

    // Set default selected chip
    const defaultChip = document.querySelector('.chip-50');
    defaultChip.classList.add('active');
    customValueInput.value = defaultChip.dataset.value;

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            gameValue = parseFloat(chip.dataset.value);
            customValueInput.value = gameValue; // Update the input field
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    customValueInput.addEventListener('input', () => {
        gameValue = parseFloat(customValueInput.value);
        chips.forEach(c => c.classList.remove('active'));
    });

    function playSound() {
        clickSound.play().catch(error => {
            console.error('Failed to play sound:', error);
        });
    }

    function truncateNames() {
        const playerNameCells = document.querySelectorAll('#players td:nth-child(2)');
        playerNameCells.forEach(cell => {
            const name = cell.textContent.trim();
            if (name.length > 5) {
                cell.textContent = name.substring(0, 5) + '..';
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
        truncateNames();
        renderGamesPlayed();
        renderPreviousPlayers();
        updateDeletePlayerDropdown();
        updateAmounts();

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

    function renderPreviousPlayers() {
        previousPlayersDropdown.innerHTML = '<option value="add" disabled selected>Add Player</option>';
        previousPlayersDropdown.innerHTML += '<option value="add-new">Add New Player</option>';
        previousPlayers.sort((a, b) => a.localeCompare(b)); // Sort players alphabetically
        previousPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            previousPlayersDropdown.appendChild(option);
        });
    }

    window.updatePlayer = (index, action, multiplier = 1) => {
        const activeChip = document.querySelector('.chip.active');
        if (!activeChip && isNaN(gameValue)) {
            alert('Please select a chip value or enter a custom value.');
            return;
        }

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
                previousPlayers = previousPlayers.filter(p => p !== selectedPlayer);
                localStorage.setItem('players', JSON.stringify(players));
                localStorage.setItem('previousPlayers', JSON.stringify(previousPlayers));
                renderPlayers();
                renderPreviousPlayers();
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
