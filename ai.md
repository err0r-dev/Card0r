# Card0r - AI Assistant Documentation

This file provides comprehensive context for AI assistants (like Claude, ChatGPT, etc.) working on the Card0r project.

## Project Overview

**Card0r** is a full-stack TypeScript application that generates personalised video greeting cards using AI-powered message generation and Remotion-based React video rendering.

**Language Standard:** UK English is used throughout the codebase for all user-facing text.

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
├── README.md           # Main documentation
├── Non-Techie-Readme.md # Plain-language setup guide
└── ai.md               # This file
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
   - Configurable message length (5-100 words via `targetWordCount`)
   - Configurable creativity (0-1 via `creativity`, maps to temperature 0.3-1.2)
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
   - H.264 encoding with quality optimisation
   - Videos stored in `backend/videos/` directory

6. **video-generator.ts**
   - Orchestrates entire video generation pipeline
   - Manages job queue (in-memory)
   - Tracks progress for each video
   - **Supports cancellation** of individual jobs or entire batches
   - Handles batch processing
   - Cleanup after completion

7. **zip-generator.ts**
   - Creates ZIP archives of completed videos
   - Tracks ZIP generation progress
   - Supports batch downloads

### Backend Routes

Located in `backend/src/routes/`:

- **validation.ts** - `POST /api/validate-keys`
- **upload.ts** - `POST /api/upload-csv` (with Multer middleware)
- **messages.ts** - `POST /api/generate-messages` (requires x-openai-key header)
  - Accepts `targetWordCount` (5-100) and `creativity` (0-1) parameters
- **music.ts** - `GET /api/music/:theme` (requires x-jamendo-key header)
- **videos.ts**:
  - `POST /api/videos/generate` - Start video generation
  - `GET /api/videos/status/:jobId` - Check job status
  - `POST /api/videos/cancel/:jobId` - Cancel all pending/processing jobs in batch
  - `POST /api/videos/cancel/:jobId/:videoJobId` - Cancel specific video job
  - `POST /api/videos/download-zip/:jobId` - Start ZIP generation
  - `GET /api/videos/download-zip/:jobId/progress` - Check ZIP progress
  - `DELETE /api/videos/delete/:filename` - Delete a video file
  - `POST /api/videos/delete-batch` - Delete multiple video files

### Remotion Video System

Located in `remotion/src/`:

**Core Compositions:**

1. **Root.tsx** - Registers Remotion compositions
2. **CardComposition.tsx** - Main composition orchestrating all slides, decorations, and fade transitions
3. **types.ts** - Type definitions and `HOLIDAY_COLORS` for all 17 themes

**Slides** (`remotion/src/slides/`):
- **IntroSlide.tsx** - Theme name and recipient greeting with fade animation
- **MessageSlide.tsx** - Animated message display (line-by-line reveal)
- **SenderSlide.tsx** - "From: [senderName]" display
- **OutroSlide.tsx** - Closing animation with pulse effect

**Important**: All slides have transparent backgrounds to allow decorations to show through.

**Video Structure:**
- 1-second fade in (content starts after fade completes)
- Intro slide: 5 seconds
- Message slide: Dynamic duration based on message length
- Sender reveal: 3 seconds
- Outro: 3 seconds
- 1-second fade out

**Watermark:**
- Positioned bottom-right
- Font size: `Math.max(32, Math.round(width / 50))`
- Text: "Created by Card0r - available at err0r.dev/card0r"

**Decorations** (`remotion/src/decorations/`):

Each theme has its own decoration component with theme-specific animations:

| File | Theme | Animations |
|------|-------|------------|
| `ChristmasDecoration.tsx` | Christmas | Snow particles, Santa sleigh, lights, ornaments, sparkle overlay |
| `NewYearDecoration.tsx` | New Year | Fireworks, confetti, champagne bubbles |
| `ValentinesDecoration.tsx` | Valentine's | Hearts, rose petals, Cupid arrows |
| `EasterDecoration.tsx` | Easter | Easter eggs, bunnies, butterflies |
| `HalloweenDecoration.tsx` | Halloween | Bats, ghosts, spiders, pumpkins |
| `ThanksgivingDecoration.tsx` | Thanksgiving | Autumn leaves, acorns, pumpkins |
| `HanukkahDecoration.tsx` | Hanukkah | Menorah, Stars of David, dreidels, gelt |
| `DiwaliDecoration.tsx` | Diwali | Diyas, rangoli, fireworks, sparklers |
| `ChineseNewYearDecoration.tsx` | Chinese New Year | Lanterns, dragon, red envelopes |
| `IslamicDecoration.tsx` | Islamic holidays | Crescents, lanterns, geometric patterns |
| `RoshHashanahDecoration.tsx` | Rosh Hashanah | Honey, apples, shofar, pomegranates |
| `PassoverDecoration.tsx` | Passover | Matzah, wine, seder plate elements |
| `ThankYouDecoration.tsx` | Thank You | Hearts, flowers, ribbons, gifts |
| `CongratulationsDecoration.tsx` | Congratulations | Balloons, confetti, streamers, fireworks |
| `ParticleDecoration.tsx` | Fallback | Generic particle system |

**Animation Utilities** (`remotion/src/utils/`):
- `animations.ts` - Core animation helpers (usePulse, wrapText, calculateMessageDuration)
- `decorationAnimations.tsx` - Shared animation components:
  - `SparkleOverlay` - Random twinkling stars
  - `GlowPulse` - Breathing glow effect
  - `ConfettiBurst` - Confetti explosion
  - `ScalePulse` - Scale breathing animation
  - `FloatMotion` - Vertical bobbing

**Animation System:**
- Pre-seeded Y/X positions for immediate particle visibility from frame 0
- Reduced delays (30 frames max) for fast particle appearance
- Relative timing using `durationInFrames` for special animations
- Modulo-based wrapping: `(startY + (frame + delay) * speed) % (height + 100)`
- Continuous animations throughout entire video duration
- SparkleOverlay added to most decoration components for enhanced visual appeal

### Frontend Components

Located in `frontend/src/components/`:

**UI Components** (`ui/`):
- button.tsx, dialog.tsx, input.tsx, label.tsx, textarea.tsx
- card.tsx, progress.tsx, radio-group.tsx, separator.tsx, select.tsx, slider.tsx
- sonner.tsx (toast notifications)
- All based on Radix UI primitives with Tailwind styling

**Public Assets** (`public/`):
- `favicon.svg` - Custom "C" favicon with orange/yellow gradient
- `apple-touch-icon.png` - iOS home screen icon (180x180)
- `template.csv` - Downloadable CSV template with Name,Message columns

**Feature Components**:
1. **SplashScreen.tsx** - Animated entrance with Mail icon and Framer Motion particles
2. **MainLayout.tsx** - Top nav, dark mode toggle, settings button, err0r.dev footer link
3. **SetupScreen.tsx** - Initial API key entry (1Password autofill disabled)
4. **SettingsModal.tsx** - API key management with validation (1Password autofill disabled)
5. **FileUploader.tsx** - Drag-drop CSV/Excel upload with downloadable template
6. **RecipientForm.tsx** - Manual entry form with sender name field
7. **RecipientTable.tsx** - List of recipients with edit/delete
8. **HolidaySelector.tsx** - 17 holiday cards in 5 categories (keyboard accessible)
9. **FormatPicker.tsx** - Radio group for export formats
10. **MusicSelector.tsx** - Music track selection from Jamendo (keyboard accessible)
11. **VideoGenerator.tsx** - Three-step accordion: AI settings, message review/edit, video generation with cancellation
12. **VideoGallery.tsx** - Grid with preview, download, and delete functionality
13. **DownloadStep.tsx** - Final download interface with batch ZIP download
14. **ConfirmStartOverDialog.tsx** - Warning dialog when starting over with completed videos
15. **ConfirmModeChangeDialog.tsx** - Confirmation when switching input modes
16. **InputModeToggle.tsx** - Toggle between CSV upload and manual entry

**Accessibility Features**:
- ARIA labels on all interactive elements
- Keyboard navigation (tabIndex, onKeyDown handlers)
- Screen reader announcements (aria-live regions)
- Focus indicators on custom components
- Form field descriptions (aria-describedby)
- Required field indicators (aria-required)

**Utilities** (`lib/`):
- `api.ts` - API client with typed methods for all backend endpoints including cancellation
- `utils.ts` - Utility functions (cn for className merging)

**Generation Flow** (VideoGenerator.tsx):
1. **Step 1: Configure AI Settings** - Adjust message length (5-100 words) and creativity (closer to original vs. more imaginative)
2. **Step 2: Review & Edit** - User reviews AI-generated messages, can edit inline, must click "Confirm Messages & Generate Videos"
3. **Step 3: Generate Videos** - Only starts after user confirms messages; tracks progress with polling; supports cancellation

**Important**: Videos do NOT auto-generate. User must explicitly confirm messages before video generation begins.

### Frontend Stores

Located in `frontend/src/stores/`:

1. **settingsStore.ts**
   - Persisted to localStorage
   - Stores: openaiKey, jamendoKey, darkMode, hasCompletedSetup
   - Actions: setters and toggleDarkMode

2. **recipientsStore.ts**
   - Stores: recipients[], recipientsWithMessages[], senderName, messagesConfirmed
   - Actions: add, remove, update, setRecipients, setSenderName, setMessagesConfirmed, updateRecipientMessage, clear
   - Note: `messagesConfirmed` must be true before videos can generate

3. **videoStore.ts**
   - Stores: selectedTheme, selectedFormat, selectedMusicUrl, currentJobId, jobs[]
   - Actions: setters, updateJobProgress, removeJob, clearVideoState

4. **uiStore.ts**
   - Stores: showSplash, showSetup, isLoading, currentStep
   - Actions: setters, goBack, goForward, canGoBack, resetWizard

### Shared Types

Located in `shared/src/index.ts`:

**Key Enums:**
- `HolidayTheme` - 17 holiday values (christmas, new_year, valentines_day, easter, halloween, thanksgiving, hanukkah, diwali, chinese_new_year, eid_al_fitr, eid_al_adha, ramadan, rosh_hashanah, passover, lunar_new_year, thank_you, congratulations)
- `VideoFormat` - 4 format values (1080p, 4k, square, social)

**Key Interfaces:**
- `Recipient` - { id, name, messageGuidance }
- `RecipientWithMessage` - extends Recipient with generatedMessage
- `VideoGenerationJob` - { id, status, progress, recipientName, videoUrl, error }
  - status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
- `BatchVideoResponse` - { jobId, jobs[] }
- `MessageGenerationRequest` - includes `targetWordCount` (5-100) and `creativity` (0-1)
- `ZipGenerationResponse` - { status, message, totalVideos }
- `ZipProgressResponse` - { status, progress, zipPath, error }
- All API request/response types

---

## Holiday Themes

17 themes with unique visual effects:

### Western (6)
- `christmas` - Snow particles, Santa sleigh, lights, ornaments, sparkle overlay
- `new_year` - Fireworks, confetti, champagne bubbles
- `easter` - Easter eggs, bunnies, butterflies
- `valentines_day` - Hearts, rose petals, Cupid arrows
- `halloween` - Bats, ghosts, spiders, pumpkins
- `thanksgiving` - Autumn leaves, acorns, pumpkins

### Jewish (3)
- `rosh_hashanah` - Honey, apples, shofar, pomegranates, gold/amber
- `hanukkah` - Menorah, Stars of David, dreidels, gelt
- `passover` - Matzah, wine, seder plate, earth tones

### Islamic (3)
- `eid_al_fitr` - Crescent moons, lanterns, geometric patterns
- `eid_al_adha` - Crescent moons, lanterns, geometric patterns
- `ramadan` - Crescent moons, lanterns, geometric patterns

### Asian (3)
- `chinese_new_year` - Lanterns, dragon, red envelopes
- `diwali` - Diyas, rangoli, fireworks, sparklers
- `lunar_new_year` - Lanterns, red/gold particles

### General (2)
- `thank_you` - Hearts, flowers, ribbons, gifts
- `congratulations` - Balloons, confetti, streamers, fireworks, trophy

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
  "theme": "christmas",
  "senderName": "John",
  "targetWordCount": 50,
  "creativity": 0.5
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
  "tracks": [{ "id": "...", "name": "...", "downloadUrl": "...", "duration": 35 }]
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

### POST /api/videos/cancel/:jobId
**Response:**
```json
{
  "success": true,
  "message": "All pending jobs cancelled"
}
```

### POST /api/videos/cancel/:jobId/:videoJobId
**Response:**
```json
{
  "success": true,
  "message": "Video job cancelled"
}
```

### POST /api/videos/download-zip/:jobId
**Response:**
```json
{
  "status": "processing",
  "message": "ZIP generation started",
  "totalVideos": 5
}
```

### GET /api/videos/download-zip/:jobId/progress
**Response:**
```json
{
  "status": "completed",
  "progress": 100,
  "zipPath": "/videos/card0r_batch_123.zip"
}
```

### DELETE /api/videos/delete/:filename
**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### POST /api/videos/delete-batch
**Request:**
```json
{
  "filenames": ["video1.mp4", "video2.mp4"]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Deleted 2 of 2 videos"
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

2. **Add Colours** (`remotion/src/types.ts`)
   ```typescript
   export const HOLIDAY_COLORS: Record<HolidayTheme, ThemeColors> = {
     // ...existing
     new_holiday: { bg: '#...', primary: '#...', secondary: '#...', accent: '#...' },
   }
   ```

3. **Create Decoration Component** (`remotion/src/decorations/NewHolidayDecoration.tsx`)
   ```typescript
   import { SparkleOverlay } from '../utils/decorationAnimations';

   export function NewHolidayDecoration({ width, height }: DecorationProps) {
     const frame = useCurrentFrame();
     const { durationInFrames } = useVideoConfig();

     // Generate particles with pre-seeded positions
     const particles = useMemo(() =>
       Array.from({ length: 30 }, (_, i) => ({
         x: random(`x-${i}`) * width,
         startY: random(`startY-${i}`) * (height + 100),
         speed: 0.5 + random(`speed-${i}`) * 1.5,
         delay: random(`delay-${i}`) * 30,
       })), [width, height]
     );

     return (
       <AbsoluteFill>
         <SparkleOverlay count={25} color="#FFD700" seed="new-holiday" />
         {/* Render particles... */}
       </AbsoluteFill>
     );
   }
   ```

4. **Register Decoration** (`remotion/src/decorations/index.ts`)
   ```typescript
   import { NewHolidayDecoration } from './NewHolidayDecoration';

   export function getDecorationComponent(theme: HolidayTheme) {
     switch (theme) {
       // ...existing
       case 'new_holiday':
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

### Modifying Video Structure

The video structure in `remotion/src/CardComposition.tsx`:
- Fade in: 1 second
- Intro: 5 seconds (theme name, recipient greeting)
- Message: Dynamic duration based on word count (~3.5 words/second)
- Sender: 3 seconds (displays "From: [senderName]")
- Outro: 3 seconds (sparkle effect)
- Fade out: 1 second

To modify, update the timing constants and Sequence components in CardComposition.tsx. Remember to update `calculateTotalFrames()` if changing durations.

### Accessibility Guidelines

When adding new components:
- Add `aria-label` to icon-only buttons
- Use `role="button"` for clickable non-button elements
- Add `tabIndex={0}` and `onKeyDown` handlers for keyboard navigation
- Use `aria-live="polite"` for dynamic status updates
- Link form fields to descriptions with `aria-describedby`
- Mark required fields with `aria-required="true"`
- Hide decorative icons with `aria-hidden="true"`

---

## Common Tasks

### Running Development

```bash
# From root - starts both frontend and backend
npm run dev

# Or individually
npm run dev:frontend
npm run dev:backend
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

**Docker Configuration Notes:**
- Backend uses `node:20-slim` (Debian-based) for Remotion compatibility with Chrome Headless Shell
- Chrome Headless Shell is pre-downloaded during Docker build via `ensureBrowser()`
- Frontend uses `nginx:alpine` with proper file permissions for static assets
- Shared package is symlinked into node_modules during build

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
- Console logs for API calls
- Network tab for API debugging

**Remotion:**
- Use `npx remotion studio` to preview compositions
- Check particle visibility from frame 0
- Verify decoration components render before slides

---

## File Paths (Important!)

All video-related paths use `__dirname` relative paths for consistency:

```typescript
// In routes/videos.ts, services/remotion-renderer.ts, services/zip-generator.ts:
const VIDEOS_DIR = path.join(__dirname, '../../videos');

// In server.ts:
app.use('/videos', express.static(path.join(__dirname, '../videos')));
```

This ensures videos are stored and served from the same location regardless of where the process is started.

---

## Performance Considerations

### Video Generation
- **Sequential**: Videos generated one at a time
- **Time per video**: 30-60 seconds (1080p), 60-90 seconds (4K)
- **Memory**: ~200-400MB during rendering
- **Disk**: ~5-10MB per 1080p video, ~20-40MB per 4K

### Optimisation Opportunities
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
- `archiver` - ZIP file creation

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
- **Utilities**: camelCase (e.g., `animations.ts`)
- **Stores**: camelCase with Store suffix (e.g., `settingsStore.ts`)
- **Services**: kebab-case (e.g., `openai-service.ts`)
- **Decorations**: PascalCase with Decoration suffix (e.g., `ChristmasDecoration.tsx`)
- **Types**: PascalCase interfaces/types
- **API routes**: kebab-case (e.g., `videos.ts`)

---

## Code Style

- **TypeScript**: Strict mode enabled
- **Language**: UK English for all user-facing text
- **Formatting**: Prettier (recommended)
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
7. "Does this text need to use UK English spelling?"
8. "Does this component need accessibility attributes?"

---

## Project Philosophy

- **User Experience First**: Intuitive, beautiful, responsive
- **Accessibility**: WCAG AA compliant, keyboard navigable
- **Type Safety**: TypeScript everywhere
- **Modern Stack**: Latest stable versions
- **Performance**: Optimise for speed where possible
- **Simplicity**: Prefer simple solutions over complex ones
- **Documentation**: Code should be self-documenting
- **UK English**: All user-facing text uses British spelling

---

Last Updated: 2025-12-24
Version: 1.3.0
