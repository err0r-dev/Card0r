# Card0r - AI Assistant Documentation

This file provides comprehensive context for AI assistants (like Claude, ChatGPT, etc.) working on the Card0r project.

## Project Overview

**Card0r** is a full-stack TypeScript application that generates personalized video greeting cards using AI-powered message generation and Remotion-based React video rendering.

**Tech Stack:**
- Frontend: React 19 + Vite + TypeScript + TailwindCSS + shadcn/ui
- Backend: Node.js + Express + TypeScript + Remotion
- Video: Remotion (React-based video compositions)
- AI: OpenAI GPT-4 for message generation
- Media: Jamendo API for background music
- State: Zustand for client state management
- Deployment: Docker + docker-compose

---

## Architecture Overview

### Monorepo Structure

```
Card0r/
├── frontend/           # React SPA (port 5173 dev, 3000 prod)
├── backend/            # Express API (port 3001)
├── remotion/           # Remotion video compositions and decorations
├── shared/             # Shared TypeScript types
├── docker-compose.yml  # Orchestrates both services
└── [docs]              # README, QUICKSTART, TESTING, BUILD_SUMMARY
```

### Data Flow

```
User → Frontend → Backend API → Services → Remotion → Videos
                      ↓
                 OpenAI GPT-4 (messages)
                      ↓
                 Jamendo API (music)
```

---

## Key Components

### Backend Services

Located in `backend/src/services/`:

1. **validation.ts**
   - Validates OpenAI and Jamendo API keys
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

4. **jamendo-service.ts**
   - Searches Jamendo for holiday-appropriate music
   - Filters by duration (30+ seconds)
   - Returns top 5 tracks per theme
   - Handles API errors gracefully

5. **remotion-renderer.ts**
   - Bundles and renders Remotion compositions
   - Passes props (name, message, theme, senderName) to compositions
   - Supports multiple resolutions (1080p, 4K, square, social)
   - H.264 encoding with quality optimization

6. **video-generator.ts**
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
- **music.ts** - `GET /api/music/:theme` (requires x-jamendo-key header)
- **videos.ts** - `POST /api/videos/generate`, `GET /api/videos/status/:jobId`

### Remotion Video System

Located in `remotion/src/`:

**Core Compositions:**

1. **Root.tsx** - Registers Remotion compositions
2. **CardComposition.tsx** - Main composition orchestrating all slides and decorations
3. **types.ts** - Type definitions and `HOLIDAY_COLORS` for all 17 themes

**Slides** (`remotion/src/slides/`):
- **IntroSlide.tsx** - Theme name introduction with fade animation
- **NameRevealSlide.tsx** - Recipient name reveal with scale animation
- **MessageSlide.tsx** - Animated message display (line-by-line reveal)
- **SenderSlide.tsx** - "From: [senderName]" display
- **OutroSlide.tsx** - Closing animation with pulse effect

**Important**: All slides have transparent backgrounds to allow decorations to show through.

**Decorations** (`remotion/src/decorations/`):

Each theme has its own decoration component with theme-specific animations:

| File | Theme | Animations |
|------|-------|------------|
| `ChristmasDecoration.tsx` | Christmas | Snow particles, Santa sleigh, lights, ornaments |
| `NewYearDecoration.tsx` | New Year | Fireworks, confetti, champagne bubbles |
| `ValentinesDecoration.tsx` | Valentine's | Hearts, rose petals, Cupid arrows |
| `EasterDecoration.tsx` | Easter | Easter eggs, bunnies, butterflies |
| `HalloweenDecoration.tsx` | Halloween | Bats, ghosts, spiders, pumpkins |
| `ThanksgivingDecoration.tsx` | Thanksgiving | Autumn leaves, acorns, pumpkins |
| `HanukkahDecoration.tsx` | Hanukkah | Menorah, Stars of David, dreidels, gelt |
| `DiwaliDecoration.tsx` | Diwali | Diyas, rangoli, fireworks, sparklers |
| `ChineseNewYearDecoration.tsx` | Chinese New Year | Lanterns, dragon, red envelopes |
| `IslamicDecoration.tsx` | Islamic holidays | Crescents, lanterns, geometric patterns |
| `ParticleDecoration.tsx` | Fallback | Generic particle system |

**Animation System:**
- Pre-seeded Y/X positions for immediate particle visibility from frame 0
- Reduced delays (30 frames max) for fast particle appearance
- Relative timing using `durationInFrames` for special animations (Santa, Cupid, sparklers)
- Modulo-based wrapping: `(startY + (frame + delay) * speed) % (height + 100)`
- Continuous animations throughout entire video duration

### Frontend Components

Located in `frontend/src/components/`:

**UI Components** (`ui/`):
- button.tsx, dialog.tsx, input.tsx, label.tsx, textarea.tsx
- card.tsx, progress.tsx, radio-group.tsx, separator.tsx, select.tsx
- sonner.tsx (toast notifications)
- All based on Radix UI primitives with Tailwind styling

**Feature Components**:
1. **SplashScreen.tsx** - Animated entrance with Framer Motion particles
2. **MainLayout.tsx** - Top nav, dark mode toggle, settings button
3. **SettingsModal.tsx** - API key management with validation
4. **FileUploader.tsx** - Drag-drop CSV/Excel upload
5. **RecipientForm.tsx** - Manual entry form with sender name field
6. **RecipientTable.tsx** - List of recipients with edit/delete
7. **HolidaySelector.tsx** - 17 holiday cards in 4 categories
8. **FormatPicker.tsx** - Radio group for export formats
9. **MusicSelector.tsx** - Music track selection from Jamendo
10. **VideoGenerator.tsx** - Auto-triggering generation with progress polling
11. **VideoGallery.tsx** - Grid with preview and download
12. **DownloadStep.tsx** - Final download interface

**Auto-Generation Flow** (VideoGenerator.tsx):
- Automatic message generation when recipients, theme, and API key are ready
- Automatic video generation when messages complete
- Uses `useRef` to prevent infinite re-triggering
- Auto-navigates to download step on completion

### Frontend Stores

Located in `frontend/src/stores/`:

1. **settingsStore.ts**
   - Persisted to localStorage
   - Stores: openaiKey, jamendoKey, darkMode
   - Actions: setters and toggleDarkMode

2. **recipientsStore.ts**
   - Stores: recipients[], recipientsWithMessages[], senderName
   - Actions: add, remove, update, setRecipients, setSenderName, clear

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
- `christmas` - Snow particles, Santa sleigh, lights, ornaments
- `new_year` - Fireworks, confetti, champagne bubbles
- `easter` - Easter eggs, bunnies, butterflies
- `valentines_day` - Hearts, rose petals, Cupid arrows
- `halloween` - Bats, ghosts, spiders, pumpkins
- `thanksgiving` - Autumn leaves, acorns, pumpkins

### Jewish (4)
- `rosh_hashanah` - Honey, apples, gold/amber
- `hanukkah` - Menorah, Stars of David, dreidels, gelt
- `passover` - Wheat, wine, earth tones
- `yom_kippur` - Doves, peaceful gray/white

### Islamic (3)
- `eid_al_fitr` - Crescent moons, lanterns, geometric patterns
- `eid_al_adha` - Crescent moons, lanterns, geometric patterns
- `ramadan` - Crescent moons, lanterns, geometric patterns

### Asian (4)
- `chinese_new_year` - Lanterns, dragon, red envelopes
- `diwali` - Diyas, rangoli, fireworks, sparklers
- `lunar_new_year` - Lanterns, red/gold particles

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
  "jamendo": "..."
}
```
**Response:**
```json
{
  "openai": { "valid": true },
  "jamendo": { "valid": true }
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
**Headers:** `x-jamendo-key: ...`
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
  "musicUrl": "https://...",
  "senderName": "John"
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

2. **Add Colors** (`remotion/src/types.ts`)
   ```typescript
   export const HOLIDAY_COLORS: Record<HolidayTheme, ThemeColors> = {
     // ...existing
     new_holiday: { bg: '#...', primary: '#...', secondary: '#...', accent: '#...' },
   }
   ```

3. **Create Decoration Component** (`remotion/src/decorations/NewHolidayDecoration.tsx`)
   ```typescript
   export function NewHolidayDecoration({ theme }: DecorationProps) {
     const frame = useCurrentFrame();
     const { width, height, durationInFrames } = useVideoConfig();

     // Generate particles with pre-seeded positions
     const particles = useMemo(() =>
       Array.from({ length: 30 }, (_, i) => ({
         x: random(`x-${i}`) * width,
         startY: random(`startY-${i}`) * (height + 100),
         speed: 0.5 + random(`speed-${i}`) * 1.5,
         delay: random(`delay-${i}`) * 30,
         // ... other properties
       })), [width, height]
     );

     // Render particles...
   }
   ```

4. **Register Decoration** (`remotion/src/decorations/index.ts`)
   ```typescript
   import { NewHolidayDecoration } from './NewHolidayDecoration';

   export function getDecorationForTheme(theme: HolidayTheme) {
     switch (theme) {
       // ...existing
       case HolidayTheme.NEW_HOLIDAY:
         return NewHolidayDecoration;
     }
   }
   ```

5. **Add Music Keywords** (`backend/src/services/jamendo-service.ts`)
   ```typescript
   const MUSIC_KEYWORDS: Record<HolidayTheme, string[]> = {
     // ...existing
     new_holiday: ['keyword1', 'keyword2', ...],
   }
   ```

6. **Add OpenAI Prompt** (`backend/src/services/openai-service.ts`)
   ```typescript
   const HOLIDAY_PROMPTS: Record<HolidayTheme, string> = {
     // ...existing
     [HolidayTheme.NEW_HOLIDAY]: 'Create a ... greeting',
   }
   ```

7. **Add to Frontend Selector** (`frontend/src/components/HolidaySelector.tsx`)
   ```typescript
   const HOLIDAYS: HolidayOption[] = [
     // ...existing
     { id: HolidayTheme.NEW_HOLIDAY, name: 'New Holiday', emoji: '...', category: 'Western', gradient: 'from-... to-...' },
   ]
   ```

### Adding a New Video Format

1. **Update Shared Types** (`shared/src/index.ts`)
2. **Add to FORMAT_CONFIGS** in `remotion-renderer.ts`
3. **Add to FormatPicker** component with icon and description

### Modifying Video Structure

The video structure in `remotion/src/CardComposition.tsx`:
- Background: Full duration with theme gradient
- Decorations: Full duration with theme-specific animations (snow, fireworks, etc.)
- Intro: 5s (theme name fade in/out)
- Name Reveal: 3s (recipient name scales up)
- Message: Dynamic duration based on word count (~3.5 words/second)
- Sender: 3s (displays "From: [senderName]")
- Outro: 3s (sparkle effect)

To modify, update the timing constants and Sequence components in CardComposition.tsx.

### Adding New Particle Effects

To create a new decoration component:

1. Create `remotion/src/decorations/YourDecoration.tsx`
2. Use `useMemo` to generate particles with pre-seeded positions:
   ```typescript
   const particles = useMemo(() =>
     Array.from({ length: COUNT }, (_, i) => ({
       x: random(`x-${i}`) * width,
       startY: random(`startY-${i}`) * (height + 100), // Pre-seeded Y
       speed: 0.5 + random(`speed-${i}`) * 1.5,
       delay: random(`delay-${i}`) * 30, // Max 30 frames delay
     })), [width, height]
   );
   ```

3. Calculate positions with modulo wrapping:
   ```typescript
   const yOffset = (particle.startY + (frame + particle.delay) * particle.speed) % (height + 100);
   const currentY = yOffset - 50;
   ```

4. For special animations (like Santa), use relative timing:
   ```typescript
   const startFrame = Math.floor(durationInFrames * 0.3); // 30% into video
   const duration = Math.floor(durationInFrames * 0.25);
   ```

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
npm run build:remotion
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

### Previewing Videos in Remotion Studio
```bash
cd remotion
npx remotion studio
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

**Remotion:**
- Use `npx remotion studio` to preview compositions
- Check particle visibility from frame 0
- Verify decoration components render before slides

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
4. **Lambda Rendering**: Use Remotion Lambda for cloud rendering

---

## Known Issues & Limitations

1. **In-Memory Jobs**: Job tracking lost on server restart
2. **Sequential Processing**: No parallel video generation
3. **No Persistence**: Recipients and jobs not saved to database
4. **API Rate Limits**: OpenAI and Jamendo have rate limits
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
- `@remotion/renderer` - Remotion video rendering
- `@remotion/bundler` - Remotion bundling
- `openai` - OpenAI API client
- `axios` - HTTP client for Jamendo
- `multer` - File upload handling
- `csv-parse` - CSV parsing
- `xlsx` - Excel parsing

### Remotion Critical
- `remotion` - Core framework
- `@remotion/cli` - CLI tools
- `@remotion/bundler` - Webpack bundling

### Frontend Critical
- `react` v19 - UI library
- `zustand` - State management
- `framer-motion` - Animations
- `@radix-ui/*` - Headless UI components
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `papaparse` - CSV parsing client-side
- `xlsx` - Excel parsing client-side
- `tailwindcss` - Styling

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `SplashScreen.tsx`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Stores**: camelCase with Store suffix (e.g., `settingsStore.ts`)
- **Services**: kebab-case (e.g., `openai-service.ts`)
- **Decorations**: PascalCase with Decoration suffix (e.g., `ChristmasDecoration.tsx`)
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
npm run build:remotion  # Build Remotion bundle
npm run build:frontend  # Build frontend
npm run build:backend   # Build backend

# Installing
npm run install:all     # Install all dependencies

# Production
npm start              # Run both in production mode
docker-compose up      # Run with Docker

# Remotion
cd remotion && npx remotion studio  # Preview compositions
```

---

## Resources

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Jamendo API Docs**: https://developer.jamendo.com/v3.0
- **Remotion Docs**: https://www.remotion.dev/docs
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
