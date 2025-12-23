# Card0r Enhancement Plan

## Summary of Changes
1. Add decorations for Rosh Hashanah, Passover + general themes (Thank You, Congratulations)
2. Remove Yom Kippur from selection
3. Redesign wizard UX to Duplex0r-style guided flow (see /Users/jonathanisaacs/Git/Duplex0r for reference)
4. Update IntroSlide to show "Merry Christmas, {name}!" style greetings
5. Remove name from OutroSlide (redundant)
6. Implement batch download as ZIP file with clear filenames
7. Add toggle for CSV upload vs manual entry (default: manual)

---

## Phase 1: Theme & Decoration Changes

### 1.1 Update HolidayTheme Enum
**File:** `shared/src/index.ts`
- Add `THANK_YOU = 'thank_you'` and `CONGRATULATIONS = 'congratulations'` to enum (after LUNAR_NEW_YEAR)
- Remove `YOM_KIPPUR = 'yom_kippur'` (line 15)
- Update `HolidayThemeInfo.category` type to include `'general'`

### 1.2 Update Theme Colors
**File:** `remotion/src/types.ts`
- Remove `yom_kippur` colors from HOLIDAY_COLORS
- Add colors for:
  - `thank_you`: `{ bg: '#fff5f5', primary: '#e53e3e', secondary: '#fc8181', accent: '#ffd700' }`
  - `congratulations`: `{ bg: '#faf5ff', primary: '#805ad5', secondary: '#d69e2e', accent: '#38b2ac' }`

### 1.3 Update HolidaySelector
**File:** `frontend/src/components/HolidaySelector.tsx`
- Remove Yom Kippur entry from HOLIDAYS array
- Add "General" to CATEGORIES array
- Add entries:
  - `{ id: HolidayTheme.THANK_YOU, name: 'Thank You', emoji: '💝', category: 'General', gradient: 'from-pink-400 to-red-400' }`
  - `{ id: HolidayTheme.CONGRATULATIONS, name: 'Congratulations', emoji: '🎊', category: 'General', gradient: 'from-purple-500 to-yellow-500' }`

### 1.4 Create New Decoration Components
**Directory:** `remotion/src/decorations/`

Follow existing patterns (see `HanukkahDecoration.tsx`, `ValentinesDecoration.tsx` for reference):
- Use `useMemo` for particle generation with seeded randomness
- Use `AbsoluteFill` with `pointerEvents: 'none'`
- Animate with `useCurrentFrame` and `interpolate`

| File | Elements |
|------|----------|
| `RoshHashanahDecoration.tsx` | Apples (red with shine), honey jars (golden, drip animation), pomegranates, shofar silhouette, golden leaves falling |
| `PassoverDecoration.tsx` | Matzah pieces, wine cups/goblets, seder plate elements (egg, herbs), Stars of David |
| `ThankYouDecoration.tsx` | Hearts (reuse from ValentinesDecoration), flowers, soft confetti (pastels), ribbons, sparkles |
| `CongratulationsDecoration.tsx` | Balloons (rising with strings), confetti (reuse from NewYearDecoration), streamers, stars, fireworks |

### 1.5 Update Decoration Index
**File:** `remotion/src/decorations/index.ts`
- Import new decoration components
- Add cases to `getDecorationComponent()` switch:
```typescript
case 'rosh_hashanah': return RoshHashanahDecoration;
case 'passover': return PassoverDecoration;
case 'thank_you': return ThankYouDecoration;
case 'congratulations': return CongratulationsDecoration;
```
- Export new components

---

## Phase 2: IntroSlide & OutroSlide Updates

### 2.1 Update IntroSlide
**File:** `remotion/src/slides/IntroSlide.tsx`

Add greeting mapping before component:
```typescript
const THEME_GREETINGS: Record<HolidayTheme, string> = {
  christmas: 'Merry Christmas',
  new_year: 'Happy New Year',
  easter: 'Happy Easter',
  valentines_day: 'Happy Valentine\'s Day',
  halloween: 'Happy Halloween',
  thanksgiving: 'Happy Thanksgiving',
  rosh_hashanah: 'Shanah Tovah',
  hanukkah: 'Happy Hanukkah',
  passover: 'Chag Pesach Sameach',
  eid_al_fitr: 'Eid Mubarak',
  eid_al_adha: 'Eid Mubarak',
  ramadan: 'Ramadan Mubarak',
  chinese_new_year: 'Gong Xi Fa Cai',
  diwali: 'Happy Diwali',
  lunar_new_year: 'Happy Lunar New Year',
  thank_you: 'Thank You',
  congratulations: 'Congratulations',
};
```

Update interface:
```typescript
interface IntroSlideProps {
  theme: HolidayTheme;
  recipientName: string;  // NEW
}
```

Update display to show: `{THEME_GREETINGS[theme]}, {recipientName}!`

Consider reducing font size from 120 to ~80-100 for longer messages.

### 2.2 Update OutroSlide
**File:** `remotion/src/slides/OutroSlide.tsx`

Option A (recommended): Remove `name` prop entirely, show themed closing or just fade out decorations.
Option B: Replace with generic closing like "Season's Greetings" based on theme.

### 2.3 Update CardComposition
**File:** `remotion/src/CardComposition.tsx`
- Pass `recipientName` to IntroSlide: `<IntroSlide theme={theme} recipientName={recipientName} />`
- Remove `name` prop from OutroSlide: `<OutroSlide theme={theme} />`

---

## Phase 3: Wizard UX Redesign (Duplex0r Style)

Reference: `/Users/jonathanisaacs/Git/Duplex0r/frontend/src/App.tsx` (lines 71-100 for StepProgress, 589-857 for guided mode)

### 3.1 Create StepProgress Component
**File:** `frontend/src/components/StepProgress.tsx`

```tsx
interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

const WIZARD_STEPS = [
  { label: 'Recipients', description: 'Add your recipients' },
  { label: 'Customize', description: 'Choose theme & format' },
  { label: 'Generate', description: 'Create your videos' },
  { label: 'Download', description: 'Get your cards' },
];
```

Visual design:
- Numbered dots (1-4) connected by horizontal lines
- Active step: primary color with ring, scale(1.1)
- Completed steps: primary color with checkmark icon
- Pending steps: muted background with border

### 3.2 Create GuidedStepCard Wrapper
**File:** `frontend/src/components/GuidedStepCard.tsx`

```tsx
interface GuidedStepCardProps {
  title: string;
  description: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  showNavigation?: boolean;
}
```

Styling:
- `max-width: 600px`, centered
- Rounded card with shadow
- Title + description in header
- Content area with padding
- Navigation buttons at bottom

### 3.3 Add CSS Styles
**File:** `frontend/src/index.css`

```css
.step-progress { display: flex; align-items: center; justify-content: center; gap: 0; padding: 1.5rem; }
.step-dot { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; transition: all 0.3s; }
.step-dot.active { background: var(--primary); color: white; ring: 4px var(--primary)/20; transform: scale(1.1); }
.step-dot.completed { background: var(--primary); color: white; }
.step-dot.pending { background: var(--muted); border: 2px solid var(--border); }
.step-line { width: 60px; height: 2px; transition: background 0.3s; }
.step-line.completed { background: var(--primary); }
.step-line.pending { background: var(--border); }

.guided-card { max-width: 600px; margin: 0 auto; }
.guided-card-inner { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
.guided-step-title { font-size: 1.5rem; font-weight: 600; text-align: center; margin-bottom: 0.5rem; }
.guided-step-description { text-align: center; color: var(--muted-foreground); margin-bottom: 1.5rem; }

@keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-slide-up { animation: fadeSlideUp 0.3s ease-out; }
```

### 3.4 Update App.tsx
**File:** `frontend/src/App.tsx`

- Import StepProgress
- Add StepProgress at top of main content (after SettingsModal)
- Remove `pb-32` padding (no longer need space for bottom nav)
- Pass navigation props to step components
- Remove WizardNavigation component usage

### 3.5 Update Step Components

**RecipientsStep.tsx:**
- Wrap content in GuidedStepCard
- Accept navigation props
- Title: "Add Recipients", Description: "Upload a CSV file or add recipients manually"

**CustomizeStep.tsx:**
- Wrap in GuidedStepCard
- Title: "Choose Your Theme", Description: "Select a festive theme and video format"
- Use 2-column grid for themes (may need compact mode for HolidaySelector)

**GenerateStep.tsx:**
- Wrap in GuidedStepCard
- Title: "Generating Videos", Description: "Creating personalized video cards"
- Show compact progress ring/bar
- Scrollable job list (max-height: 300px)

**DownloadStep.tsx:**
- Wrap in GuidedStepCard with `showNavigation={false}`
- Title: "Your Videos Are Ready!", Description: "{count} personalized videos created"
- Big "Download All as ZIP" button
- Compact video gallery below
- "Create More Cards" link at bottom

### 3.6 Delete WizardNavigation
**File:** `frontend/src/components/WizardNavigation.tsx` - DELETE this file

---

## Phase 4: Batch Download as ZIP

### 4.1 Install Dependencies
```bash
cd backend && npm install archiver && npm install -D @types/archiver
```

### 4.2 Create ZIP Service
**File:** `backend/src/services/zip-generator.ts`

```typescript
import archiver from 'archiver';
import { createWriteStream, promises as fs } from 'fs';
import path from 'path';

export interface ZipProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  zipPath?: string;
  error?: string;
}

const zipProgress = new Map<string, ZipProgress>();

export async function generateZipForJob(jobId: string, completedJobs: VideoGenerationJob[]): Promise<string> {
  // Create ZIP in temp directory
  // Add each video with filename: "{RecipientName}_video.mp4"
  // Track progress via zipProgress map
  // Return path to ZIP file
}

export function getZipProgress(jobId: string): ZipProgress | null {
  return zipProgress.get(jobId) || null;
}
```

### 4.3 Add ZIP Endpoints
**File:** `backend/src/routes/videos.ts`

```typescript
// POST /videos/download-zip/:jobId - Start ZIP generation
router.post('/download-zip/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const batch = await getJobStatus(jobId);
  const completedJobs = batch.jobs.filter(j => j.status === 'completed' && j.videoUrl);
  generateZipForJob(jobId, completedJobs).catch(console.error);
  res.json({ status: 'processing', totalVideos: completedJobs.length });
});

// GET /videos/download-zip/:jobId/progress - Get progress
router.get('/download-zip/:jobId/progress', async (req, res) => {
  const progress = getZipProgress(req.params.jobId);
  res.json(progress || { error: 'No ZIP in progress' });
});
```

### 4.4 Serve Temp Directory
**File:** `backend/src/server.ts`

Add after videos static route:
```typescript
app.use('/temp', express.static(path.join(__dirname, '../temp')));
```

Create `backend/temp/` directory (add `.gitkeep`).

### 4.5 Add Shared Types
**File:** `shared/src/index.ts`

```typescript
export interface ZipGenerationResponse {
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  totalVideos?: number;
}

export interface ZipProgressResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  zipPath?: string;
  error?: string;
}
```

### 4.6 Update API Client
**File:** `frontend/src/lib/api.ts`

```typescript
async startZipGeneration(jobId: string): Promise<ZipGenerationResponse> {
  return this.fetch(`/videos/download-zip/${jobId}`, { method: 'POST' });
}

async getZipProgress(jobId: string): Promise<ZipProgressResponse> {
  return this.fetch(`/videos/download-zip/${jobId}/progress`);
}
```

### 4.7 Update VideoGallery
**File:** `frontend/src/components/VideoGallery.tsx`

Replace `handleDownloadAll` with:
```typescript
const [zipState, setZipState] = useState({ isGenerating: false, progress: 0 });

const handleDownloadAllAsZip = async () => {
  setZipState({ isGenerating: true, progress: 0 });
  await apiClient.startZipGeneration(currentJobId);

  // Poll for progress every 500ms
  const interval = setInterval(async () => {
    const progress = await apiClient.getZipProgress(currentJobId);
    setZipState({ isGenerating: true, progress: progress.progress });

    if (progress.status === 'completed') {
      clearInterval(interval);
      // Trigger download of ZIP file
      window.location.href = `${API_BASE}${progress.zipPath}`;
    }
  }, 500);
};
```

Update button to show:
- "Download All as ZIP" with Archive icon
- During generation: "Creating ZIP... {progress}%" with spinner

---

## Phase 5: CSV/Manual Entry Toggle

### 5.1 Create InputModeToggle Component
**File:** `frontend/src/components/InputModeToggle.tsx`

```tsx
export type InputMode = 'manual' | 'csv';

interface InputModeToggleProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  disabled?: boolean;
}

export function InputModeToggle({ mode, onModeChange }: InputModeToggleProps) {
  return (
    <div className="flex items-center justify-center p-1 bg-muted rounded-lg">
      <button onClick={() => onModeChange('manual')} className={mode === 'manual' ? 'active' : ''}>
        <UserPlus /> Add Manually
      </button>
      <button onClick={() => onModeChange('csv')} className={mode === 'csv' ? 'active' : ''}>
        <Upload /> Upload CSV/Excel
      </button>
    </div>
  );
}
```

### 5.2 Create Confirmation Dialog
**File:** `frontend/src/components/ConfirmModeChangeDialog.tsx`

Shows when switching modes with existing recipients:
- Title: "Switch Input Mode?"
- Message: "You have {count} recipients. Switching will keep your existing data."
- Buttons: Cancel, Switch Mode

### 5.3 Update RecipientsStep
**File:** `frontend/src/components/steps/RecipientsStep.tsx`

```tsx
const [inputMode, setInputMode] = useState<InputMode>('manual');
const [showConfirmDialog, setShowConfirmDialog] = useState(false);

const handleModeChange = (newMode: InputMode) => {
  if (recipients.length > 0) {
    setShowConfirmDialog(true);
    setPendingMode(newMode);
  } else {
    setInputMode(newMode);
  }
};

// Render:
<SenderField />
<InputModeToggle mode={inputMode} onModeChange={handleModeChange} />
<AnimatePresence mode="wait">
  {inputMode === 'manual' ? <RecipientForm /> : <FileUploader />}
</AnimatePresence>
<RecipientTable />
<ConfirmModeChangeDialog ... />
```

---

## Implementation Order (Recommended)

1. **Phase 1** - Theme enum/types changes (foundation)
2. **Phase 2** - IntroSlide/OutroSlide updates (depends on Phase 1)
3. **Phase 5** - CSV/Manual toggle (standalone, simpler)
4. **Phase 4** - ZIP download (backend + frontend)
5. **Phase 3** - Wizard UX redesign (largest change, save for last)

After each phase: `npm run build` in shared, backend, remotion, frontend to verify no TypeScript errors.

---

## Testing Checklist

- [ ] All themes display correctly in HolidaySelector (including new Thank You, Congratulations)
- [ ] Yom Kippur is completely removed (no errors)
- [ ] New decorations render without performance issues
- [ ] IntroSlide shows correct greeting with recipient name
- [ ] OutroSlide no longer shows recipient name
- [ ] ZIP download works with multiple videos
- [ ] ZIP filenames are clear (e.g., "John_Smith_video.mp4")
- [ ] Manual/CSV toggle works and preserves data
- [ ] Wizard flows smoothly through all 4 steps
- [ ] Back/Next navigation works within each step card
- [ ] Step progress indicator updates correctly
