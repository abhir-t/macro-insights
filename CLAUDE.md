# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a Next.js 16 financial newsletter application using the App Router pattern with TypeScript, React 19, and Firebase.

### Key Technologies
- **React Compiler enabled** in next.config.ts
- **Tailwind CSS 4** via PostCSS
- **Firebase/Firestore** for data storage and authentication
- **react-markdown** for rendering article content
- **Path alias**: `@/*` maps to `./src/*`

### Project Structure
- `src/app/` - Next.js App Router pages
  - `writeups/` - Editorial feed and article detail pages (ISR enabled)
  - `infographics/` - Data visualization grid
  - `admin/` - Content management (requires admin UID)
- `src/components/` - React components (Navigation, ArticleCard, EmailCapture, etc.)
- `src/lib/` - Firebase initialization, Firestore queries, auth helpers
- `src/types/` - TypeScript interfaces (Article, Subscriber)

### Firestore Data Paths
- Articles: `artifacts/macro-insights/public/data/articles`
- Subscribers: `artifacts/macro-insights/public/data/subscribers`

### Styling
- Monochromatic theme: Black, White, Slate-50
- Playfair Display (serif) for headlines
- Inter (sans-serif) for body/UI
- NYT-inspired: hairline borders, grayscale images with color on hover, drop-cap article starts

### Environment Variables
Copy `.env.local.example` to `.env.local` and fill in Firebase credentials:
- `NEXT_PUBLIC_FIREBASE_*` - Firebase project config
- `NEXT_PUBLIC_ADMIN_UID` - UID for admin access
