# 🎮 Game Maker

A Scratch-like game creation tool with JSON scripting, character customization, a fight module, and LLM assistance.

## Features

- **Character Maker**: Customize two players with body colors, face features (eyes, mouth, mustache, hair)
- **JSON Script Editor**: Program game actions with a visual editor and LLM assistance
- **Fight Module**: Turn-based battles with weapon selection (sword, gun, nunchucks, throwing stars, bat, mace)
- **Scoreboard**: SQLite-backed win/loss tracking with leaderboard
- **Object Library**: Pre-made game objects (trees, rocks, coins, enemies, etc.)
- **Fun Actions**: Fart and poop effects for your characters! 💨💩

## Quick Start with Docker

### Using Docker Compose

```bash
docker-compose up -d
```

Access the app at `http://localhost:3000`

### Docker Hub Images

```bash
docker pull adamasp777/game-maker-frontend:latest
docker pull adamasp777/game-maker-backend:latest
```

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
| `VITE_API_URL` | `http://localhost:3001` | Backend API URL (frontend) |
| `OLLAMA_HOST` | `http://host.docker.internal:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3` | Model for script generation |
| `DB_PATH` | `/app/data/scores.db` | SQLite database path |

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
