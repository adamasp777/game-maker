# 🎮 Game Maker

A Scratch-like game creation tool with JSON scripting, character customization, a fight module, and LLM assistance.

## Features

### Core Features
- **Character Maker**: Customize two players with body colors, face features (eyes, mouth, mustache, hair)
- **JSON Script Editor**: Program game actions with a visual editor and LLM assistance
- **Fight Module**: Turn-based battles with weapon selection (sword, gun, nunchucks, throwing stars, bat, mace)
- **Scoreboard**: SQLite-backed win/loss tracking with leaderboard
- **Object Library**: Pre-made game objects (trees, rocks, coins, enemies, etc.)
- **Fun Actions**: Fart and poop effects for your characters! 💨💩

### NEW in v2.0+ - Multiplayer Features 🎮
- **User Authentication**: Register and login with username/password (JWT tokens)
- **Online Multiplayer**: Host or join games across different computers
- **Game Lobbies**: Create private rooms with 6-character codes
- **Real-time Sync**: Socket.IO for instant game updates
- **Victory Taunts**: Send custom messages to your opponent after winning
- **Easter Egg**: Type "rickroll" in your taunt to surprise your opponent! 🎵
- **7 Battle Arenas**: Dungeon, Stadium, Dojo, Space, Beach, Castle, Forest (with animations!)
- **User Profiles**: Track your wins/losses across multiplayer matches

## Quick Start with Docker

### Using Docker Compose

**Important:** Update `VITE_API_URL` in docker-compose.yml to match your server IP!

```bash
# Edit docker-compose.yml and set VITE_API_URL to your server IP
# Example: VITE_API_URL=http://192.168.4.13:3001

docker-compose up -d
```

Access the app at `http://YOUR_SERVER_IP:3000`

### Docker Hub Images

**Latest Version: 3.0.0** (Complete Multiplayer Overhaul)

```bash
docker pull adamasp777/game-maker-frontend:3.0.0
docker pull adamasp777/game-maker-backend:3.0.0
```

### What's New in v3.0.0:
- ✅ Both players choose their own weapons
- ✅ Host selects battle arena background
- ✅ Turn-based multiplayer combat
- ✅ Animated backgrounds in fights
- ✅ Victory taunts with rickroll easter egg
- ✅ Dynamic API URL (works on any network)

## Unraid Setup

### Option 1: Docker Compose Stack

Create a new stack in Unraid with this docker-compose.yml:

```yaml
services:
  game-maker-frontend:
    image: adamasp777/game-maker-frontend:latest
    container_name: game-maker-frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://YOUR_UNRAID_IP:3001
    restart: unless-stopped

  game-maker-backend:
    image: adamasp777/game-maker-backend:latest
    container_name: game-maker-backend
    ports:
      - "3001:3001"
    environment:
      - OLLAMA_HOST=http://YOUR_OLLAMA_IP:11434
      - OLLAMA_MODEL=llama3
      - DB_PATH=/app/data/scores.db
    volumes:
      - /mnt/user/appdata/game-maker:/app/data
    restart: unless-stopped
```

Replace:
- `YOUR_UNRAID_IP` with your Unraid server IP
- `YOUR_OLLAMA_IP` with your Ollama server IP (or use `host.docker.internal` if on same machine)

### Option 2: Individual Containers

**Frontend Container:**
- Repository: `adamasp777/game-maker-frontend:latest`
- Port: `3000:3000`
- Variable: `VITE_API_URL` = `http://YOUR_UNRAID_IP:3001`

**Backend Container:**
- Repository: `adamasp777/game-maker-backend:latest`
- Port: `3001:3001`
- Variable: `OLLAMA_HOST` = `http://YOUR_OLLAMA_IP:11434`
- Variable: `OLLAMA_MODEL` = `llama3`
- Variable: `DB_PATH` = `/app/data/scores.db`
- Path: `/mnt/user/appdata/game-maker` → `/app/data`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Backend API URL (frontend) - **MUST match your server IP!** |
| `JWT_SECRET` | `your-secret-key...` | Secret key for JWT tokens (backend) - **Change in production!** |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (backend) |
| `OLLAMA_HOST` | `http://host.docker.internal:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3` | Model for script generation |
| `DB_PATH` | `/app/data/scores.db` | SQLite database path |
| `LOG_LEVEL` | `DEBUG` | Logging level: DEBUG, INFO, WARN, ERROR |

## Cloudflare Tunnel Setup

When using Cloudflare tunnels, set up two tunnels:
- `fight.acunraid.com` → Frontend (port 3000)
- `apifight.acunraid.com` → Backend (port 3001)

The frontend automatically detects the Cloudflare tunnel and uses `apifight.acunraid.com` for API calls.

## Debug Logging

Both frontend and backend include detailed logging for debugging:

**Backend logs** (visible in Unraid Docker logs):
- HTTP request/response logging with timing
- Socket.IO connection events
- Authentication attempts
- Room join/leave events
- All errors with stack traces

**Frontend logs** (visible in browser console):
- API URL detection
- Socket.IO connection status
- Reconnection attempts
- Component state changes

Set `LOG_LEVEL=INFO` or `LOG_LEVEL=WARN` to reduce log verbosity in production.

## Game Scripting

Create game logic using JSON scripts:

```json
[
  { "action": "say", "text": "Hello!", "duration": 2000, "target": "player1" },
  { "action": "move", "x": 50, "y": 0, "target": "player1" },
  { "action": "jump", "height": 30, "target": "player2" },
  { "action": "attack", "target": "player1" },
  { "action": "fart", "target": "player1" },
  { "action": "poop", "target": "player2" },
  { "action": "wait", "ms": 1000 }
]
```

## Development

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend  
cd backend && npm install && npm run dev
```

## License

MIT
