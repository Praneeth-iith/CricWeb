// Cricket Data and Graph Implementation
class CricketGraph {
    constructor(mode) {
        this.mode = mode;
        this.players = new Map();
        this.adjacencyList = new Map();
        this.initializeData();
    }

    initializeData() {
        if (this.mode === 'international') {
            this.initializeInternationalData();
        } else if (this.mode === 'ipl') {
            this.initializeIPLData();
        }
    }

    addPlayer(playerName, teams = []) {
        if (!this.players.has(playerName)) {
            this.players.set(playerName, {
                name: playerName,
                teams: teams,
                connections: new Set()
            });
            this.adjacencyList.set(playerName, new Set());
        }
    }

    addConnection(player1, player2) {
        if (this.players.has(player1) && this.players.has(player2)) {
            this.adjacencyList.get(player1).add(player2);
            this.adjacencyList.get(player2).add(player1);
            this.players.get(player1).connections.add(player2);
            this.players.get(player2).connections.add(player1);
        }
    }

    initializeInternationalData() {
        // Indian Players
        const indianPlayers = [
            'Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'Hardik Pandya', 'Ravindra Jadeja',
            'Jasprit Bumrah', 'KL Rahul', 'Shikhar Dhawan', 'Rishabh Pant', 'Mohammed Shami',
            'Bhuvneshwar Kumar', 'Yuzvendra Chahal', 'Kuldeep Yadav', 'Ajinkya Rahane',
            'Cheteshwar Pujara', 'Ishant Sharma', 'Umesh Yadav', 'Shubman Gill', 'Ishan Kishan',
            'Shreyas Iyer', 'Suryakumar Yadav', 'Washington Sundar', 'Axar Patel', 'Deepak Chahar',
            'Shardul Thakur', 'Mohammed Siraj', 'Mayank Agarwal', 'Prithvi Shaw', 'Sanju Samson',
            'Dinesh Karthik', 'Kedar Jadhav', 'Manish Pandey', 'Vijay Shankar', 'Krunal Pandya',
            'Rahul Chahar', 'Varun Chakravarthy', 'T Natarajan', 'Navdeep Saini', 'Khaleel Ahmed',
            'Arshdeep Singh', 'Avesh Khan', 'Harshal Patel', 'Venkatesh Iyer', 'Ruturaj Gaikwad'
        ];

        // Australian Players
        const australianPlayers = [
            'Steve Smith', 'David Warner', 'Pat Cummins', 'Mitchell Starc', 'Glenn Maxwell',
            'Aaron Finch', 'Josh Hazlewood', 'Adam Zampa', 'Marcus Stoinis', 'Alex Carey',
            'Mitchell Marsh', 'Marnus Labuschagne', 'Travis Head', 'Cameron Green', 'Tim David',
            'Josh Inglis', 'Sean Abbott', 'Kane Richardson', 'Daniel Sams', 'Ashton Turner',
            'Matthew Wade', 'Nathan Lyon', 'Usman Khawaja', 'Michael Neser', 'Jhye Richardson'
        ];

        // English Players
        const englishPlayers = [
            'Joe Root', 'Ben Stokes', 'Jonny Bairstow', 'Jos Buttler', 'Jofra Archer',
            'Mark Wood', 'Adil Rashid', 'Liam Livingstone', 'Moeen Ali', 'Chris Woakes',
            'Sam Curran', 'Jason Roy', 'Eoin Morgan', 'Dawid Malan', 'Harry Brook',
            'Phil Salt', 'Will Jacks', 'Reece Topley', 'Chris Jordan', 'Tom Curran',
            'Olly Stone', 'Joe Denly', 'Alex Hales', 'James Vince', 'Tymal Mills'
        ];

        // South African Players
        const southAfricanPlayers = [
            'Quinton de Kock', 'Faf du Plessis', 'AB de Villiers', 'Kagiso Rabada',
            'Anrich Nortje', 'Tabraiz Shamsi', 'David Miller', 'Rassie van der Dussen',
            'Temba Bavuma', 'Keshav Maharaj', 'Lungi Ngidi', 'Marco Jansen', 'Aiden Markram',
            'Heinrich Klaasen', 'Dwaine Pretorius', 'Wayne Parnell', 'Andile Phehlukwayo',
            'Reeza Hendricks', 'Janneman Malan', 'Tristan Stubbs'
        ];

        // Add all players
        [...indianPlayers, ...australianPlayers, ...englishPlayers, ...southAfricanPlayers]
            .forEach(player => this.addPlayer(player, ['International']));

        // Add connections based on international matches played together
        // India team connections
        const indiaCore = ['Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'Hardik Pandya', 'Ravindra Jadeja'];
        const indiaRegular = ['Jasprit Bumrah', 'KL Rahul', 'Shikhar Dhawan', 'Rishabh Pant', 'Mohammed Shami'];
        const indiaEmerging = ['Shubman Gill', 'Ishan Kishan', 'Shreyas Iyer', 'Suryakumar Yadav'];

        this.createFullConnections([...indiaCore, ...indiaRegular]);
        this.createFullConnections([...indiaCore, ...indiaEmerging]);
        this.createFullConnections(indiaRegular.slice(0, 3).concat(indiaEmerging));

        // Australia team connections
        const ausCore = ['Steve Smith', 'David Warner', 'Pat Cummins', 'Mitchell Starc', 'Glenn Maxwell'];
        const ausRegular = ['Aaron Finch', 'Josh Hazlewood', 'Adam Zampa', 'Marcus Stoinis', 'Alex Carey'];
        
        this.createFullConnections([...ausCore, ...ausRegular]);

        // England team connections
        const engCore = ['Joe Root', 'Ben Stokes', 'Jonny Bairstow', 'Jos Buttler', 'Jofra Archer'];
        const engRegular = ['Mark Wood', 'Adil Rashid', 'Liam Livingstone', 'Moeen Ali', 'Chris Woakes'];
        
        this.createFullConnections([...engCore, ...engRegular]);

        // South Africa team connections
        const safCore = ['Quinton de Kock', 'Faf du Plessis', 'AB de Villiers', 'Kagiso Rabada'];
        const safRegular = ['Anrich Nortje', 'Tabraiz Shamsi', 'David Miller', 'Rassie van der Dussen'];
        
        this.createFullConnections([...safCore, ...safRegular]);

        // Cross-team connections (players who played in various leagues together)
        this.addConnection('Virat Kohli', 'AB de Villiers');
        this.addConnection('Rohit Sharma', 'Quinton de Kock');
        this.addConnection('MS Dhoni', 'Faf du Plessis');
        this.addConnection('Jasprit Bumrah', 'Mitchell Starc');
        this.addConnection('KL Rahul', 'Chris Gayle');
        this.addConnection('Hardik Pandya', 'Ben Stokes');
        this.addConnection('Ravindra Jadeja', 'Moeen Ali');
    }

    initializeIPLData() {
        // IPL Teams and their players
        const rcbPlayers = [
            'Virat Kohli', 'AB de Villiers', 'Glenn Maxwell', 'Faf du Plessis', 'Dinesh Karthik',
            'Mohammed Siraj', 'Yuzvendra Chahal', 'Washington Sundar', 'Harshal Patel', 'Josh Hazlewood',
            'Wanindu Hasaranga', 'Shahbaz Ahmed', 'Akash Deep', 'Yash Dayal', 'Anuj Rawat',
            'Rajat Patidar', 'Mahipal Lomror', 'Suyash Prabhudessai', 'Karn Sharma', 'David Willey'
        ];

        const miPlayers = [
            'Rohit Sharma', 'Jasprit Bumrah', 'Hardik Pandya', 'Suryakumar Yadav', 'Ishan Kishan',
            'Kieron Pollard', 'Trent Boult', 'Rahul Chahar', 'Krunal Pandya', 'Quinton de Kock',
            'Tim David', 'Tilak Varma', 'Dewald Brevis', 'Jofra Archer', 'Cameron Green',
            'Jason Behrendorff', 'Piyush Chawla', 'Hrithik Shokeen', 'Arjun Tendulkar', 'Nehal Wadhera'
        ];

        const cskPlayers = [
            'MS Dhoni', 'Ravindra Jadeja', 'Ruturaj Gaikwad', 'Devon Conway', 'Moeen Ali',
            'Deepak Chahar', 'Dwayne Bravo', 'Ambati Rayudu', 'Faf du Plessis', 'Imran Tahir',
            'Ajinkya Rahane', 'Shivam Dube', 'Tushar Deshpande', 'Maheesh Theekshana', 'Matheesha Pathirana',
            'Rajvardhan Hangargekar', 'Mukesh Choudhary', 'Prashant Solanki', 'Nishant Sindhu', 'Shaik Rasheed'
        ];

        const delhiPlayers = [
            'Rishabh Pant', 'Shikhar Dhawan', 'Prithvi Shaw', 'Axar Patel', 'Amit Mishra',
            'Kagiso Rabada', 'Anrich Nortje', 'Marcus Stoinis', 'Shimron Hetmyer', 'David Warner',
            'Mitchell Marsh', 'Kuldeep Yadav', 'Khaleel Ahmed', 'Lalit Yadav', 'Yash Dhull',
            'Ripal Patel', 'Vicky Ostwal', 'Chetan Sakariya', 'Mustafizur Rahman', 'Lungi Ngidi'
        ];

        const kkrPlayers = [
            'Shreyas Iyer', 'Andre Russell', 'Sunil Narine', 'Dinesh Karthik', 'Eoin Morgan',
            'Pat Cummins', 'Varun Chakravarthy', 'Shubman Gill', 'Nitish Rana', 'Venkatesh Iyer',
            'Umesh Yadav', 'Tim Southee', 'Shardul Thakur', 'Rinku Singh', 'Anukul Roy',
            'Rahmanullah Gurbaz', 'Jason Roy', 'Suyash Sharma', 'Vaibhav Arora', 'Harshit Rana'
        ];

        const pbksPlayers = [
            'KL Rahul', 'Mayank Agarwal', 'Shikhar Dhawan', 'Arshdeep Singh', 'Mohammed Shami',
            'Kagiso Rabada', 'Chris Gayle', 'Nicholas Pooran', 'Liam Livingstone', 'Jonny Bairstow',
            'Sam Curran', 'Shahrukh Khan', 'Jitesh Sharma', 'Sikandar Raza', 'Rahul Chahar',
            'Harpreet Brar', 'Nathan Ellis', 'Vidwath Kaverappa', 'Atharva Taide', 'Prabhsimran Singh'
        ];

        const rrPlayers = [
            'Sanju Samson', 'Jos Buttler', 'Ben Stokes', 'Jofra Archer', 'Trent Boult',
            'Yuzvendra Chahal', 'Riyan Parag', 'Yashasvi Jaiswal', 'Shimron Hetmyer', 'Devdutt Padikkal',
            'Ravichandran Ashwin', 'Prasidh Krishna', 'Obed McCoy', 'Navdeep Saini', 'Dhruv Jurel',
            'Sandeep Sharma', 'KM Asif', 'Kuldeep Sen', 'Akash Vashisht', 'Donovan Ferreira'
        ];

        const srhPlayers = [
            'Kane Williamson', 'David Warner', 'Rashid Khan', 'Bhuvneshwar Kumar', 'T Natarajan',
            'Aiden Markram', 'Nicholas Pooran', 'Marco Jansen', 'Umran Malik', 'Washington Sundar',
            'Abhishek Sharma', 'Rahul Tripathi', 'Abdul Samad', 'Glenn Phillips', 'Mayank Markande',
            'Fazalhaq Farooqi', 'Mayank Agarwal', 'Anmolpreet Singh', 'Vivrant Sharma', 'Samarth Vyas'
        ];

        const gtPlayers = [
            'Hardik Pandya', 'Shubman Gill', 'Rashid Khan', 'Mohammed Shami', 'Lockie Ferguson',
            'David Miller', 'Wriddhiman Saha', 'Rahul Tewatia', 'Abhinav Manohar', 'Vijay Shankar',
            'Yash Dayal', 'Darshan Nalkande', 'Jayant Yadav', 'Kane Williamson', 'Matthew Wade',
            'Josh Little', 'Noor Ahmad', 'Sai Sudharsan', 'Kartik Tyagi', 'Mohit Sharma'
        ];

        const lsgPlayers = [
            'KL Rahul', 'Quinton de Kock', 'Marcus Stoinis', 'Deepak Hooda', 'Krunal Pandya',
            'Ravi Bishnoi', 'Avesh Khan', 'Jason Holder', 'Dushmantha Chameera', 'Ayush Badoni',
            'Manan Vohra', 'Karan Sharma', 'Mohsin Khan', 'Mayank Yadav', 'Prerak Mankad',
            'Kyle Mayers', 'Nicholas Pooran', 'Romario Shepherd', 'Amit Mishra', 'Arshad Khan'
        ];

        // Add all players
        const allIPLPlayers = [
            ...rcbPlayers, ...miPlayers, ...cskPlayers, ...delhiPlayers, ...kkrPlayers,
            ...pbksPlayers, ...rrPlayers, ...srhPlayers, ...gtPlayers, ...lsgPlayers
        ];

        // Remove duplicates and add players
        const uniqueIPLPlayers = [...new Set(allIPLPlayers)];
        uniqueIPLPlayers.forEach(player => this.addPlayer(player, ['IPL']));

        // Create connections within each team
        this.createFullConnections(rcbPlayers);
        this.createFullConnections(miPlayers);
        this.createFullConnections(cskPlayers);
        this.createFullConnections(delhiPlayers);
        this.createFullConnections(kkrPlayers);
        this.createFullConnections(pbksPlayers);
        this.createFullConnections(rrPlayers);
        this.createFullConnections(srhPlayers);
        this.createFullConnections(gtPlayers);
        this.createFullConnections(lsgPlayers);

        // Add cross-team connections for players who played in multiple IPL teams
        this.addConnection('Faf du Plessis', 'MS Dhoni'); // CSK to RCB
        this.addConnection('Deepak Chahar', 'MS Dhoni'); // CSK players
        this.addConnection('Shikhar Dhawan', 'Rishabh Pant'); // Delhi players
        this.addConnection('KL Rahul', 'Mayank Agarwal'); // PBKS to LSG
        this.addConnection('Yuzvendra Chahal', 'Sanju Samson'); // RCB to RR
        this.addConnection('Hardik Pandya', 'Rohit Sharma'); // MI to GT
        this.addConnection('David Warner', 'Kane Williamson'); // SRH players
        this.addConnection('Quinton de Kock', 'Ishan Kishan'); // MI to LSG
        this.addConnection('Marcus Stoinis', 'Rishabh Pant'); // Delhi to LSG
        this.addConnection('Rashid Khan', 'Shubman Gill'); // SRH to GT
    }

    createFullConnections(players) {
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                this.addConnection(players[i], players[j]);
            }
        }
    }

    getAllPlayers() {
        return Array.from(this.players.keys()).sort();
    }

    getPlayerConnections(playerName) {
        return this.adjacencyList.get(playerName) || new Set();
    }

    // Dijkstra's algorithm to find shortest path
    findShortestPath(startPlayer, endPlayer) {
        if (!this.players.has(startPlayer) || !this.players.has(endPlayer)) {
            return null;
        }

        if (startPlayer === endPlayer) {
            return { path: [startPlayer], distance: 0 };
        }

        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();

        // Initialize distances
        for (const player of this.players.keys()) {
            distances.set(player, Infinity);
            unvisited.add(player);
        }
        distances.set(startPlayer, 0);

        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let currentPlayer = null;
            let minDistance = Infinity;
            
            for (const player of unvisited) {
                if (distances.get(player) < minDistance) {
                    minDistance = distances.get(player);
                    currentPlayer = player;
                }
            }

            if (currentPlayer === null || minDistance === Infinity) {
                break;
            }

            unvisited.delete(currentPlayer);

            if (currentPlayer === endPlayer) {
                break;
            }

            // Update distances to neighbors
            const neighbors = this.getPlayerConnections(currentPlayer);
            for (const neighbor of neighbors) {
                if (unvisited.has(neighbor)) {
                    const newDistance = distances.get(currentPlayer) + 1;
                    if (newDistance < distances.get(neighbor)) {
                        distances.set(neighbor, newDistance);
                        previous.set(neighbor, currentPlayer);
                    }
                }
            }
        }

        // Reconstruct path
        const path = [];
        let current = endPlayer;
        
        while (current !== undefined) {
            path.unshift(current);
            current = previous.get(current);
        }

        if (path[0] === startPlayer) {
            return {
                path: path,
                distance: distances.get(endPlayer)
            };
        }

        return null; // No path found
    }

    // Validate if a path is correct
    validatePath(path) {
        if (path.length < 2) {
            return false;
        }

        for (let i = 0; i < path.length - 1; i++) {
            const connections = this.getPlayerConnections(path[i]);
            if (!connections.has(path[i + 1])) {
                return false;
            }
        }

        return true;
    }

    // Get random player pairs for challenges
    getRandomPlayerPair() {
        const allPlayers = this.getAllPlayers();
        const player1 = allPlayers[Math.floor(Math.random() * allPlayers.length)];
        let player2 = allPlayers[Math.floor(Math.random() * allPlayers.length)];
        
        // Ensure different players
        while (player2 === player1) {
            player2 = allPlayers[Math.floor(Math.random() * allPlayers.length)];
        }

        return { player1, player2 };
    }

    // Search players by name
    searchPlayers(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        for (const playerName of this.players.keys()) {
            if (playerName.toLowerCase().includes(queryLower)) {
                results.push(playerName);
            }
        }
        
        return results.sort();
    }
}

// Global variables for game data
let internationalGraph = null;
let iplGraph = null;
let currentGraph = null;

// Initialize graphs
function initializeCricketData() {
    internationalGraph = new CricketGraph('international');
    iplGraph = new CricketGraph('ipl');
    console.log('Cricket data initialized');
    console.log('International players:', internationalGraph.getAllPlayers().length);
    console.log('IPL players:', iplGraph.getAllPlayers().length);
}

// Set current graph based on game mode
function setGameMode(mode) {
    if (mode === 'international') {
        currentGraph = internationalGraph;
    } else if (mode === 'ipl') {
        currentGraph = iplGraph;
    }
    return currentGraph;
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CricketGraph,
        initializeCricketData,
        setGameMode
    };
}

// Initialize data when script loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCricketData();
});