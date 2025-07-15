// Game Logic for Cricket Connect
class GameRoom {
    constructor(config) {
        this.id = this.generateRoomCode();
        this.name = config.roomName;
        this.mode = config.gameMode;
        this.maxPlayers = config.maxPlayers;
        this.totalRounds = config.rounds;
        this.timePerRound = config.timePerRound;
        this.wrongAnswerPenalty = config.wrongAnswerPenalty;
        
        this.players = new Map();
        this.hostId = null;
        this.currentRound = 0;
        this.gameState = 'lobby'; // lobby, playing, roundResults, gameOver
        this.roundHistory = [];
        this.currentChallenge = null;
        this.roundTimer = null;
        this.roundStartTime = null;
        this.playerSubmissions = new Map();
        
        // Set game mode
        setGameMode(this.mode);
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    addPlayer(playerName, isHost = false) {
        if (this.players.size >= this.maxPlayers) {
            return { success: false, message: 'Room is full' };
        }

        const playerId = this.generatePlayerId();
        const player = {
            id: playerId,
            name: playerName,
            isHost: isHost,
            correctAnswers: 0,
            totalPenalty: 0,
            roundData: [],
            wrongSubmissions: 0,
            joinedAt: Date.now()
        };

        this.players.set(playerId, player);
        
        if (isHost) {
            this.hostId = playerId;
        }

        return { success: true, playerId: playerId, player: player };
    }

    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (!player) return false;

        this.players.delete(playerId);
        
        // If host leaves, assign new host
        if (playerId === this.hostId && this.players.size > 0) {
            const newHost = this.players.values().next().value;
            newHost.isHost = true;
            this.hostId = newHost.id;
        }

        return true;
    }

    canStartGame() {
        return this.players.size >= 2 && this.gameState === 'lobby';
    }

    startGame() {
        if (!this.canStartGame()) {
            return { success: false, message: 'Cannot start game' };
        }

        this.gameState = 'playing';
        this.currentRound = 1;
        this.startRound();
        
        return { success: true };
    }

    startRound() {
        this.playerSubmissions.clear();
        this.roundStartTime = Date.now();
        
        // Generate challenge
        this.currentChallenge = this.generateChallenge();
        
        // Start timer
        this.roundTimer = setTimeout(() => {
            this.endRound();
        }, this.timePerRound * 1000);

        return this.currentChallenge;
    }

    generateChallenge() {
        const playerPair = currentGraph.getRandomPlayerPair();
        const shortestPath = currentGraph.findShortestPath(playerPair.player1, playerPair.player2);
        
        return {
            playerA: playerPair.player1,
            playerB: playerPair.player2,
            shortestPath: shortestPath,
            round: this.currentRound
        };
    }

    submitAnswer(playerId, answer) {
        const player = this.players.get(playerId);
        if (!player || this.gameState !== 'playing') {
            return { success: false, message: 'Invalid submission' };
        }

        const submissionTime = Date.now();
        const timeTaken = (submissionTime - this.roundStartTime) / 1000;

        // Validate answer
        const result = this.validateAnswer(answer, timeTaken);
        
        this.playerSubmissions.set(playerId, {
            answer: answer,
            timeTaken: timeTaken,
            submissionTime: submissionTime,
            result: result
        });

        return { success: true, result: result };
    }

    validateAnswer(answer, timeTaken) {
        const { playerA, playerB } = this.currentChallenge;
        
        if (answer.type === 'impossible') {
            // Check if connection is actually impossible
            const shortestPath = currentGraph.findShortestPath(playerA, playerB);
            if (!shortestPath) {
                return {
                    type: 'impossible',
                    correct: true,
                    timeTaken: timeTaken,
                    penalty: Math.ceil(timeTaken / 60) // Convert to minutes, round up
                };
            } else {
                return {
                    type: 'impossible',
                    correct: false,
                    timeTaken: timeTaken,
                    penalty: this.wrongAnswerPenalty * 60 // Convert to seconds for penalty
                };
            }
        } else if (answer.type === 'path') {
            const path = answer.path;
            
            // Validate path structure
            if (!Array.isArray(path) || path.length < 2) {
                return {
                    type: 'path',
                    correct: false,
                    timeTaken: timeTaken,
                    path: path,
                    penalty: this.wrongAnswerPenalty * 60
                };
            }

            // Check if path starts and ends correctly
            if (path[0] !== playerA || path[path.length - 1] !== playerB) {
                return {
                    type: 'path',
                    correct: false,
                    timeTaken: timeTaken,
                    path: path,
                    penalty: this.wrongAnswerPenalty * 60
                };
            }

            // Validate path connections
            const isValidPath = currentGraph.validatePath(path);
            if (!isValidPath) {
                return {
                    type: 'path',
                    correct: false,
                    timeTaken: timeTaken,
                    path: path,
                    penalty: this.wrongAnswerPenalty * 60
                };
            }

            // Valid path - calculate time penalty in minutes
            return {
                type: 'path',
                correct: true,
                timeTaken: timeTaken,
                path: path,
                pathLength: path.length - 1,
                penalty: Math.ceil(timeTaken / 60) // Convert to minutes, round up
            };
        }

        return {
            type: 'invalid',
            correct: false,
            timeTaken: timeTaken,
            penalty: this.wrongAnswerPenalty * 60
        };
    }

    endRound() {
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
            this.roundTimer = null;
        }

        this.gameState = 'roundResults';
        
        // Calculate final scores for the round
        this.calculateRoundScores();
        
        // Store round results
        const roundResult = {
            round: this.currentRound,
            challenge: this.currentChallenge,
            submissions: Object.fromEntries(this.playerSubmissions),
            leaderboard: this.getLeaderboard()
        };
        
        this.roundHistory.push(roundResult);
        
        return roundResult;
    }

    calculateRoundScores() {
        for (const [playerId, submission] of this.playerSubmissions) {
            const player = this.players.get(playerId);
            if (player) {
                // Update based on Codeforces-style scoring
                if (submission.result.correct) {
                    player.correctAnswers += 1;
                } else {
                    player.wrongSubmissions += 1;
                }
                
                // Add penalty (time for correct, penalty time for wrong)
                player.totalPenalty += submission.result.penalty;
                
                // Store round data
                player.roundData.push({
                    round: this.currentRound,
                    correct: submission.result.correct,
                    penalty: submission.result.penalty,
                    timeTaken: submission.timeTaken,
                    type: submission.result.type
                });
            }
        }
    }

    nextRound() {
        if (this.currentRound >= this.totalRounds) {
            this.gameState = 'gameOver';
            return { gameOver: true };
        }

        this.currentRound++;
        this.gameState = 'playing';
        this.startRound();
        
        return { success: true, round: this.currentRound };
    }

    getLeaderboard() {
        const playerArray = Array.from(this.players.values());
        return playerArray
            .sort((a, b) => {
                // Codeforces-style ranking: 
                // 1. Number of correct answers (descending)
                // 2. Total penalty (ascending)
                if (a.correctAnswers !== b.correctAnswers) {
                    return b.correctAnswers - a.correctAnswers;
                }
                
                return a.totalPenalty - b.totalPenalty;
            })
            .map((player, index) => ({
                rank: index + 1,
                playerId: player.id,
                name: player.name,
                correctAnswers: player.correctAnswers,
                totalPenalty: player.totalPenalty,
                wrongSubmissions: player.wrongSubmissions,
                totalTime: player.roundData.reduce((sum, round) => sum + round.timeTaken, 0)
            }));
    }

    deleteRound(roundNumber) {
        if (roundNumber < 1 || roundNumber > this.roundHistory.length) {
            return { success: false, message: 'Invalid round number' };
        }

        // Remove round from history
        this.roundHistory.splice(roundNumber - 1, 1);
        
        // Recalculate scores
        this.recalculateAllScores();
        
        // Adjust current round if necessary
        if (this.currentRound > this.roundHistory.length) {
            this.currentRound = this.roundHistory.length;
        }

        return { success: true };
    }

    recalculateAllScores() {
        // Reset all player scores
        for (const player of this.players.values()) {
            player.correctAnswers = 0;
            player.totalPenalty = 0;
            player.wrongSubmissions = 0;
            player.roundData = [];
        }

        // Recalculate from round history
        for (let i = 0; i < this.roundHistory.length; i++) {
            const round = this.roundHistory[i];
            round.round = i + 1; // Update round number
            
            for (const [playerId, submission] of Object.entries(round.submissions)) {
                const player = this.players.get(playerId);
                if (player) {
                    // Update based on Codeforces-style scoring
                    if (submission.result.correct) {
                        player.correctAnswers += 1;
                    } else {
                        player.wrongSubmissions += 1;
                    }
                    
                    // Add penalty
                    player.totalPenalty += submission.result.penalty;
                    
                    // Store round data
                    player.roundData.push({
                        round: i + 1,
                        correct: submission.result.correct,
                        penalty: submission.result.penalty,
                        timeTaken: submission.timeTaken,
                        type: submission.result.type
                    });
                }
            }
        }
    }

    getGameSummary() {
        const totalRounds = this.roundHistory.length;
        const averageTime = this.roundHistory.reduce((sum, round) => {
            const roundTimes = Object.values(round.submissions).map(s => s.timeTaken);
            const avgRoundTime = roundTimes.reduce((a, b) => a + b, 0) / roundTimes.length;
            return sum + avgRoundTime;
        }, 0) / totalRounds;

        const totalCorrect = Array.from(this.players.values()).reduce((sum, player) => sum + player.correctAnswers, 0);
        const totalWrong = Array.from(this.players.values()).reduce((sum, player) => sum + player.wrongSubmissions, 0);

        return {
            totalRounds: totalRounds,
            averageTime: averageTime,
            mode: this.mode,
            totalPlayers: this.players.size,
            totalCorrect: totalCorrect,
            totalWrong: totalWrong,
            gameTime: Date.now() - this.roundHistory[0]?.challenge?.round || 0
        };
    }
}

// Game Manager
class GameManager {
    constructor() {
        this.rooms = new Map();
        this.playerRooms = new Map(); // Track which room each player is in
    }

    createRoom(config, hostName) {
        const room = new GameRoom(config);
        const result = room.addPlayer(hostName, true);
        
        if (result.success) {
            this.rooms.set(room.id, room);
            this.playerRooms.set(result.playerId, room.id);
            
            return {
                success: true,
                roomId: room.id,
                playerId: result.playerId,
                room: room
            };
        }
        
        return result;
    }

    joinRoom(roomCode, playerName) {
        const room = this.rooms.get(roomCode);
        if (!room) {
            return { success: false, message: 'Room not found' };
        }

        const result = room.addPlayer(playerName, false);
        if (result.success) {
            this.playerRooms.set(result.playerId, roomCode);
        }

        return { ...result, room: room };
    }

    leaveRoom(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (!roomId) return false;

        const room = this.rooms.get(roomId);
        if (!room) return false;

        room.removePlayer(playerId);
        this.playerRooms.delete(playerId);

        // Delete room if empty
        if (room.players.size === 0) {
            this.rooms.delete(roomId);
        }

        return true;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    getPlayerRoom(playerId) {
        const roomId = this.playerRooms.get(playerId);
        return roomId ? this.rooms.get(roomId) : null;
    }
}

// Create global game manager
const gameManager = new GameManager();

// Utility functions
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatPath(path) {
    return path.join(' → ');
}

function getPlayerRank(score, leaderboard) {
    const playerEntry = leaderboard.find(entry => entry.score === score);
    return playerEntry ? playerEntry.rank : leaderboard.length + 1;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameRoom,
        GameManager,
        gameManager,
        formatTime,
        formatPath,
        getPlayerRank
    };
}