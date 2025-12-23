# Card0r

Create custom video e-cards for multiple recipients easily - A world-class video card generator with AI-powered personalisation.

## Project Overview

Card0r is a full-stack web application that generates personalised, animated video greeting cards for multiple recipients. It features:

- **CSV/Excel Upload**: Bulk import recipients with downloadable template
- **Manual Entry**: Add recipients one by one through the UI
- **17 Holiday Themes**: Christmas, New Year, Easter, Valentine's, Halloween, Thanksgiving, Jewish holidays (Rosh Hashanah, Hanukkah, Passover, Yom Kippur), Islamic holidays (Eid al-Fitr, Eid al-Adha, Ramadan), Asian holidays (Chinese New Year, Diwali, Lunar New Year), plus Thank You and Congratulations themes
- **AI-Powered Messages**: OpenAI GPT-4 generates personalised messages with user review/edit before video generation
- **Theme-Specific Decorations**: Each theme has unique animated decorations with sparkle overlays and enhanced animations
- **Multiple Export Formats**: 1080p, 4K, Square (Instagram), Social (Stories)
- **Background Music**: Jamendo music integration
- **Dark/Light Mode**: Full theme support
- **Video Fade Transitions**: Smooth 1-second fade in/out on all videos
- **Batch ZIP Download**: Download all videos as a single ZIP file
- **Video Management**: Delete individual videos from UI and server
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
- Archiver (ZIP generation)

**Remotion (Video Rendering):**
- React-based video compositions
- Theme-specific decoration components with sparkle overlays
- Dynamic video duration based on message length
- 1-second fade in/out transitions

## Features Implemented

### Frontend (100%)

1. **Project Setup**
   - Vite + React + TypeScript configured
   - TailwindCSS with dark mode support
   - shadcn/ui components installed
   - Custom CSS variables for theming

2. **State Management** (`frontend/src/stores/`)
   - `settingsStore.ts` - API keys, dark mode (persisted to localStorage)
   - `recipientsStore.ts` - Recipient management with sender name, message confirmation state
   - `videoStore.ts` - Theme, format, music, job tracking with delete support
   - `uiStore.ts` - UI state, splash screen, wizard steps

3. **UI Components** (`frontend/src/components/ui/`)
   - Button, Card, Dialog, Input, Label, Textarea
   - Progress, RadioGroup, Separator, Select, Sonner (toasts)

4. **Feature Components** (`frontend/src/components/`)
   - `SplashScreen.tsx` - Animated entrance with Mail icon and Framer Motion particles
   - `MainLayout.tsx` - Top nav, dark mode toggle, settings button
   - `SettingsModal.tsx` - API key management with validation
   - `FileUploader.tsx` - Drag-drop CSV/Excel upload with FileSpreadsheet icon
   - `RecipientForm.tsx` - Manual entry form with sender name
   - `RecipientTable.tsx` - List of recipients with edit/delete
   - `HolidaySelector.tsx` - 17 holiday cards in 4 categories
   - `FormatPicker.tsx` - Radio group for export formats
   - `MusicSelector.tsx` - Music track selection from Jamendo
   - `VideoGenerator.tsx` - Message generation, review/edit, confirmation, and video generation
   - `VideoGallery.tsx` - Grid with preview, download, and delete functionality
   - `DownloadStep.tsx` - Final download interface with batch ZIP
   - `ConfirmStartOverDialog.tsx` - Warning dialog when starting over with videos

5. **Generation Flow**
   - Automatic message generation when prerequisites are met
   - **User must review, edit (optional), and confirm messages before video generation**
   - Manual video generation trigger after message confirmation
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
   - `/api/generate-messages` - Generate personalised messages with OpenAI
   - `/api/music/:theme` - Fetch holiday music from Jamendo
   - `/api/videos/generate` - Start batch video generation
   - `/api/videos/status/:jobId` - Check generation progress
   - `/api/videos/download-zip/:jobId` - Generate ZIP of all videos
   - `/api/videos/download-zip/:jobId/progress` - Check ZIP generation progress
   - `/api/videos/delete/:filename` - Delete a video file from server

3. **Services** (`backend/src/services/`)
   - `validation.ts` - API key validation
   - `csv-parser.ts` - CSV/Excel parsing with flexible column detection
   - `openai-service.ts` - GPT-4 message generation with holiday-specific prompts
   - `jamendo-service.ts` - Music search and retrieval
   - `remotion-renderer.ts` - Remotion-based video rendering
   - `video-generator.ts` - Batch processing orchestrator
   - `zip-generator.ts` - ZIP file generation for batch downloads

### Remotion Video System (100%)

1. **Compositions** (`remotion/src/`)
   - `Root.tsx` - Remotion composition registration
   - `CardComposition.tsx` - Main video composition with sequences and fade transitions
   - `types.ts` - Type definitions and theme colors

2. **Slides** (`remotion/src/slides/`)
   - `IntroSlide.tsx` - Theme name and recipient greeting (transparent background)
   - `MessageSlide.tsx` - Animated message display (transparent background)
   - `SenderSlide.tsx` - "From: [sender]" display (transparent background)
   - `OutroSlide.tsx` - Closing animation (transparent background)

3. **Decorations** (`remotion/src/decorations/`)
   - `ParticleDecoration.tsx` - Generic particle system (fallback)
   - `ChristmasDecoration.tsx` - Snow, Santa sleigh, lights, ornaments, sparkle overlay
   - `NewYearDecoration.tsx` - Fireworks, confetti, champagne bubbles
   - `ValentinesDecoration.tsx` - Hearts, rose petals, Cupid arrows
   - `EasterDecoration.tsx` - Easter eggs, bunnies, butterflies
   - `HalloweenDecoration.tsx` - Bats, ghosts, spiders, pumpkins
   - `ThanksgivingDecoration.tsx` - Autumn leaves, acorns, pumpkins
   - `HanukkahDecoration.tsx` - Menorah, Stars of David, dreidels, gelt
   - `DiwaliDecoration.tsx` - Diyas, rangoli, fireworks, sparklers
   - `ChineseNewYearDecoration.tsx` - Lanterns, dragon, red envelopes
   - `IslamicDecoration.tsx` - Crescents, lanterns, geometric patterns
   - `RoshHashanahDecoration.tsx` - Honey, apples, shofar, pomegranates
   - `PassoverDecoration.tsx` - Matzah, wine, seder plate elements
   - `ThankYouDecoration.tsx` - Hearts, flowers, ribbons, gifts
   - `CongratulationsDecoration.tsx` - Balloons, confetti, streamers, fireworks

4. **Animation Utilities** (`remotion/src/utils/`)
   - `animations.ts` - Core animation helpers
   - `decorationAnimations.tsx` - Shared animation components (SparkleOverlay, GlowPulse, etc.)

5. **Video Structure**
   - 1-second fade in at start
   - Intro slide (5 seconds)
   - Message slide (dynamic, based on message length)
   - Sender reveal slide (3 seconds)
   - Outro slide (3 seconds)
   - 1-second fade out at end

### Shared Types Package (100%)

- `shared/src/index.ts` - Complete TypeScript type definitions:
  - `HolidayTheme` enum (17 themes)
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
6. **Generate Messages** - AI generates personalised messages automatically
7. **Review & Edit** - Review generated messages, edit if needed, then confirm
8. **Generate Videos** - Videos are generated after message confirmation
9. **Download** - Preview, download individual videos, delete unwanted ones, or download all as ZIP

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
| `/api/videos/download-zip/:jobId` | POST | Start ZIP generation |
| `/api/videos/download-zip/:jobId/progress` | GET | Check ZIP progress |
| `/api/videos/delete/:filename` | DELETE | Delete a video file |
| `/api/videos/delete-batch` | POST | Delete multiple video files |
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
- 17 holiday themes with custom animated decorations and sparkle overlays
- AI-powered personalisation via OpenAI GPT-4
- React-based video rendering with Remotion
- Modern, responsive React interface with shadcn/ui

Created by [err0r.dev](https://err0r.dev)
