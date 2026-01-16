# GEMINI.md

## Project Overview

This is a **financial newsletter application** built with **Next.js 16** (App Router), **React 19**, and **TypeScript**. It utilizes **Firebase/Firestore** for data storage and authentication, and **Tailwind CSS 4** for styling. The application features editorial content ("writeups") and data visualizations ("infographics"), along with an admin interface for content management.

## Key Technologies

*   **Framework:** Next.js 16.1.1 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4, PostCSS
*   **Database & Auth:** Firebase / Firestore
*   **Email:** Resend
*   **Rendering:** React Markdown (for articles)
*   **Animation:** Framer Motion
*   **React Compiler:** Enabled (`next.config.ts`)

## Building and Running

### Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server at `http://localhost:3000` |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

### Environment Setup

Create a `.env.local` file with the following keys (see `.env.local.example` if available):

*   `NEXT_PUBLIC_FIREBASE_API_KEY`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
*   `NEXT_PUBLIC_FIREBASE_APP_ID`
*   `NEXT_PUBLIC_ADMIN_UID` (Required for accessing `/admin`)

## Architecture & Structure

### Directory Layout

*   `src/app/` - App Router pages and layouts.
    *   `writeups/` - Editorial feed and detail pages (ISR).
    *   `infographics/` - Data visualization gallery.
    *   `admin/` - CMS for creating/editing content.
    *   `api/` - API routes (contact, subscribe, send-newsletter).
*   `src/components/` - Reusable UI components.
    *   `ArticleCard.tsx`, `InfographicCard.tsx` - Content displays.
    *   `Navigation.tsx`, `MobileNav.tsx` - Site navigation.
*   `src/lib/` - Utility libraries.
    *   `firebase.ts` - Firebase app initialization.
    *   `firestore.ts` - Data fetching and manipulation logic.
*   `src/types/` - TypeScript interfaces (`Article`, `Subscriber`).

### Data Model (Firestore)

Data is stored in Firestore under the `artifacts/macro-insights/public/data/` namespace:

*   **Articles:** `artifacts/macro-insights/public/data/articles`
    *   Fields: `title`, `excerpt`, `content`, `author`, `date` (Timestamp), `readTime`, `type` ('writeup' | 'infographic'), `imageUrl`.
*   **Subscribers:** `artifacts/macro-insights/public/data/subscribers`
    *   Fields: `email`, `subscribedAt` (Timestamp).
*   **Contacts:** `artifacts/macro-insights/public/data/contacts`
    *   Fields: `name`, `email`, `message`, `createdAt` (Timestamp).

### Styling Guidelines

*   **Theme:** Monochromatic (Black, White, Slate-50).
*   **Fonts:**
    *   **Playfair Display:** Used for headlines and titles.
    *   **Inter:** Used for body text and UI elements.
*   **Design Style:** NYT-inspired, hairline borders, grayscale images (color on hover), drop-caps.

## Development Conventions

*   **Path Aliases:** Use `@/` to resolve to `./src/` (e.g., `@/components/Button`).
*   **Component Location:** Place new components in `src/components`.
*   **Data Access:** All Firestore interaction logic should reside in `src/lib/firestore.ts`.
*   **Type Safety:** Define and use interfaces in `src/types/index.ts` for all data models.
