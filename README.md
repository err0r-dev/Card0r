# Card0r

Create custom video e-cards for multiple recipients easily - A world-class video card generator with AI-powered personalization.

## Project Overview

Card0r is a full-stack web application that generates personalized, animated video greeting cards for multiple recipients. It features:

- **CSV/Excel Upload**: Bulk import recipients with messages
- **Manual Entry**: Add recipients one by one through the UI
- **17 Holiday Themes**: Christmas, New Year, Easter, Valentine's, Halloween, Thanksgiving, Jewish holidays (Rosh Hashanah, Hanukkah, Passover, Yom Kippur), Islamic holidays (Eid al-Fitr, Eid al-Adha, Ramadan), Asian holidays (Chinese New Year, Diwali, Lunar New Year)
- **AI-Powered Messages**: OpenAI GPT-4 generates personalized messages
- **Theme-Specific Decorations**: Each theme has unique animated decorations (snow, fireworks, hearts, bats, lanterns, etc.)
- **Multiple Export Formats**: 1080p, 4K, Square (Instagram), Social (Stories)
- **Background Music**: Jamendo music integration
- **Dark/Light Mode**: Full theme support
- **Auto-Generation**: Automatic message and video generation when prerequisites are met
- **Docker Ready**: Containerized deployment

## Architecture

### Monorepo Structure

```
Card0r/
├── frontend/          # Vite + React + TypeScript + shadcn/ui
├── backend/           # Node.js + Express + TypeScript + Remotion
├── remotion/          # Remotion video compositions and decorations
├── shared/            # Shared TypeScript types
└── docker-compose.yml # Container orchestration
```

### Technology Stack

**Frontend:**
- Vite 7.x
- React 19
- TypeScript 5.x
- TailwindCSS 3.x
- shadcn/ui (Radix UI components)
- Zustand (state management)
- Framer Motion (animations)
- React Hook Form
- papaparse (CSV parsing)
- xlsx (Excel parsing)

**Backend:**
- Node.js 20+
- Express 4.x
- TypeScript 5.x
- Remotion (React-based video rendering)
- OpenAI API (GPT-4)
- Jamendo API (music)
- Multer (file uploads)

**Remotion (Video Rendering):**
- React-based video compositions
- Theme-specific decoration components
- Particle systems with pre-seeded positions
- Dynamic video duration based on message length

## Features Implemented

### Frontend (100%)

1. **Project Setup**
   - Vite + React + TypeScript configured
   - TailwindCSS with dark mode support
   - shadcn/ui components installed
   - Custom CSS variables for theming

2. **State Management** (`frontend/src/stores/`)
   - `settingsStore.ts` - API keys, dark mode (persisted to localStorage)
   - `recipientsStore.ts` - Recipient management with sender name
   - `videoStore.ts` - Theme, format, music, job tracking
   - `uiStore.ts` - UI state, splash screen, current step

3. **UI Components** (`frontend/src/components/ui/`)
   - Button, Card, Dialog, Input, Label, Textarea
   - Progress, RadioGroup, Separator, Select, Sonner (toasts)

4. **Feature Components** (`frontend/src/components/`)
   - `SplashScreen.tsx` - Animated entrance with Framer Motion particles
   - `MainLayout.tsx` - Top nav, dark mode toggle, settings button
   - `SettingsModal.tsx` - API key management with validation
   - `FileUploader.tsx` - Drag-drop CSV/Excel upload
   - `RecipientForm.tsx` - Manual entry form with sender name
   - `RecipientTable.tsx` - List of recipients with edit/delete
   - `HolidaySelector.tsx` - 17 holiday cards in 4 categories
   - `FormatPicker.tsx` - Radio group for export formats
   - `MusicSelector.tsx` - Music track selection from Jamendo
   - `VideoGenerator.tsx` - Auto-triggering message and video generation
   - `VideoGallery.tsx` - Grid with preview and download
   - `DownloadStep.tsx` - Final download interface

5. **Auto-Generation Flow**
   - Automatic message generation when recipients, theme, and API key are ready
   - Automatic video generation when messages are complete
   - Progress tracking with polling
   - Auto-navigation to download step on completion

### Backend (100%)

1. **Express Server** (`backend/src/server.ts`)
   - CORS configured
   - Static file serving for videos
   - Error handling middleware
   - Health check endpoint

2. **API Routes** (`backend/src/routes/`)
   - `/api/validate-keys` - Validate OpenAI/Jamendo API keys
   - `/api/upload-csv` - Parse CSV/Excel files
   - `/api/generate-messages` - Generate personalized messages with OpenAI
   - `/api/music/:theme` - Fetch holiday music from Jamendo
   - `/api/videos/generate` - Start batch video generation
   - `/api/videos/status/:jobId` - Check generation progress

3. **Services** (`backend/src/services/`)
   - `validation.ts` - API key validation
   - `csv-parser.ts` - CSV/Excel parsing with flexible column detection
   - `openai-service.ts` - GPT-4 message generation with holiday-specific prompts
   - `jamendo-service.ts` - Music search and retrieval
   - `remotion-renderer.ts` - Remotion-based video rendering
   - `video-generator.ts` - Batch processing orchestrator

### Remotion Video System (100%)

1. **Compositions** (`remotion/src/`)
   - `Root.tsx` - Remotion composition registration
   - `CardComposition.tsx` - Main video composition with sequences
   - `types.ts` - Type definitions and theme colors

2. **Slides** (`remotion/src/slides/`)
   - `IntroSlide.tsx` - Theme name introduction (transparent background)
   - `NameRevealSlide.tsx` - Recipient name reveal (transparent background)
   - `MessageSlide.tsx` - Animated message display (transparent background)
   - `SenderSlide.tsx` - "From: [sender]" display (transparent background)
   - `OutroSlide.tsx` - Closing animation (transparent background)

3. **Decorations** (`remotion/src/decorations/`)
   - `ParticleDecoration.tsx` - Generic particle system (fallback)
   - `ChristmasDecoration.tsx` - Snow, Santa sleigh, lights, ornaments
   - `NewYearDecoration.tsx` - Fireworks, confetti, champagne bubbles
   - `ValentinesDecoration.tsx` - Hearts, rose petals, Cupid arrows
   - `EasterDecoration.tsx` - Easter eggs, bunnies, butterflies
   - `HalloweenDecoration.tsx` - Bats, ghosts, spiders, pumpkins
   - `ThanksgivingDecoration.tsx` - Autumn leaves, acorns, pumpkins
   - `HanukkahDecoration.tsx` - Menorah, Stars of David, dreidels, gelt
   - `DiwaliDecoration.tsx` - Diyas, rangoli, fireworks, sparklers
   - `ChineseNewYearDecoration.tsx` - Lanterns, dragon, red envelopes
   - `IslamicDecoration.tsx` - Crescents, lanterns, geometric patterns

4. **Animation System**
   - Pre-seeded Y/X positions for immediate visibility from frame 0
   - Reduced delays (30 frames vs 150-300) for faster appearance
   - Relative timing for special animations (Santa, Cupid arrows, sparklers)
   - Continuous particle animations throughout entire video

### Shared Types Package (100%)

- `shared/src/index.ts` - Complete TypeScript type definitions:
  - `HolidayTheme` enum (17 holidays)
  - `VideoFormat` enum (1080p, 4K, square, social)
  - `Recipient` interfaces
  - API request/response types
  - Video generation job types

## Getting Started

### Prerequisites

- Node.js 20+
- FFmpeg (for video encoding)
- OpenAI API key
- Jamendo API key (get from https://devportal.jamendo.com/)

### Installation

```bash
# Install dependencies (monorepo)
npm install

# Build all packages
npm run build
```

### Development

**Single Command (Recommended):**

```bash
# From root directory - starts both frontend and backend!
npm run dev
```

The backend will run on `http://localhost:3001` and frontend on `http://localhost:5173`.

**Or manually in separate terminals:**

```bash
# Terminal 1: Backend
cd backend
cp .env.example .env
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Building for Production

```bash
# Single command builds all packages (shared, remotion, frontend, backend)
npm run build

# Then start both services
npm start
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run detached
docker-compose up -d
```

## User Workflow

1. **Enter API Keys** - Settings modal for OpenAI and Jamendo keys
2. **Add Recipients** - Upload CSV/Excel or add manually with sender name
3. **Select Theme** - Choose from 17 holiday themes with visual previews
4. **Select Format** - Choose video dimensions (1080p, 4K, Square, Social)
5. **Select Music** - Browse and select background music (optional)
6. **Generate** - Auto-generates messages then videos with progress tracking
7. **Download** - Preview and download individual videos or all as ZIP

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/validate-keys` | POST | Validate API keys |
| `/api/upload-csv` | POST | Upload CSV/Excel file |
| `/api/generate-messages` | POST | Generate messages with OpenAI |
| `/api/music/:theme` | GET | Fetch music for theme |
| `/api/videos/generate` | POST | Start video generation |
| `/api/videos/status/:jobId` | GET | Check job status |
| `/videos/:filename` | GET | Download generated video |

## Environment Variables

### Backend (`.env`)

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
TEMP_DIR=./temp
VIDEOS_DIR=./videos
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3001/api
```

## License

MIT

## Credits

Built with:
- 17 holiday themes with custom animated decorations
- AI-powered personalization via OpenAI GPT-4
- React-based video rendering with Remotion
- Modern, responsive React interface with shadcn/ui
