# Catan Clock

Mobile-first React PWA for timing Catan games, built with Vite, TypeScript, Tailwind, Radix-based shadcn-style UI primitives, and Dexie.

## Features

- Single-screen game timer with pause, resume, and finish flow
- Optional looping background music with user-interaction audio unlock
- Optional repeating turn timer with selectable alert sound
- Music ducking during turn alerts for softer transitions
- Local persistence:
  - `localStorage` for user settings
  - IndexedDB via Dexie for active session restore and last 30 finished games
- PWA manifest and service worker for GitHub Pages hosting
- iPhone background handling that catches up when you return to the app

## Scripts

- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`

## Notes

- The production Vite base path is set to `/Catan-Helper/` for GitHub Pages deployment.
- Lock-screen and background alert precision on iPhone depends on iOS and browser behavior and cannot be guaranteed by a web PWA.

## GitHub Pages

1. Push this repo to the `master` branch on GitHub.
2. In the GitHub repo, open `Settings > Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `master` again, or run the `Deploy to GitHub Pages` workflow manually from the Actions tab.

The published site URL should be:

- [https://apasserby00.github.io/Catan-Helper/](https://apasserby00.github.io/Catan-Helper/)
