// Main Application Logic for Cricket Connect
class CricketConnectApp {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.currentRoom = null;
        this.currentPlayerId = null;
        this.currentPlayerName = null;
        this.isHost = false;
        this.gameTimer = null;
        this.currentPath = [];
        this.searchTimeout = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('mainMenu');
    }

    setupEventListeners() {
        // Form submissions
        document.getElementById('roomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createRoom();
        });

        document.getElementById('joinForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.joinRoom();
        });

        // Player search
        document.getElementById('playerSearch').addEventListener('input', (e) => {
            this.handlePlayerSearch(e.target.value);
        });

        // Modal clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Screen Management
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Room Management
    createRoom() {
        const config = {
            roomName: document.getElementById('roomName').value.trim(),
            gameMode: document.getElementById('gameMode').value,
            maxPlayers: parseInt(document.getElementById('maxPlayers').value),
            rounds: parseInt(document.getElementById('rounds').value),
            timePerRound: parseInt(document.getElementById('timePerRound').value),
            wrongAnswerPenalty: parseInt(document.getElementById('wrongAnswerPenalty').value)
        };

        const hostName = prompt('Enter your name:');
        if (!hostName || !hostName.trim()) return;

        const result = gameManager.createRoom(config, hostName.trim());
        if (result.success) {
            this.currentRoom = result.room;
            this.currentPlayerId = result.playerId;
            this.currentPlayerName = hostName.trim();
            this.isHost = true;
            console.log('Room created successfully with code:', result.room.id);
            this.showLobby();
        } else {
            alert('Failed to create room: ' + result.message);
        }
    }

    joinRoom() {
        const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
        const playerName = document.getElementById('playerName').value.trim();

        if (!roomCode || !playerName) {
            alert('Please enter both room code and your name');
            return;
        }

        console.log('Trying to join room with code:', roomCode);
        console.log('Available rooms:', Array.from(gameManager.rooms.keys()));
        
        const result = gameManager.joinRoom(roomCode, playerName);
        if (result.success) {
            this.currentRoom = result.room;
            this.currentPlayerId = result.playerId;
            this.currentPlayerName = playerName;
            this.isHost = false;
            this.showLobby();
        } else {
            alert('Failed to join room: ' + result.message);
        }
    }

    leaveRoom() {
        if (this.currentPlayerId) {
            gameManager.leaveRoom(this.currentPlayerId);
        }
        this.currentRoom = null;
        this.currentPlayerId = null;
        this.currentPlayerName = null;
        this.isHost = false;
        this.showMainMenu();
    }

    // Lobby Display
    showLobby() {
        this.showScreen('gameLobby');
        this.updateLobbyDisplay();
    }

    updateLobbyDisplay() {
        if (!this.currentRoom) return;

        // Update room info
        document.getElementById('lobbyRoomName').textContent = `Room: ${this.currentRoom.name}`;
        const roomCodeElement = document.getElementById('displayRoomCode');
        roomCodeElement.textContent = this.currentRoom.id;
        
        // Add click to copy functionality
        roomCodeElement.style.cursor = 'pointer';
        roomCodeElement.title = 'Click to copy room code';
        roomCodeElement.onclick = () => {
            navigator.clipboard.writeText(this.currentRoom.id).then(() => {
                const originalText = roomCodeElement.textContent;
                roomCodeElement.textContent = 'Copied!';
                setTimeout(() => {
                    roomCodeElement.textContent = originalText;
                }, 1000);
            }).catch(err => {
                console.log('Could not copy text: ', err);
            });
        };

        // Update settings
        document.getElementById('settingMode').textContent = 
            this.currentRoom.mode === 'ipl' ? 'IPL' : 'International';
        document.getElementById('settingRounds').textContent = this.currentRoom.totalRounds;
        document.getElementById('settingTime').textContent = `${this.currentRoom.timePerRound}s`;
        document.getElementById('settingPenalty').textContent = this.currentRoom.wrongAnswerPenalty;

        // Update players list
        const playersList = document.getElementById('playersList');
        playersList.innerHTML = '';
        
        for (const player of this.currentRoom.players.values()) {
            const playerDiv = document.createElement('div');
            playerDiv.className = player.isHost ? 'player-item player-host' : 'player-item';
            playerDiv.innerHTML = `
                <span>${player.name}</span>
                <span>${player.isHost ? 'HOST' : 'PLAYER'}</span>
            `;
            playersList.appendChild(playerDiv);
        }

        // Show/hide start button
        const startBtn = document.getElementById('startGameBtn');
        if (this.isHost && this.currentRoom.canStartGame()) {
            startBtn.style.display = 'block';
        } else {
            startBtn.style.display = 'none';
        }
    }

    // Game Flow
    startGame() {
        if (!this.isHost || !this.currentRoom) return;

        const result = this.currentRoom.startGame();
        if (result.success) {
            this.showGameScreen();
            this.startRound();
        } else {
            alert('Failed to start game: ' + result.message);
        }
    }

    startRound() {
        if (!this.currentRoom) return;

        const challenge = this.currentRoom.currentChallenge;
        
        // Update round display
        document.getElementById('currentRound').textContent = this.currentRoom.currentRound;
        document.getElementById('totalRounds').textContent = this.currentRoom.totalRounds;
        document.getElementById('playerA').textContent = challenge.playerA;
        document.getElementById('playerB').textContent = challenge.playerB;

        // Reset UI
        this.clearPath();
        this.updatePlayerScore();
        this.updatePlayersList();

        // Start timer
        this.startGameTimer();
    }

    showGameScreen() {
        this.showScreen('gameScreen');
    }

    startGameTimer() {
        const timeLimit = this.currentRoom.timePerRound;
        let timeRemaining = timeLimit;
        
        const timerDisplay = document.getElementById('timeRemaining');
        
        this.gameTimer = setInterval(() => {
            timeRemaining--;
            timerDisplay.textContent = timeRemaining;
            
            if (timeRemaining <= 10) {
                timerDisplay.classList.add('timer-warning');
            }
            
            if (timeRemaining <= 0) {
                clearInterval(this.gameTimer);
                this.timeUp();
            }
        }, 1000);
    }

    timeUp() {
        // Auto-submit current answer if any
        if (this.currentPath.length >= 2) {
            this.submitAnswer();
        }
        
        // End round
        this.endRound();
    }

    // Player Search and Path Building
    handlePlayerSearch(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            this.searchPlayers(query);
        }, 300);
    }

    searchPlayers(query) {
        const searchResults = document.getElementById('searchResults');
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        const results = currentGraph.searchPlayers(query);
        const filteredResults = results.filter(player => 
            player !== this.currentRoom.currentChallenge.playerA &&
            player !== this.currentRoom.currentChallenge.playerB &&
            !this.currentPath.includes(player)
        );

        searchResults.innerHTML = '';
        filteredResults.slice(0, 10).forEach(player => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.textContent = player;
            item.onclick = () => this.addPlayerToPath(player);
            searchResults.appendChild(item);
        });
    }

    addPlayerToPath(playerName) {
        const { playerA, playerB } = this.currentRoom.currentChallenge;
        
        if (this.currentPath.length === 0) {
            this.currentPath = [playerA, playerName];
        } else {
            // Insert before the last player (playerB)
            this.currentPath.splice(-1, 0, playerName);
        }
        
        // Ensure path ends with playerB
        if (this.currentPath[this.currentPath.length - 1] !== playerB) {
            this.currentPath.push(playerB);
        }
        
        this.updatePathDisplay();
        this.clearSearch();
    }

    clearSearch() {
        document.getElementById('playerSearch').value = '';
        document.getElementById('searchResults').innerHTML = '';
    }

    updatePathDisplay() {
        const pathMiddle = document.getElementById('pathMiddle');
        const currentPathDiv = document.getElementById('currentPath');
        
        // Update visual path
        pathMiddle.innerHTML = '';
        if (this.currentPath.length > 2) {
            const intermediatePlayers = this.currentPath.slice(1, -1);
            intermediatePlayers.forEach(player => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'intermediate-player';
                playerDiv.textContent = player;
                pathMiddle.appendChild(playerDiv);
            });
        }

        // Update current path text
        if (this.currentPath.length >= 2) {
            currentPathDiv.innerHTML = `
                <strong>Current Path:</strong> ${formatPath(this.currentPath)}
                <br><strong>Distance:</strong> ${this.currentPath.length - 1}
            `;
        } else {
            currentPathDiv.innerHTML = '';
        }

        // Update start and end nodes
        const { playerA, playerB } = this.currentRoom.currentChallenge;
        document.getElementById('startNode').textContent = playerA;
        document.getElementById('endNode').textContent = playerB;
    }

    clearPath() {
        this.currentPath = [];
        this.updatePathDisplay();
        this.clearSearch();
    }

    // Answer Submission
    submitAnswer() {
        if (!this.currentRoom || this.currentRoom.gameState !== 'playing') {
            alert('Cannot submit answer at this time');
            return;
        }

        let answer;
        if (this.currentPath.length >= 2) {
            answer = {
                type: 'path',
                path: [...this.currentPath]
            };
        } else {
            alert('Please build a path or report as impossible');
            return;
        }

        const result = this.currentRoom.submitAnswer(this.currentPlayerId, answer);
        if (result.success) {
            this.showSubmissionFeedback(result.result);
        } else {
            alert('Failed to submit answer: ' + result.message);
        }
    }

    reportImpossible() {
        if (!this.currentRoom || this.currentRoom.gameState !== 'playing') {
            alert('Cannot report at this time');
            return;
        }

        const answer = { type: 'impossible' };
        const result = this.currentRoom.submitAnswer(this.currentPlayerId, answer);
        if (result.success) {
            this.showSubmissionFeedback(result.result);
        } else {
            alert('Failed to submit answer: ' + result.message);
        }
    }

    showSubmissionFeedback(result) {
        const feedback = document.createElement('div');
        feedback.className = 'submission-feedback';
        feedback.innerHTML = `
            <div class="feedback-content">
                <h3>${result.correct ? '✓ Correct!' : '✗ Incorrect'}</h3>
                <p>Time: ${result.timeTaken.toFixed(1)}s</p>
                <p>Penalty: ${result.penalty} min</p>
                ${result.correct ? '<p style="color: green;">+1 Problem Solved</p>' : '<p style="color: red;">Wrong Answer</p>'}
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    // Round Management
    endRound() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        const roundResult = this.currentRoom.endRound();
        this.showRoundResults(roundResult);
    }

    showRoundResults(roundResult) {
        this.showScreen('roundResults');
        
        // Update round number
        document.getElementById('resultRound').textContent = roundResult.round;
        
        // Show shortest path
        const shortestPath = roundResult.challenge.shortestPath;
        const shortestPathDiv = document.getElementById('shortestPath');
        const shortestDistanceSpan = document.getElementById('shortestDistance');
        
        if (shortestPath) {
            shortestPathDiv.textContent = formatPath(shortestPath.path);
            shortestDistanceSpan.textContent = shortestPath.distance;
        } else {
            shortestPathDiv.textContent = 'No connection possible';
            shortestDistanceSpan.textContent = '∞';
        }

        // Show round leaderboard
        this.updateLeaderboard('roundLeaderboard', roundResult.leaderboard);
        
        // Show/hide next round button
        const nextRoundBtn = document.getElementById('nextRoundBtn');
        const finalResultsBtn = document.getElementById('finalResultsBtn');
        
        if (roundResult.round >= this.currentRoom.totalRounds) {
            nextRoundBtn.style.display = 'none';
            finalResultsBtn.style.display = 'block';
        } else {
            nextRoundBtn.style.display = this.isHost ? 'block' : 'none';
            finalResultsBtn.style.display = 'none';
        }
    }

    nextRound() {
        if (!this.isHost || !this.currentRoom) return;

        const result = this.currentRoom.nextRound();
        if (result.gameOver) {
            this.showFinalResults();
        } else {
            this.showGameScreen();
            this.startRound();
        }
    }

    showFinalResults() {
        this.showScreen('finalResults');
        
        const finalLeaderboard = this.currentRoom.getLeaderboard();
        this.updateLeaderboard('finalLeaderboard', finalLeaderboard);
        
        // Show game summary
        const gameSummary = this.currentRoom.getGameSummary();
        document.getElementById('gameSummary').innerHTML = `
            <div class="summary-item">
                <span>Total Rounds:</span>
                <span>${gameSummary.totalRounds}</span>
            </div>
            <div class="summary-item">
                <span>Game Mode:</span>
                <span>${gameSummary.mode === 'ipl' ? 'IPL' : 'International'}</span>
            </div>
            <div class="summary-item">
                <span>Players:</span>
                <span>${gameSummary.totalPlayers}</span>
            </div>
            <div class="summary-item">
                <span>Total Correct:</span>
                <span>${gameSummary.totalCorrect}</span>
            </div>
            <div class="summary-item">
                <span>Total Wrong:</span>
                <span>${gameSummary.totalWrong}</span>
            </div>
            <div class="summary-item">
                <span>Average Time:</span>
                <span>${gameSummary.averageTime.toFixed(1)}s</span>
            </div>
        `;
    }

    // Leaderboard Display
    updateLeaderboard(containerId, leaderboard) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        leaderboard.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            if (entry.rank === 1) item.classList.add('first');
            else if (entry.rank === 2) item.classList.add('second');
            else if (entry.rank === 3) item.classList.add('third');
            
            item.innerHTML = `
                <div class="player-info">
                    <span class="rank">#${entry.rank}</span>
                    <span class="name">${entry.name}</span>
                </div>
                <div class="score-info">
                    <span class="score">${entry.correctAnswers} solved</span>
                    <span class="penalty">${entry.totalPenalty} min</span>
                    <span class="time">${formatTime(entry.totalTime)}</span>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    // Utility Functions
    updatePlayerScore() {
        const player = this.currentRoom.players.get(this.currentPlayerId);
        if (player) {
            document.getElementById('currentScore').textContent = `${player.correctAnswers} solved`;
        }
    }

    updatePlayersList() {
        const container = document.getElementById('gamePlayersList');
        container.innerHTML = '';
        
        for (const player of this.currentRoom.players.values()) {
            const item = document.createElement('div');
            item.className = 'player-online-item';
            item.innerHTML = `
                <span>${player.name}</span>
                <span>${player.correctAnswers} solved</span>
            `;
            container.appendChild(item);
        }
    }

    // Round History
    showRoundHistory() {
        const historyContent = document.getElementById('historyContent');
        historyContent.innerHTML = '';
        
        if (!this.currentRoom || this.currentRoom.roundHistory.length === 0) {
            historyContent.innerHTML = '<p>No rounds played yet.</p>';
            this.showModal('historyModal');
            return;
        }
        
        this.currentRoom.roundHistory.forEach(round => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round-history-item';
            
            const shortestPath = round.challenge.shortestPath;
            const shortestPathText = shortestPath ? 
                formatPath(shortestPath.path) : 'No connection possible';
            
            roundDiv.innerHTML = `
                <h4>Round ${round.round}</h4>
                <p><strong>Challenge:</strong> ${round.challenge.playerA} ↔ ${round.challenge.playerB}</p>
                <p><strong>Shortest Path:</strong> ${shortestPathText}</p>
                <p><strong>Distance:</strong> ${shortestPath ? shortestPath.distance : '∞'}</p>
                <div class="round-submissions">
                    <h5>Player Submissions:</h5>
                    ${Object.entries(round.submissions).map(([playerId, submission]) => {
                        const player = this.currentRoom.players.get(playerId);
                        const playerName = player ? player.name : 'Unknown';
                        const status = submission.result.correct ? '✓' : '✗';
                        return `
                            <div class="submission-item">
                                <span>${playerName}:</span>
                                <span>${status} ${submission.result.penalty} min (${submission.timeTaken.toFixed(1)}s)</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                ${this.isHost ? `
                    <button class="btn btn-danger btn-sm" onclick="app.deleteRound(${round.round})">
                        Delete Round
                    </button>
                ` : ''}
            `;
            
            historyContent.appendChild(roundDiv);
        });
        
        this.showModal('historyModal');
    }

    deleteRound(roundNumber) {
        if (!this.isHost || !this.currentRoom) return;
        
        if (confirm(`Are you sure you want to delete round ${roundNumber}?`)) {
            const result = this.currentRoom.deleteRound(roundNumber);
            if (result.success) {
                this.showRoundHistory(); // Refresh the display
                alert('Round deleted successfully');
            } else {
                alert('Failed to delete round: ' + result.message);
            }
        }
    }
}

// Global Functions (called from HTML)
function showMainMenu() {
    app.showScreen('mainMenu');
}

function showCreateRoom() {
    app.showScreen('createRoom');
}

function showJoinRoom() {
    app.showScreen('joinRoom');
}

function showRules() {
    app.showModal('rulesModal');
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function leaveRoom() {
    app.leaveRoom();
}

function startGame() {
    app.startGame();
}

function clearPath() {
    app.clearPath();
}

function reportImpossible() {
    app.reportImpossible();
}

function submitAnswer() {
    app.submitAnswer();
}

function nextRound() {
    app.nextRound();
}

function showFinalResults() {
    app.showFinalResults();
}

function showRoundHistory() {
    app.showRoundHistory();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new CricketConnectApp();
});