# Card0r

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![Remotion](https://img.shields.io/badge/Remotion-4.0-5851DB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-ERROR.DEV-orange)

Create personalised video greeting cards for multiple recipients with AI-powered message generation.

**New to Card0r?** See the [Non-Techie Setup Guide](Non-Techie-Readme.md) for a plain-language walkthrough.

---

## What is Card0r?

Card0r is a full-stack web application that generates personalised, animated video greeting cards for multiple recipients at once. Upload a list of people, choose a theme, and let AI write unique messages for each person. The app then renders professional videos with themed animations and background music.

### Key Features

- **Batch Processing**: Create videos for dozens of recipients from a single spreadsheet
- **17 Holiday Themes**: Christmas, New Year, Easter, Valentine's Day, Halloween, Thanksgiving, Rosh Hashanah, Hanukkah, Passover, Eid al-Fitr, Eid al-Adha, Ramadan, Chinese New Year, Diwali, Lunar New Year, Thank You, and Congratulations
- **AI-Powered Messages**: OpenAI GPT-4 generates personalised messages based on your guidance
- **Message Review**: Edit AI-generated messages before video creation
- **Message Settings**: Control message length (5-100 words) and creativity level
- **Theme-Specific Animations**: Each theme has unique animated decorations with sparkle overlays
- **Multiple Export Formats**: 1080p HD, 4K Ultra HD, Square (Instagram), Social (Stories/TikTok)
- **Background Music**: Royalty-free music from Jamendo, matched to your theme
- **Video Cancellation**: Cancel individual videos or entire batches during generation
- **Batch Download**: Download all videos as a single ZIP file
- **Video Management**: Preview, download, or delete individual videos
- **Dark/Light Mode**: Full theme support with accessible colour contrast
- **Accessibility**: WCAG-compliant with keyboard navigation and screen reader support
- **Docker Ready**: Containerised deployment for easy setup

---

## Quick Start

### Prerequisites

- Node.js 20+ (or Docker)
- FFmpeg (for video encoding)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Jamendo API key ([Get one here](https://developer.jamendo.com/v3.0))

### With Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/err0r-dev/card0r.git
cd card0r

# Build and start
docker-compose up --build

# Open http://localhost:3000
```

### Without Docker

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start development servers
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

---

## How It Works

1. **Add Recipients**: Upload a CSV/Excel file or add people manually with name and message guidance
2. **Choose Theme**: Select from 17 holiday themes with unique animations
3. **Select Format**: Pick video dimensions (1080p, 4K, Square, or Social Stories)
4. **Choose Music**: Browse and select royalty-free background music
5. **Generate Messages**: AI creates personalised messages you can review and edit
6. **Confirm & Render**: Videos are generated after you approve the messages
7. **Download**: Preview and download individual videos or all as a ZIP

---

## Project Structure

```
Card0r/
├── frontend/          # React + Vite + TypeScript + shadcn/ui
├── backend/           # Node.js + Express + TypeScript + Remotion
├── remotion/          # Video compositions and theme decorations
├── shared/            # Shared TypeScript types
├── docker-compose.yml # Container orchestration
├── README.md          # This file
├── Non-Techie-Readme.md # Plain-language setup guide
└── ai.md              # AI assistant documentation
```

---

## Technology Stack

**Frontend:**
- React 19 with Vite
- TypeScript
- TailwindCSS + shadcn/ui (Radix primitives)
- Zustand (state management)
- Framer Motion (animations)

**Backend:**
- Node.js + Express
- TypeScript
- Remotion (React-based video rendering)
- OpenAI API (message generation)
- Jamendo API (background music)

**Video:**
- Remotion compositions with theme-specific decorations
- H.264 encoding via FFmpeg
- Dynamic duration based on message length
- 1-second fade in/out transitions

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/validate-keys` | POST | Validate API keys |
| `/api/upload-csv` | POST | Upload CSV/Excel file |
| `/api/generate-messages` | POST | Generate messages with OpenAI |
| `/api/music/:theme` | GET | Fetch music for theme |
| `/api/videos/generate` | POST | Start video generation |
| `/api/videos/status/:jobId` | GET | Check job status |
| `/api/videos/cancel/:jobId` | POST | Cancel all pending videos |
| `/api/videos/cancel/:jobId/:videoJobId` | POST | Cancel specific video |
| `/api/videos/download-zip/:jobId` | POST | Start ZIP generation |
| `/api/videos/download-zip/:jobId/progress` | GET | Check ZIP progress |
| `/api/videos/delete/:filename` | DELETE | Delete a video file |
| `/api/videos/delete-batch` | POST | Delete multiple videos |
| `/videos/:filename` | GET | Download generated video |

---

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

---

## Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend

# Preview Remotion compositions
cd remotion && npx remotion studio
```

---

## Building for Production

```bash
# Build all packages
npm run build

# Start production servers
npm start
```

---

## Docker Deployment

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

---

## Accessibility

Card0r is built with accessibility in mind:

- **Colour Contrast**: WCAG AA compliant text contrast in both light and dark modes
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: ARIA labels and live regions for dynamic content
- **Focus Indicators**: Visible focus states on all controls
- **Form Accessibility**: Proper labelling and error announcements

---

## Licence

This project is licensed under the [ERROR.DEV OPEN USE LICENSE](https://github.com/err0r-dev/.github/blob/main/profile/license.md)

---

## Credits

Built with:
- 17 holiday themes with custom animated decorations
- AI-powered personalisation via OpenAI GPT-4
- React-based video rendering with Remotion
- Royalty-free music from Jamendo
- Modern React interface with shadcn/ui

Created by [err0r.dev](https://err0r.dev)
