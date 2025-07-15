# Cricket Connect - The Ultimate Cricket Chain Game

**Created by Praneeth**

Cricket Connect is an innovative web-based multiplayer game that challenges players to connect cricket players through their teammates using their knowledge of cricket history. Test your cricket knowledge by finding the shortest path between any two players!

## 🎮 How to Play

### Game Concept
Connect two cricket players through intermediate players who have played with both. For example, to connect **Virat Kohli** and **Shubman Gill** in IPL mode, you might use: `Virat Kohli → Yash Dayal → Shubman Gill` (because Yash Dayal played with both Virat and Gill in IPL).

### Scoring System
- **Base Points**: 10 points for correct answers
- **Penalty System**: Your penalty = Your path distance - Shortest possible distance
- **Time Bonus**: Faster submissions may receive bonuses
- **Wrong Answer Penalty**: Customizable penalty for incorrect answers
- **Impossible Connections**: 5 points for correctly identifying impossible connections

## 🚀 Getting Started

### 1. Open the Game
Simply open `index.html` in your web browser. No installation required!

### 2. Create or Join a Room
- **Create Room**: Set up a new game room with custom settings
- **Join Room**: Enter a room code to join an existing game

### 3. Game Setup (Host Only)
Configure your game:
- **Room Name**: Give your room a memorable name
- **Game Mode**: Choose between International Cricket or IPL
- **Players**: Set maximum participants (2-10 players)
- **Rounds**: Number of rounds to play (1-20)
- **Time Limit**: Time per round (20 seconds - 2 minutes)
- **Penalty**: Points deducted for wrong answers

## 🎯 Game Features

### Two Game Modes
1. **International Cricket**: Connect players from international teams
2. **IPL Mode**: Connect players from Indian Premier League teams

### Multiplayer Support
- **Local Multiplayer**: Play with friends in the same room
- **Real-time Updates**: Live leaderboards and game state
- **Host Controls**: Room management and game flow control

### Advanced Features
- **Player Search**: Smart search to find cricket players
- **Path Visualization**: Visual representation of your connection path
- **Round History**: View all previous rounds and solutions
- **Leaderboards**: Round-by-round and final rankings
- **Answer Upgrades**: Modify your answer before time runs out

### Host Powers
- **Start Game**: Begin the game when ready
- **Round Management**: Control game flow between rounds
- **Delete Rounds**: Remove rounds and recalculate scores
- **Room Settings**: Manage game parameters

## 🏆 Scoring Details

### Points Calculation
```
Base Points = 10
Penalty = Your Path Length - Shortest Path Length
Final Score = Base Points - Penalty
```

### Example Scoring
- **Shortest Path**: 2 steps (distance = 1)
- **Your Path**: 4 steps (distance = 3)
- **Penalty**: 3 - 1 = 2
- **Final Score**: 10 - 2 = 8 points

### Special Cases
- **Impossible Connection**: 5 points if correctly identified
- **Wrong Answer**: -2 points (or custom penalty)
- **Time Bonus**: Faster correct answers may receive bonuses

## 🎪 Game Rules

### Connection Rules
1. **Valid Connections**: Players must have played together in at least one match in the selected domain
2. **Domain Specific**: International and IPL connections are separate
3. **Path Requirements**: Each intermediate player must connect to both adjacent players
4. **No Duplicates**: Each player can only appear once in your path

### Timing Rules
- **Round Timer**: Fixed time limit per round (20s - 2min)
- **Last Submission**: Only your final submission counts
- **Time Tracking**: Response time is recorded for tiebreakers

### Leaderboard Rules
- **Primary Sort**: Total points (descending)
- **Tiebreaker**: Total response time (ascending)
- **Live Updates**: Real-time leaderboard during game

## 🔧 Technical Features

### Graph Algorithm
- **Shortest Path**: Uses Dijkstra's algorithm to find optimal solutions
- **Path Validation**: Ensures all connections are valid
- **Real-time Search**: Fast player search with autocomplete

### Data Structure
- **Player Nodes**: Each cricket player is a node
- **Connection Edges**: Teammates connections form edges
- **Weight System**: All edges have equal weight (1)

### Performance
- **Efficient Search**: O(log n) player search
- **Fast Validation**: O(n) path validation
- **Optimized Updates**: Minimal DOM manipulation

## 🎨 User Interface

### Modern Design
- **Responsive Layout**: Works on desktop and mobile
- **Smooth Animations**: Enhanced user experience
- **Visual Feedback**: Clear indication of game state
- **Intuitive Controls**: Easy-to-use interface

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Clear Typography**: Readable fonts and sizing
- **Color Contrast**: Accessible color scheme
- **Screen Reader**: Semantic HTML structure

## 🌟 Game Modes Explained

### International Cricket Mode
- **Teams**: India, Australia, England, South Africa, and more
- **Connections**: Based on international match participation
- **Players**: 100+ international cricket players
- **Complexity**: Higher difficulty due to fewer cross-team connections

### IPL Mode
- **Teams**: All current IPL franchises
- **Connections**: Based on IPL team participation
- **Players**: 200+ IPL players
- **Complexity**: More interconnected due to player transfers

## 🎉 Pro Tips

### Strategy Tips
1. **Know Team Histories**: Understand player transfers and team changes
2. **Use All-Rounders**: Players who played for multiple teams are valuable bridges
3. **Think Recent**: Recent teammates are easier to remember
4. **International Players**: Foreign players often connect different teams

### Time Management
1. **Quick Assessment**: Quickly determine if direct connection exists
2. **Common Players**: Think of players who played with both targets
3. **Backup Plans**: Have alternative paths ready
4. **Submit Early**: Don't wait until the last second

### Advanced Tactics
1. **Meta Knowledge**: Understand which players are highly connected
2. **Era Awareness**: Know which players played in the same era
3. **Team Dynamics**: Understand team composition histories
4. **Transfer Patterns**: Know common player movement patterns

## 🔍 Troubleshooting

### Common Issues
- **Player Not Found**: Check spelling or try alternative name formats
- **Connection Invalid**: Ensure players actually played together
- **Room Full**: Maximum players reached, try joining another room
- **Time Expired**: Practice faster recognition of player connections

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **JavaScript Required**: Ensure JavaScript is enabled
- **Local Storage**: Used for temporary game state

## 🎮 Sample Gameplay

### Example Round
**Challenge**: Connect `MS Dhoni` ↔ `Virat Kohli` (IPL Mode)

**Possible Solutions**:
1. `MS Dhoni → Virat Kohli` (Direct - if they played together)
2. `MS Dhoni → Faf du Plessis → Virat Kohli` (Via CSK-RCB connection)
3. `MS Dhoni → Ravindra Jadeja → Virat Kohli` (Via national team)

**Optimal**: Direct connection (1 step) = 10 points
**Alternative**: 2-step path = 9 points (10 - 1 penalty)

## 🏅 Achievement System

### Scoring Milestones
- **Perfect Round**: All answers correct with minimum penalty
- **Speed Demon**: Fastest average response time
- **Cricket Genius**: Highest overall score
- **Impossible Expert**: Most impossible connections identified

### Statistics Tracking
- **Total Games**: Number of games played
- **Win Rate**: Percentage of games won
- **Average Score**: Mean score across all games
- **Best Performance**: Highest single-game score

## 🎊 Credits

**Game Created by**: Praneeth

**Technologies Used**:
- HTML5, CSS3, JavaScript
- Graph algorithms (Dijkstra's algorithm)
- Modern web APIs
- Responsive design principles

**Cricket Data**: Comprehensive database of cricket players and their team associations

---

Enjoy playing Cricket Connect and test your cricket knowledge! 🏏

*Remember: The game is all about connections - both in cricket and in knowledge!*