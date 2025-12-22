# Card0r - Command Reference

Quick reference for all available commands.

## 🚀 Quick Start

```bash
# From root directory
npm run dev
```

That's it! Both frontend and backend start simultaneously.

---

## Development Commands

### From Root Directory

| Command | Description |
|---------|-------------|
| `npm run dev` | **Start both frontend and backend** (recommended) |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run build` | Build all packages (shared, frontend, backend) |
| `npm run build:shared` | Build shared types package only |
| `npm run build:frontend` | Build frontend only |
| `npm run build:backend` | Build backend only |
| `npm run install:all` | Install all dependencies (root, shared, frontend, backend) |
| `npm start` | Start both services in production mode |

### From Frontend Directory

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### From Backend Directory

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with tsx watch mode (port 3001) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start compiled backend in production |
| `npm run lint` | Run ESLint |

### From Shared Directory

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript types |
| `npm run dev` | Watch mode for type compilation |

---

## Docker Commands

| Command | Description |
|---------|-------------|
| `docker-compose up` | Start both services with Docker |
| `docker-compose up --build` | Rebuild and start services |
| `docker-compose up -d` | Start in detached mode (background) |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | Follow logs from all services |
| `docker-compose logs -f backend` | Follow backend logs only |
| `docker-compose logs -f frontend` | Follow frontend logs only |
| `docker-compose restart` | Restart all services |

---

## Workflow Examples

### First Time Setup

```bash
# 1. Clone and enter directory
cd /Users/jonathanisaacs/Documents/Git/Card0r

# 2. Install all dependencies
npm run install:all

# 3. Build shared types
npm run build:shared

# 4. Create backend .env file
cd backend
cp .env.example .env
cd ..

# 5. Start development
npm run dev

# 6. Open browser to http://localhost:5173
```

### Daily Development

```bash
# Just one command!
npm run dev
```

### Testing a Build

```bash
# Build everything
npm run build

# Start production mode
npm start

# Open http://localhost:5173 (frontend preview)
# Backend at http://localhost:3001
```

### Docker Development

```bash
# Start with Docker
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:3001

# Stop with Ctrl+C, or:
docker-compose down
```

---

## Useful One-Liners

```bash
# Check if FFmpeg is installed
ffmpeg -version

# Check Node version
node --version

# View backend logs in real-time
cd backend && npm run dev | grep "Error"

# Clean all node_modules
rm -rf node_modules frontend/node_modules backend/node_modules shared/node_modules

# Reinstall everything fresh
npm run install:all

# Check backend health
curl http://localhost:3001/health

# Test API key validation
curl -X POST http://localhost:3001/api/validate-keys \
  -H "Content-Type: application/json" \
  -d '{"openai":"test","jamendo":"test"}'

# View generated videos
ls -lh backend/videos/

# Clean up generated videos and temp files
rm -rf backend/videos/* backend/temp/*
```

---

## Troubleshooting Commands

### Backend won't start

```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process using port 3001
kill -9 $(lsof -t -i:3001)

# Verify FFmpeg installation
which ffmpeg
ffmpeg -version

# Check for TypeScript errors
cd backend && npx tsc --noEmit

# View detailed error logs
cd backend && NODE_ENV=development npm run dev
```

### Frontend won't start

```bash
# Check if port 5173 is in use
lsof -i :5173

# Kill process using port 5173
kill -9 $(lsof -t -i:5173)

# Clear Vite cache
cd frontend && rm -rf node_modules/.vite

# Reinstall dependencies
cd frontend && rm -rf node_modules && npm install
```

### Build issues

```bash
# Clean build artifacts
rm -rf frontend/dist backend/dist shared/dist

# Rebuild shared types first
cd shared && npm run build

# Then rebuild frontend and backend
cd ../frontend && npm run build
cd ../backend && npm run build
```

### Docker issues

```bash
# Clean Docker cache
docker-compose down
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up

# View container logs
docker logs card0r-frontend
docker logs card0r-backend

# Enter container for debugging
docker exec -it card0r-backend sh
docker exec -it card0r-frontend sh
```

---

## Environment Setup

### macOS

```bash
# Install Node.js (if not installed)
brew install node

# Install FFmpeg
brew install ffmpeg

# Install dependencies
npm run install:all
```

### Linux (Ubuntu/Debian)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
sudo apt-get install -y build-essential

# Install dependencies
npm run install:all
```

### Windows

```bash
# Install Node.js from https://nodejs.org/
# Install FFmpeg from https://ffmpeg.org/download.html

# Install dependencies
npm run install:all
```

---

## Git Commands

```bash
# View changes
git status
git diff

# Stage all changes
git add .

# Commit
git commit -m "Your message"

# Push to remote
git push origin v1

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature
```

---

## Monitoring

```bash
# Watch backend logs
cd backend && npm run dev

# Watch frontend build
cd frontend && npm run dev

# Monitor video generation
watch -n 1 'ls -lh backend/videos/'

# Monitor system resources
top
htop  # if installed
```

---

## Quick Links

- Frontend Dev: http://localhost:5173
- Backend API: http://localhost:3001
- Backend Health: http://localhost:3001/health
- Docker Frontend: http://localhost:3000
- Docker Backend: http://localhost:3001

---

## Getting Help

```bash
# View this file
cat COMMANDS.md

# View quick start
cat QUICKSTART.md

# View full README
cat README.md

# View testing guide
cat TESTING.md

# View AI documentation
cat ai.md
```
