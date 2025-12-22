# Card0r

Create custom video e-cards for multiple recipients easily - A world-class video card generator with AI-powered personalization.

## Project Overview

Card0r is a full-stack web application that generates personalized, animated video greeting cards for multiple recipients. It features:

- **CSV/Excel Upload**: Bulk import recipients with messages
- **Manual Entry**: Add recipients one by one through the UI
- **17 Holiday Themes**: Christmas, New Year, Easter, Valentine's, Halloween, Thanksgiving, Jewish holidays (Rosh Hashanah, Hanukkah, Passover, Yom Kippur), Islamic holidays (Eid al-Fitr, Eid al-Adha, Ramadan), Asian holidays (Chinese New Year, Diwali, Lunar New Year)
- **AI-Powered Messages**: OpenAI GPT-4 generates personalized messages
- **Holiday Visual Effects**: Particle effects (snow, fireworks, confetti), character animations, seasonal overlays, dynamic backgrounds
- **Multiple Export Formats**: 1080p, 4K, Square (Instagram), Social (Stories)
- **Background Music**: Pixabay music integration
- **Dark/Light Mode**: Full theme support
- **Docker Ready**: Containerized deployment
- **Electron Compatible**: Desktop app capability

## Architecture

### Monorepo Structure

```
Card0r/
├── frontend/          # Vite + React + TypeScript + shadcn/ui
├── backend/           # Node.js + Express + TypeScript + FFmpeg
└── shared/            # Shared TypeScript types
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
- FFmpeg (video encoding)
- node-canvas (frame generation)
- OpenAI API (GPT-4)
- Pixabay API (music)
- Multer (file uploads)

## What's Been Built

### ✅ Complete Backend (100%)

1. **Express Server** (`backend/src/server.ts`)
   - CORS configured
   - Static file serving for videos
   - Error handling middleware
   - Health check endpoint

2. **API Routes** (`backend/src/routes/`)
   - `/api/validate-keys` - Validate OpenAI/Pixabay API keys
   - `/api/upload-csv` - Parse CSV/Excel files
   - `/api/generate-messages` - Generate personalized messages with OpenAI
   - `/api/music/:theme` - Fetch holiday music from Pixabay
   - `/api/videos/generate` - Start batch video generation
   - `/api/videos/status/:jobId` - Check generation progress

3. **Services** (`backend/src/services/`)
   - `validation.ts` - API key validation
   - `csv-parser.ts` - CSV/Excel parsing with flexible column detection
   - `openai-service.ts` - GPT-4 message generation with holiday-specific prompts
   - `pixabay-service.ts` - Music search and retrieval
   - `canvas-renderer.ts` - **Advanced canvas-based frame generation**:
     - Holiday-specific color schemes (17 themes)
     - Particle systems (snow, confetti, fireworks, stars)
     - Dynamic backgrounds with gradients
     - Text animations (fade-in, word-by-word reveal)
     - Character/icon animations per theme
     - 30-second video structure (intro → name → message → outro)
   - `ffmpeg-service.ts` - Video encoding with audio mixing
   - `video-generator.ts` - Batch processing orchestrator

### ✅ Shared Types Package (100%)

- `shared/src/index.ts` - Complete TypeScript type definitions:
  - `HolidayTheme` enum (17 holidays)
  - `VideoFormat` enum (1080p, 4K, square, social)
  - `Recipient` interfaces
  - API request/response types
  - Video generation job types

### ⚠️ Partial Frontend (40%)

**Completed:**
1. **Project Setup**
   - Vite + React + TypeScript configured
   - TailwindCSS with dark mode support
   - shadcn/ui dependencies installed
   - Custom CSS variables for theming

2. **State Management** (`frontend/src/stores/`)
   - `settingsStore.ts` - API keys, dark mode (persisted to localStorage)
   - `recipientsStore.ts` - Recipient management
   - `videoStore.ts` - Theme, format, job tracking
   - `uiStore.ts` - UI state, splash screen, current step

3. **Utilities**
   - `lib/utils.ts` - cn() helper for Tailwind class merging
   - `lib/api.ts` - Complete API client for backend communication

4. **UI Components Started**
   - `components/ui/button.tsx` - Button component with variants

**Still Needed:**
1. Additional shadcn/ui components (Dialog, Input, Label, Select, Progress, etc.)
2. Splash screen component
3. Main app layout with dark mode toggle
4. Settings modal for API keys
5. File uploader with drag-drop
6. Manual recipient entry form
7. Recipient list/table manager
8. Holiday theme selector (visual cards for 17 holidays)
9. Export format picker
10. Video generation interface with progress tracking
11. Video gallery with preview and download
12. Main App.tsx router/flow

## Getting Started

### Prerequisites

- Node.js 20+
- FFmpeg installed on your system
- OpenAI API key
- Pixabay API key

### Installation

```bash
# Install dependencies (monorepo)
npm install

# Build shared types
cd shared && npm run build

# Install frontend dependencies
cd ../frontend && npm install

# Install backend dependencies
cd ../backend && npm install
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
# Single command builds all packages (shared, frontend, backend)
npm run build

# Then start both services
npm start

# Or manually:
# cd backend && npm start
# cd frontend && npm run preview
```

## Docker Deployment (To Be Implemented)

The project is structured for Docker but requires `Dockerfile`s and `docker-compose.yml`:

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Electron App (To Be Implemented)

The project can be packaged as a desktop app with Electron:

```bash
npm run electron:build
```

## Next Steps for Development

### Critical Frontend Components Needed

1. **Create remaining shadcn/ui components** in `frontend/src/components/ui/`:
   - Dialog (for Settings modal)
   - Input (for API keys, recipient form)
   - Label (for form fields)
   - Select (for dropdown menus)
   - Progress (for video generation progress)
   - Card (for holiday themes display)
   - RadioGroup (for format selection)
   - Separator (for visual dividers)

2. **Build SplashScreen component** (`frontend/src/components/SplashScreen.tsx`):
   - Animated logo/title
   - Particle effects using Framer Motion
   - Click-to-enter interaction
   - Fade transition to main app

3. **Build MainLayout component** (`frontend/src/components/MainLayout.tsx`):
   - Top navigation bar
   - Settings cog button (top-right)
   - Dark/light mode toggle (top-right)
   - Responsive container
   - Step indicator

4. **Build SettingsModal component** (`frontend/src/components/SettingsModal.tsx`):
   - OpenAI API key input
   - Pixabay API key input
   - Validation on save
   - Encrypted localStorage storage

5. **Build FileUploader component** (`frontend/src/components/FileUploader.tsx`):
   - Drag-and-drop zone
   - CSV/Excel file validation
   - Parse and display preview
   - Add to recipients list

6. **Build RecipientForm component** (`frontend/src/components/RecipientForm.tsx`):
   - Name input
   - Message guidance textarea
   - Add button
   - Form validation

7. **Build RecipientTable component** (`frontend/src/components/RecipientTable.tsx`):
   - Display all recipients
   - Edit inline
   - Delete button
   - Empty state

8. **Build HolidaySelector component** (`frontend/src/components/HolidaySelector.tsx`):
   - Grid of 17 holiday cards
   - Visual preview for each theme
   - Selected state styling
   - Category grouping (Western, Jewish, Islamic, Asian)

9. **Build FormatPicker component** (`frontend/src/components/FormatPicker.tsx`):
   - Radio group for 4 formats
   - Show dimensions for each
   - Visual preview

10. **Build VideoGenerator component** (`frontend/src/components/VideoGenerator.tsx`):
    - Generate button
    - Progress bars per recipient
    - Overall progress
    - Cancel option
    - Error handling

11. **Build VideoGallery component** (`frontend/src/components/VideoGallery.tsx`):
    - Grid of video thumbnails
    - Preview modal
    - Download button per video
    - Download all (ZIP)

12. **Build Main App.tsx**:
    - Conditional splash screen
    - Settings modal state
    - Step-based workflow
    - Dark mode class toggle on `<html>`

### Docker Configuration

Create the following files:

1. `frontend/Dockerfile`
2. `backend/Dockerfile`
3. `docker-compose.yml` (root)

### Electron Configuration

1. Install Electron dependencies
2. Create `electron/main.ts`
3. Create `electron/preload.ts`
4. Update `package.json` with Electron scripts

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

Built with world-class UX/UI in mind, featuring:
- 17 holiday themes with custom visual effects
- AI-powered personalization via OpenAI GPT-4
- Professional video encoding with FFmpeg
- Modern, responsive React interface with shadcn/ui
