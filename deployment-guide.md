# Cricket Connect Deployment Guide
## Deploy to cricweb.com

### 🚀 Quick Deployment Options

#### Option 1: GitHub Pages (Recommended for now)
1. **Push to GitHub**: All your code is already in the repository `Praneeth-iith/CricWeb`
2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Set source to "Deploy from a branch"
   - Select `cursor/cricket-connection-web-game-208f` branch
   - Root folder
   - Save

3. **Your site will be live at**: `https://praneeth-iith.github.io/CricWeb/`

#### Option 2: Netlify (Custom Domain Ready)
1. **Create Netlify Account**: [netlify.com](https://netlify.com)
2. **Connect GitHub Repository**:
   - Click "New site from Git"
   - Connect to GitHub
   - Select `Praneeth-iith/CricWeb` repository
   - Branch: `cursor/cricket-connection-web-game-208f`
   - Build command: leave empty
   - Publish directory: root `/`
   - Deploy site

3. **Add Custom Domain**:
   - Go to Domain Management in Netlify
   - Add `cricweb.com` as custom domain
   - Follow DNS configuration instructions

#### Option 3: Manual Deployment Files
All deployment files are ready in your project:
- `netlify.toml` - Netlify configuration
- `_redirects` - URL routing
- `package.json` - Project metadata
- `deploy.sh` - Deployment script

### 🌐 Domain Setup for cricweb.com

#### Step 1: Purchase Domain
- Buy `cricweb.com` from any registrar (Namecheap, GoDaddy, etc.)

#### Step 2: Configure DNS
For **Netlify**:
```
Type: CNAME
Name: www
Value: [your-netlify-site].netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

For **GitHub Pages**:
```
Type: CNAME
Name: www
Value: praneeth-iith.github.io

Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

#### Step 3: SSL Certificate
- Netlify: Automatically provided
- GitHub Pages: Enable HTTPS in settings

### 🛠️ Deployment Commands

#### Local Development
```bash
# Start local server
npm start
# or
python3 -m http.server 8000
```

#### Build for Production
```bash
# Already built - no build process needed
npm run build
```

#### Deploy to Netlify (when authenticated)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=.
```

### 📁 Project Structure
```
CricWeb/
├── index.html          # Main game interface
├── styles.css          # Modern styling
├── cricketData.js      # Player database & graph
├── gameLogic.js        # Game mechanics
├── app.js             # Main application
├── demo.html          # Graph demo
├── netlify.toml       # Deployment config
├── _redirects         # URL routing
├── package.json       # Project info
├── deploy.sh          # Deployment script
└── README.md          # Documentation
```

### 🎮 Game Features
- **Two Modes**: International Cricket & IPL
- **Multiplayer**: 2-10 players with room codes
- **Graph Algorithm**: Dijkstra's shortest path
- **Codeforces-style Scoring**: Problems solved + penalty time
- **Modern UI**: Responsive design with animations
- **Real-time Updates**: Live leaderboards and game state

### 🔧 Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Algorithm**: Dijkstra's shortest path
- **Database**: 100+ International + 200+ IPL players
- **Deployment**: Static hosting ready
- **Domain**: cricweb.com ready

### 📊 Scoring System
- **Primary**: Number of correct answers (descending)
- **Secondary**: Total penalty time in minutes (ascending)
- **Penalty**: Time taken + wrong answer penalties
- **Ranking**: Like Codeforces Division 3

### 🎯 Quick Start
1. Clone repository
2. Open `index.html` in browser
3. Choose game mode
4. Create/join room
5. Start playing!

### 🌟 Live Demo
Once deployed, access at:
- **Development**: `http://localhost:8000`
- **GitHub Pages**: `https://praneeth-iith.github.io/CricWeb/`
- **Final Domain**: `https://cricweb.com` (after domain setup)

### 📝 Credits
**Cricket connect @2025**
- Cricket Connect - The Ultimate Cricket Chain Game
- Advanced graph algorithms implementation
- Modern web game development
- Codeforces-style competitive scoring

---

**Ready to deploy!** 🚀 All files are configured and ready for production.