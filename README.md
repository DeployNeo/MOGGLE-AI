# Moggle AI — Personal Use Edition

A production-ready web application that analyzes facial structure from webcam or uploaded images and provides constructive grooming, hairstyle, and self-improvement suggestions.

## Features

- **Webcam Analysis** — Real-time camera capture with face validation
- **Image Upload** — JPG, PNG, WEBP support with automatic compression
- **Facial Landmark Analysis** — MediaPipe Face Landmarker integration
- **Face Shape Detection** — Oval, Round, Square, Rectangle, Diamond, Heart, Triangle
- **Dual AI Architecture** — OpenRouter + Groq with automatic fallback
- **Hairstyle Engine** — Top 5 personalized hairstyle recommendations
- **Recommendation Engine** — Hair, Skin, Fitness, Posture, Sleep, Fashion, Photography, Confidence
- **Privacy First** — No accounts, no database, no image storage

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Tailwind CSS + Shadcn UI
- Framer Motion
- MediaPipe Face Landmarker
- OpenRouter API + Groq API

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

> **Note:** The app works without API keys — computer vision analysis will still function, but AI-powered recommendations will be limited to rule-based suggestions.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Push your code to a Git repository
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `OPENROUTER_API_KEY`
   - `GROQ_API_KEY`
4. Deploy

## Project Structure

```
app/
  api/analyze/     # AI analysis API route
  globals.css      # Global styles
  layout.tsx       # Root layout
  page.tsx         # Home page
components/
  sections/        # Page sections (Hero, Webcam, Upload, Results)
  ui/              # Shadcn UI components
hooks/             # React hooks (webcam, upload, analysis)
lib/               # Utilities and constants
services/          # Face analysis, AI, hairstyle engine
types/             # TypeScript type definitions
```

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication → Email/Password**
3. Create a **Firestore** database
4. Copy config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

5. Firestore rules (development):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Privacy

- Image processing happens in the browser
- Photos are never uploaded to servers
- Only facial metrics are sent to AI APIs
- Logged-in users: analysis metadata saved (PSL, face shape — no photos)
- Guest users: data clears on refresh

## License

Personal use only.
