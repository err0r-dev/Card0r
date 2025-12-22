# Card0r - AI Assistant Documentation

This file provides comprehensive context for AI assistants (like Claude, ChatGPT, etc.) working on the Card0r project.

## Project Overview

**Card0r** is a full-stack TypeScript application that generates personalized video greeting cards using AI-powered message generation, canvas-based rendering, and FFmpeg video encoding.

**Tech Stack:**
- Frontend: React 19 + Vite + TypeScript + TailwindCSS + shadcn/ui
- Backend: Node.js + Express + TypeScript + FFmpeg + node-canvas
- AI: OpenAI GPT-4 for message generation
- Media: Pixabay API for music
- State: Zustand for client state management
- Deployment: Docker + docker-compose

---

## Architecture Overview

### Monorepo Structure

```
Card0r/
├── frontend/           # React SPA (port 5173 dev, 3000 prod)
├── backend/            # Express API (port 3001)
├── shared/             # Shared TypeScript types
├── docker-compose.yml  # Orchestrates both services
└── [docs]              # README, QUICKSTART, TESTING, BUILD_SUMMARY
```

### Data Flow

```
User → Frontend → Backend API → Services → FFmpeg/Canvas → Videos
                      ↓
                 OpenAI GPT-4 (messages)
                      ↓
                 Pixabay API (music)
```

---

## Key Components

### Backend Services

Located in `backend/src/services/`:

1. **validation.ts**
   - Validates OpenAI and Pixabay API keys
   - Makes test API calls to verify credentials
   - Returns validation status for each key

2. **csv-parser.ts**
   - Parses CSV and Excel (.xlsx, .xls) files
   - Smart column detection (name, message, recipient, etc.)
   - Handles malformed data gracefully
   - Returns recipients array with errors

3. **openai-service.ts**
   - Integrates with OpenAI GPT-4
   - Holiday-specific prompts for each theme
   - Generates ~75-100 word messages
   - Handles rate limiting and errors

4. **pixabay-service.ts**
   - Searches Pixabay for holiday-appropriate music
   - Filters by duration (30+ seconds)
   - Returns top 5 tracks per theme
   - Handles API errors gracefully

5. **canvas-renderer.ts** ⭐ MOST COMPLEX
   - Creates 900 frames (30 fps × 30 seconds)
   - Implements particle systems (snow, confetti, fireworks)
   - Dynamic gradient backgrounds
   - Text animations (fade-in, word-by-word reveals)
   - Holiday-specific color schemes for 17 themes
   - Returns PNG buffers for each frame

6. **ffmpeg-service.ts**
   - Encodes frames to video using FFmpeg
   - Mixes audio tracks
   - H.264 codec with quality optimization
   - Supports multiple resolutions (1080p, 4K, etc.)
   - Handles cleanup of temp files

7. **video-generator.ts**
   - Orchestrates entire video generation pipeline
   - Manages job queue (in-memory)
   - Tracks progress for each video
   - Handles batch processing
   - Cleanup after completion

### Backend Routes

Located in `backend/src/routes/`:

- **validation.ts** - `POST /api/validate-keys`
- **upload.ts** - `POST /api/upload-csv` (with Multer middleware)
- **messages.ts** - `POST /api/generate-messages` (requires x-openai-key header)
- **music.ts** - `GET /api/music/:theme` (requires x-pixabay-key header)
- **videos.ts** - `POST /api/videos/generate`, `GET /api/videos/status/:jobId`

### Frontend Components

Located in `frontend/src/components/`:

**UI Components** (`ui/`):
- button.tsx, dialog.tsx, input.tsx, label.tsx, textarea.tsx
- card.tsx, progress.tsx, radio-group.tsx, separator.tsx
- All based on Radix UI primitives with Tailwind styling

**Feature Components**:
1. **SplashScreen.tsx** - Animated entrance with Framer Motion
2. **MainLayout.tsx** - Top nav, dark mode toggle, settings button
3. **SettingsModal.tsx** - API key management with validation
4. **FileUploader.tsx** - Drag-drop CSV/Excel upload
5. **RecipientForm.tsx** - Manual entry form
6. **RecipientTable.tsx** - List of recipients with delete
7. **HolidaySelector.tsx** - 17 holiday cards in 4 categories
8. **FormatPicker.tsx** - Radio group for export formats
9. **VideoGenerator.tsx** - Two-step generation with progress polling
10. **VideoGallery.tsx** - Grid with preview and download

### Frontend Stores

Located in `frontend/src/stores/`:

1. **settingsStore.ts**
   - Persisted to localStorage
   - Stores: openaiKey, pixabayKey, darkMode
   - Actions: setters and toggleDarkMode

2. **recipientsStore.ts**
   - Stores: recipients[], recipientsWithMessages[]
   - Actions: add, remove, update, setRecipients, clear

3. **videoStore.ts**
   - Stores: selectedTheme, selectedFormat, selectedMusicUrl, currentJobId, jobs[]
   - Actions: setters, updateJobProgress, clearVideoState

4. **uiStore.ts**
   - Stores: showSplash, showSettings, isLoading, currentStep
   - Actions: setters for each

### Shared Types

Located in `shared/src/index.ts`:

**Key Enums:**
- `HolidayTheme` - 17 holiday values (christmas, new_year, etc.)
- `VideoFormat` - 4 format values (1080p, 4k, square, social)

**Key Interfaces:**
- `Recipient` - { id, name, messageGuidance }
- `RecipientWithMessage` - extends Recipient with generatedMessage
- `VideoGenerationJob` - { id, status, progress, recipientName, videoUrl, error }
- `BatchVideoResponse` - { jobId, jobs[] }
- All API request/response types

---

## Holiday Themes

17 themes with unique visual effects:

### Western (6)
- `christmas` - Snow particles, red/green, Santa
- `new_year` - Fireworks, confetti, gold/pink
- `easter` - Spring petals, pastels, bunny
- `valentines_day` - Hearts, rose petals, pink/red
- `halloween` - Bats, pumpkins, orange/purple
- `thanksgiving` - Autumn leaves, orange/brown

### Jewish (4)
- `rosh_hashanah` - Honey, apples, gold/amber
- `hanukkah` - Menorah, dreidels, blue/white
- `passover` - Wheat, wine, earth tones
- `yom_kippur` - Doves, peaceful gray/white

### Islamic (3)
- `eid_al_fitr` - Crescent moon, green/gold
- `eid_al_adha` - Mosque, green/gold
- `ramadan` - Stars, crescent, purple/gold

### Asian (3)
- `chinese_new_year` - Dragon, red envelopes, red/gold
- `diwali` - Diya lamps, fireworks, orange/yellow
- `lunar_new_year` - Lanterns, red/gold

---

## Video Format Specifications

```typescript
'1080p': { width: 1920, height: 1080 }  // Standard HD
'4k':    { width: 3840, height: 2160 }  // Ultra HD
'square': { width: 1080, height: 1080 } // Instagram posts
'social': { width: 1080, height: 1920 } // Stories/TikTok
```

---

## API Endpoints Reference

### POST /api/validate-keys
**Request:**
```json
{
  "openai": "sk-...",
  "pixabay": "..."
}
```
**Response:**
```json
{
  "openai": { "valid": true },
  "pixabay": { "valid": true }
}
```

### POST /api/upload-csv
**Request:** FormData with file
**Response:**
```json
{
  "recipients": [{ "id": "...", "name": "...", "messageGuidance": "..." }],
  "errors": []
}
```

### POST /api/generate-messages
**Headers:** `x-openai-key: sk-...`
**Request:**
```json
{
  "recipients": [...],
  "theme": "christmas"
}
```
**Response:**
```json
{
  "recipients": [{ ...recipient, "generatedMessage": "..." }]
}
```

### GET /api/music/:theme
**Headers:** `x-pixabay-key: ...`
**Response:**
```json
{
  "tracks": [{ "id": "...", "name": "...", "url": "...", "duration": 35 }]
}
```

### POST /api/videos/generate
**Request:**
```json
{
  "recipients": [{ ...recipientWithMessage }],
  "theme": "christmas",
  "format": "1080p",
  "musicUrl": "https://..."
}
```
**Response:**
```json
{
  "jobId": "...",
  "jobs": [{ "id": "...", "status": "pending", "progress": 0, "recipientName": "..." }]
}
```

### GET /api/videos/status/:jobId
**Response:**
```json
{
  "jobId": "...",
  "jobs": [{ "id": "...", "status": "completed", "progress": 100, "videoUrl": "/videos/..." }]
}
```

---

## Development Guidelines

### Adding a New Holiday Theme

1. **Update Shared Types** (`shared/src/index.ts`)
   ```typescript
   export enum HolidayTheme {
     // ...existing
     NEW_HOLIDAY = 'new_holiday',
   }
   ```

2. **Add Colors** (`backend/src/services/canvas-renderer.ts`)
   ```typescript
   const HOLIDAY_COLORS: Record<HolidayTheme, ...> = {
     // ...existing
     new_holiday: { bg: '#...', primary: '#...', secondary: '#...', accent: '#...' },
   }
   ```

3. **Add Music Keywords** (`backend/src/services/pixabay-service.ts`)
   ```typescript
   const MUSIC_KEYWORDS: Record<HolidayTheme, string[]> = {
     // ...existing
     new_holiday: ['keyword1', 'keyword2', ...],
   }
   ```

4. **Add OpenAI Prompt** (`backend/src/services/openai-service.ts`)
   ```typescript
   const HOLIDAY_PROMPTS: Record<HolidayTheme, string> = {
     // ...existing
     [HolidayTheme.NEW_HOLIDAY]: 'Create a ... greeting',
   }
   ```

5. **Add to Frontend Selector** (`frontend/src/components/HolidaySelector.tsx`)
   ```typescript
   const HOLIDAYS: HolidayOption[] = [
     // ...existing
     { id: HolidayTheme.NEW_HOLIDAY, name: 'New Holiday', emoji: '🎊', category: 'Western', gradient: 'from-... to-...' },
   ]
   ```

### Adding a New Video Format

1. **Update Shared Types**
2. **Add to FORMAT_CONFIGS** in canvas-renderer.ts
3. **Add to FormatPicker** component with icon and description

### Modifying Video Structure

The 30-second video structure in `canvas-renderer.ts`:
- 0-5s: Intro (theme animation)
- 5-8s: Name reveal
- 8-25s: Message display
- 25-30s: Outro

To modify, update the `generateFrame()` method time ranges.

### Adding New Particle Effects

In `canvas-renderer.ts`:
1. Update `createParticle()` for new particle types
2. Add theme-specific logic in `drawParticles()`
3. Modify `updateParticles()` for custom physics

---

## Common Tasks

### Running Tests
```bash
# Backend tests (not implemented yet)
cd backend && npm test

# Frontend tests (not implemented yet)
cd frontend && npm test
```

### Building for Production
```bash
# Single command builds all
npm run build

# Or individually
npm run build:shared
npm run build:frontend
npm run build:backend
```

### Docker Deployment
```bash
# Build and run
docker-compose up --build

# Run detached
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Debugging

**Backend:**
- Logs go to console
- Video files in `backend/videos/`
- Temp files in `backend/temp/`
- Check FFmpeg: `ffmpeg -version`

**Frontend:**
- React DevTools extension
- Redux DevTools for Zustand (enable in store)
- Console logs for API calls
- Network tab for API debugging

---

## Performance Considerations

### Video Generation
- **Sequential**: Videos generated one at a time
- **Time per video**: 30-60 seconds (1080p), 60-90 seconds (4K)
- **Memory**: ~200-400MB during rendering
- **Disk**: ~5-10MB per 1080p video, ~20-40MB per 4K

### Optimization Opportunities
1. **Parallel Processing**: Generate multiple videos concurrently
2. **Job Queue**: Use Redis or BullMQ for persistent jobs
3. **Caching**: Cache generated messages and music
4. **WebWorkers**: Offload canvas rendering to worker threads
5. **Streaming**: Stream frames to FFmpeg instead of writing to disk

---

## Known Issues & Limitations

1. **In-Memory Jobs**: Job tracking lost on server restart
2. **Sequential Processing**: No parallel video generation
3. **No Persistence**: Recipients and jobs not saved to database
4. **API Rate Limits**: OpenAI and Pixabay have rate limits
5. **Large Batches**: Recommended max 50 recipients
6. **Browser Compatibility**: Requires modern browser for frontend

---

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development|production
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
TEMP_DIR=./temp
VIDEOS_DIR=./videos
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Dependencies to Know

### Backend Critical
- `express` - Web framework
- `fluent-ffmpeg` - FFmpeg wrapper
- `canvas` - Canvas rendering (requires native dependencies)
- `openai` - OpenAI API client
- `axios` - HTTP client for Pixabay
- `multer` - File upload handling
- `csv-parse` - CSV parsing
- `xlsx` - Excel parsing

### Frontend Critical
- `react` v19 - UI library
- `zustand` - State management
- `framer-motion` - Animations
- `@radix-ui/*` - Headless UI components
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `papaparse` - CSV parsing client-side
- `tailwindcss` - Styling

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `SplashScreen.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Stores**: camelCase with Store suffix (e.g., `settingsStore.ts`)
- **Services**: kebab-case (e.g., `openai-service.ts`)
- **Types**: PascalCase interfaces/types
- **API routes**: kebab-case (e.g., `api-keys.ts`)

---

## Testing Strategy

### Unit Tests (To Implement)
- Services: Test each service function independently
- Stores: Test state mutations
- Components: Test rendering and interactions
- Utilities: Test helper functions

### Integration Tests (To Implement)
- API endpoints: Test request/response cycles
- Video generation: Test full pipeline
- File upload: Test CSV/Excel parsing

### E2E Tests (To Implement)
- User flows: Complete video generation workflow
- Error handling: Invalid inputs, API failures
- UI interactions: Forms, modals, navigation

---

## Code Style

- **TypeScript**: Strict mode enabled
- **Imports**: Absolute imports with `@/` alias in frontend
- **Formatting**: Prettier (not configured yet, but recommended)
- **Linting**: ESLint configured
- **Comments**: JSDoc for complex functions
- **Error Handling**: Try-catch with proper error messages

---

## Useful Commands

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Building
npm run build           # Build all
npm run build:shared    # Build shared types
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend

# Installing
npm run install:all     # Install all dependencies

# Production
npm start              # Run both in production mode
docker-compose up      # Run with Docker
```

---

## Resources

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Pixabay API Docs**: https://pixabay.com/api/docs/
- **FFmpeg Docs**: https://ffmpeg.org/documentation.html
- **Canvas API**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- **Radix UI**: https://www.radix-ui.com/
- **shadcn/ui**: https://ui.shadcn.com/

---

## Questions AI Assistants Should Ask

When working on this project, consider asking:
1. "Should this feature require authentication?"
2. "How should errors be handled and displayed to users?"
3. "Is this change backward compatible with existing data?"
4. "Does this impact video generation performance?"
5. "Should this be configurable via environment variables?"
6. "Does this need to be persisted across sessions?"

---

## Project Philosophy

- **User Experience First**: Intuitive, beautiful, responsive
- **Type Safety**: TypeScript everywhere
- **Modern Stack**: Latest stable versions
- **Performance**: Optimize for speed where possible
- **Simplicity**: Prefer simple solutions over complex ones
- **Documentation**: Code should be self-documenting

---

Last Updated: 2025-12-22
Version: 1.0.0
