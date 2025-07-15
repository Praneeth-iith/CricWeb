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
        this.createdAt = Date.now();
        this.lastActivity = Date.now();
        
        // Set game mode
        setGameMode(this.mode);
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        console.log('Generated room code:', code);
        return code;
    }

    // Convert room to plain object for storage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            mode: this.mode,
            maxPlayers: this.maxPlayers,
            totalRounds: this.totalRounds,
            timePerRound: this.timePerRound,
            wrongAnswerPenalty: this.wrongAnswerPenalty,
            players: Array.from(this.players.entries()),
            hostId: this.hostId,
            currentRound: this.currentRound,
            gameState: this.gameState,
            roundHistory: this.roundHistory,
            createdAt: this.createdAt,
            lastActivity: this.lastActivity
        };
    }

    // Create room from stored data
    static fromJSON(data) {
        const room = new GameRoom(data);
        room.id = data.id;
        room.players = new Map(data.players);
        room.hostId = data.hostId;
        room.currentRound = data.currentRound;
        room.gameState = data.gameState;
        room.roundHistory = data.roundHistory;
        room.createdAt = data.createdAt;
        room.lastActivity = data.lastActivity;
        return room;
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
        this.lastActivity = Date.now();
        
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
        this.lastActivity = Date.now();
        
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
        this.lastActivity = Date.now();
        this.startRound();
        
        return { success: true };
    }

    startRound() {
        this.playerSubmissions.clear();
        this.roundStartTime = Date.now();
        this.lastActivity = Date.now();
        
        // Generate challenge
        this.currentChallenge = this.generateChallenge();
        
        // Set timer
        this.roundTimer = setTimeout(() => {
            this.endRound();
        }, this.timePerRound * 1000);
    }

    generateChallenge() {
        const players = getCurrentPlayers();
        const randomPlayers = this.getRandomPlayers(players, 2);
        
        return {
            from: randomPlayers[0],
            to: randomPlayers[1],
            roundNumber: this.currentRound
        };
    }

    getRandomPlayers(players, count) {
        const shuffled = [...players].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    submitAnswer(playerId, answer) {
        if (this.gameState !== 'playing') {
            return { success: false, message: 'Game not in progress' };
        }

        const player = this.players.get(playerId);
        if (!player) {
            return { success: false, message: 'Player not found' };
        }

        // Check if player already submitted
        if (this.playerSubmissions.has(playerId)) {
            return { success: false, message: 'Already submitted' };
        }

        const submissionTime = Date.now();
        const timeTaken = Math.ceil((submissionTime - this.roundStartTime) / 1000 / 60); // minutes, rounded up

        // Validate answer
        const isCorrect = this.validateAnswer(answer);
        
        const submission = {
            playerId: playerId,
            answer: answer,
            timeTaken: timeTaken,
            isCorrect: isCorrect,
            submittedAt: submissionTime
        };

        this.playerSubmissions.set(playerId, submission);
        this.lastActivity = Date.now();

        // Update player stats
        if (isCorrect) {
            player.correctAnswers++;
            player.totalPenalty += timeTaken;
        } else {
            player.wrongSubmissions++;
            player.totalPenalty += this.wrongAnswerPenalty;
        }

        // Add to round data
        player.roundData.push({
            round: this.currentRound,
            timeTaken: timeTaken,
            isCorrect: isCorrect,
            penalty: isCorrect ? timeTaken : this.wrongAnswerPenalty
        });

        return { success: true, isCorrect: isCorrect };
    }

    validateAnswer(answer) {
        if (!this.currentChallenge) return false;
        
        const path = findShortestPath(this.currentChallenge.from, this.currentChallenge.to);
        
        if (!path || path.length === 0) {
            // No path exists, any answer gets points
            return true;
        }

        // Validate the submitted path
        if (!answer || answer.length < 2) return false;
        
        // Check if path is valid
        return this.isValidPath(answer);
    }

    isValidPath(path) {
        if (path.length < 2) return false;
        
        for (let i = 0; i < path.length - 1; i++) {
            const current = path[i];
            const next = path[i + 1];
            
            // Check if players are connected
            if (!arePlayersConnected(current, next)) {
                return false;
            }
        }
        
        return true;
    }

    endRound() {
        this.gameState = 'roundResults';
        this.lastActivity = Date.now();
        
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
            this.roundTimer = null;
        }

        // Store round results
        const roundResult = {
            roundNumber: this.currentRound,
            challenge: this.currentChallenge,
            submissions: Array.from(this.playerSubmissions.entries()),
            endedAt: Date.now()
        };

        this.roundHistory.push(roundResult);

        // Check if game is over
        if (this.currentRound >= this.totalRounds) {
            this.gameState = 'gameOver';
        }

        return roundResult;
    }

    nextRound() {
        if (this.gameState !== 'roundResults') {
            return { success: false, message: 'Not in round results state' };
        }

        if (this.currentRound >= this.totalRounds) {
            this.gameState = 'gameOver';
            return { success: false, message: 'Game over' };
        }

        this.currentRound++;
        this.gameState = 'playing';
        this.lastActivity = Date.now();
        this.startRound();

        return { success: true };
    }

    getRankings() {
        const players = Array.from(this.players.values());
        
        // Sort by problems solved (descending), then by penalty time (ascending)
        return players.sort((a, b) => {
            if (b.correctAnswers !== a.correctAnswers) {
                return b.correctAnswers - a.correctAnswers;
            }
            return a.totalPenalty - b.totalPenalty;
        });
    }

    deleteRound(roundNumber) {
        const roundIndex = this.roundHistory.findIndex(r => r.roundNumber === roundNumber);
        if (roundIndex === -1) return false;

        const round = this.roundHistory[roundIndex];
        this.roundHistory.splice(roundIndex, 1);
        this.lastActivity = Date.now();

        // Recalculate player stats
        this.recalculatePlayerStats();

        return true;
    }

    recalculatePlayerStats() {
        // Reset all player stats
        this.players.forEach(player => {
            player.correctAnswers = 0;
            player.totalPenalty = 0;
            player.wrongSubmissions = 0;
            player.roundData = [];
        });

        // Recalculate from remaining rounds
        this.roundHistory.forEach(round => {
            round.submissions.forEach(([playerId, submission]) => {
                const player = this.players.get(playerId);
                if (player) {
                    if (submission.isCorrect) {
                        player.correctAnswers++;
                        player.totalPenalty += submission.timeTaken;
                    } else {
                        player.wrongSubmissions++;
                        player.totalPenalty += this.wrongAnswerPenalty;
                    }

                    player.roundData.push({
                        round: round.roundNumber,
                        timeTaken: submission.timeTaken,
                        isCorrect: submission.isCorrect,
                        penalty: submission.isCorrect ? submission.timeTaken : this.wrongAnswerPenalty
                    });
                }
            });
        });
    }

    // Check if room is expired (older than 2 hours)
    isExpired() {
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;
        return (now - this.lastActivity) > twoHours;
    }
}

// Persistent Storage Manager
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'cricketConnect_rooms';
        this.CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
        this.channel = new BroadcastChannel('cricketConnect');
        
        // Listen for messages from other tabs
        this.channel.onmessage = (event) => {
            if (event.data.type === 'roomUpdate') {
                this.syncRooms();
            }
        };
        
        // Cleanup expired rooms periodically
        setInterval(() => {
            this.cleanupExpiredRooms();
        }, this.CLEANUP_INTERVAL);
    }

    // Save room to localStorage
    saveRoom(room) {
        const rooms = this.loadRooms();
        rooms[room.id] = room.toJSON();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rooms));
        
        // Notify other tabs
        this.channel.postMessage({ type: 'roomUpdate', roomId: room.id });
    }

    // Load room from localStorage
    loadRoom(roomId) {
        const rooms = this.loadRooms();
        const roomData = rooms[roomId];
        
        if (!roomData) return null;
        
        return GameRoom.fromJSON(roomData);
    }

    // Load all rooms from localStorage
    loadRooms() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading rooms:', error);
            return {};
        }
    }

    // Delete room from localStorage
    deleteRoom(roomId) {
        const rooms = this.loadRooms();
        delete rooms[roomId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rooms));
        
        // Notify other tabs
        this.channel.postMessage({ type: 'roomUpdate', roomId: roomId });
    }

    // Get all room IDs
    getAllRoomIds() {
        const rooms = this.loadRooms();
        return Object.keys(rooms);
    }

    // Cleanup expired rooms
    cleanupExpiredRooms() {
        const rooms = this.loadRooms();
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000;
        let hasChanges = false;

        for (const [roomId, roomData] of Object.entries(rooms)) {
            if ((now - roomData.lastActivity) > twoHours) {
                delete rooms[roomId];
                hasChanges = true;
                console.log('Cleaned up expired room:', roomId);
            }
        }

        if (hasChanges) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rooms));
            this.channel.postMessage({ type: 'roomUpdate' });
        }
    }

    // Sync rooms from storage (called when receiving broadcast message)
    syncRooms() {
        if (window.gameManager) {
            window.gameManager.syncFromStorage();
        }
    }
}

// Game Manager with persistent storage
class GameManager {
    constructor() {
        this.rooms = new Map();
        this.playerRooms = new Map(); // Track which room each player is in
        this.storage = new StorageManager();
        
        // Load existing rooms from storage
        this.loadFromStorage();
        
        // Make accessible globally for debugging
        window.gameManager = this;
    }

    // Load rooms from storage into memory
    loadFromStorage() {
        const roomIds = this.storage.getAllRoomIds();
        console.log('Loading rooms from storage:', roomIds);
        
        roomIds.forEach(roomId => {
            const room = this.storage.loadRoom(roomId);
            if (room && !room.isExpired()) {
                this.rooms.set(roomId, room);
                console.log('Loaded room:', roomId);
            } else if (room && room.isExpired()) {
                this.storage.deleteRoom(roomId);
                console.log('Deleted expired room:', roomId);
            }
        });
    }

    // Sync rooms from storage (called by broadcast message)
    syncFromStorage() {
        this.loadFromStorage();
        console.log('Synced rooms from storage');
    }

    createRoom(config, hostName) {
        const room = new GameRoom(config);
        const result = room.addPlayer(hostName, true);
        
        if (result.success) {
            this.rooms.set(room.id, room);
            this.playerRooms.set(result.playerId, room.id);
            
            // Save to storage
            this.storage.saveRoom(room);
            
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
        console.log('GameManager.joinRoom called with:', roomCode);
        
        // First try to get from memory
        let room = this.rooms.get(roomCode);
        
        // If not in memory, try to load from storage
        if (!room) {
            room = this.storage.loadRoom(roomCode);
            if (room && !room.isExpired()) {
                this.rooms.set(roomCode, room);
                console.log('Loaded room from storage:', roomCode);
            } else if (room && room.isExpired()) {
                this.storage.deleteRoom(roomCode);
                room = null;
            }
        }
        
        console.log('Available rooms:', Array.from(this.rooms.keys()));
        
        if (!room) {
            console.log('Room not found for code:', roomCode);
            return { success: false, message: 'Room not found' };
        }

        console.log('Room found:', room.id);
        const result = room.addPlayer(playerName, false);
        if (result.success) {
            this.playerRooms.set(result.playerId, roomCode);
            
            // Save updated room to storage
            this.storage.saveRoom(room);
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
            console.log('Deleting empty room:', roomId);
            this.rooms.delete(roomId);
            this.storage.deleteRoom(roomId);
        } else {
            // Save updated room to storage
            this.storage.saveRoom(room);
        }

        return true;
    }

    getRoom(roomId) {
        let room = this.rooms.get(roomId);
        
        // If not in memory, try to load from storage
        if (!room) {
            room = this.storage.loadRoom(roomId);
            if (room && !room.isExpired()) {
                this.rooms.set(roomId, room);
            } else if (room && room.isExpired()) {
                this.storage.deleteRoom(roomId);
                room = null;
            }
        }
        
        return room;
    }

    updateRoom(room) {
        this.rooms.set(room.id, room);
        this.storage.saveRoom(room);
    }

    // Get all active rooms
    getAllRooms() {
        return Array.from(this.rooms.values());
    }

    // Manual cleanup method
    cleanupRooms() {
        this.storage.cleanupExpiredRooms();
        this.loadFromStorage();
    }
}

// Initialize
const gameManager = new GameManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameRoom,
        GameManager,
        gameManager,
        StorageManager
    };
} else {
    window.GameRoom = GameRoom;
    window.GameManager = GameManager;
    window.gameManager = gameManager;
    window.StorageManager = StorageManager;
}