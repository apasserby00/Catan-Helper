# Catan Helper

Mobile-first React PWA for Catan game timing, built with Vite, TypeScript, Tailwind, Radix-based shadcn-style UI primitives, and Dexie.

## Features

- Single-screen game timer with pause, resume, and finish flow
- Optional looping background music with user-interaction audio unlock
- Optional repeating turn timer with selectable alert sound
- Music ducking during turn alerts for softer transitions
- Local persistence:
  - `localStorage` for user settings
  - IndexedDB via Dexie for active session restore and last 30 finished games
- PWA manifest and service worker for GitHub Pages hosting
- Best-effort iPhone background handling with timestamp reconciliation on return

## Scripts

- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`

## Notes

- The production Vite base path is set to `/Catan-Helper/` for GitHub Pages deployment.
- Lock-screen and background alert precision on iPhone depends on iOS and browser behavior and cannot be guaranteed by a web PWA.
