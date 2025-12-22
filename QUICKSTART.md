# Card0r Quick Start Guide

Get Card0r running in minutes!

## Prerequisites

Before you start, make sure you have:

1. **Node.js 20+** installed
2. **OpenAI API Key** from https://platform.openai.com/api-keys
3. **Jamendo API Key** from https://devportal.jamendo.com/

## Installation

### Option 1: Local Development (Recommended for Development)

```bash
# 1. Clone the repository
cd /Users/jonathanisaacs/Documents/Git/Card0r

# 2. Install root dependencies
npm install

# 3. Build shared types package
cd shared
npm install
npm run build
cd ..

# 4. Install and setup backend
cd backend
npm install
cp .env.example .env
# Edit .env if needed (defaults are fine for local dev)
cd ..

# 5. Install frontend dependencies
cd frontend
npm install
cd ..
```

### Option 2: Docker (Recommended for Production)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the app at:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Running the Application

### Local Development - Single Command! 🚀

From the **root directory**, run:

```bash
npm run dev
```

This starts both frontend and backend simultaneously!
- Frontend: **http://localhost:5173**
- Backend: **http://localhost:3001**

### Alternative: Manual Start

If you prefer separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

```bash
# Single command builds everything (shared types, frontend, backend)
npm run build

# Then start both services
npm start
# Or manually:
# Backend: cd backend && npm start
# Frontend: cd frontend && npm run preview
```

## First Time Setup

1. **Click anywhere on the splash screen** to enter the app

2. **Click the Settings cog** (top-right) to add your API keys:
   - OpenAI API Key (required for message generation)
   - Jamendo API Key (required for music)

3. **You're ready!** Follow the 5-step workflow:
   - Step 1: Add Recipients (CSV upload or manual entry)
   - Step 2: Choose Holiday Theme (17 options)
   - Step 3: Select Export Format (1080p, 4K, Square, Social)
   - Step 4: Generate Videos (AI messages + video rendering)
   - Step 5: Download Your Videos

## Sample CSV File

Create a file called `recipients.csv`:

```csv
Name,Message
John Doe,Wishing you success and happiness in the new year
Jane Smith,Congratulations on your amazing achievements
Bob Johnson,Hope your holidays are filled with joy
```

## Troubleshooting

### Backend won't start
- Check that port 3001 is not in use
- Verify Node.js version: `node --version` (should be 20+)

### Frontend won't connect to backend
- Check backend is running on http://localhost:3001
- Verify CORS settings in backend/.env
- Check browser console for errors

### Video generation fails
- Verify API keys are correct in settings
- Check backend console for detailed error messages
- Ensure enough disk space for video files
- Make sure Remotion bundle exists (run `npm run build:remotion` from root)

## Project Structure

```
Card0r/
├── frontend/           # React app (Vite + TypeScript)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── stores/      # Zustand state management
│   │   └── lib/         # Utilities and API client
│   └── ...
├── backend/            # Express API server
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── server.ts    # Main server file
│   ├── temp/            # Temporary files
│   └── videos/          # Generated videos
├── shared/             # Shared TypeScript types
└── docker-compose.yml  # Docker configuration
```

## Video Generation Process

1. **CSV Upload/Manual Entry** → Recipients stored in state
2. **Theme Selection** → Holiday theme + visual effects chosen
3. **Format Selection** → Video dimensions selected
4. **Generate Messages** → OpenAI GPT-4 creates personalized messages
5. **Generate Videos** → For each recipient:
   - Remotion renders React-based video compositions
   - Dynamic duration based on message word count
   - Includes: intro, name reveal, message, sender, outro slides
   - Videos saved to backend/videos/
6. **Download** → Videos available for preview and download

## Performance Notes

- **Message Generation**: ~2-3 seconds per recipient (OpenAI API)
- **Video Generation**: ~30-60 seconds per video (depends on format)
  - 1080p: Fastest (~30-40s)
  - 4K: Slower (~60-90s due to 4x more pixels)
- **Batch Processing**: Videos generated sequentially (parallel coming soon)

## Next Steps

- Read the full README.md for detailed documentation
- Check out the 17 holiday themes and their visual effects
- Experiment with different export formats
- Try batch processing multiple recipients

## Support

- Issues: https://github.com/anthropics/claude-code/issues
- Documentation: See README.md

Enjoy creating personalized video cards with Card0r! 🎉
