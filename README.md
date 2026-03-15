# Catan Clock

Catan Clock is a lightweight companion timer for games of Catan. It helps keep turns moving and lets the table focus on the game instead of tracking time.

**Live app:**  
https://apasserby00.github.io/Catan-Clock/

---

## Features

- One-tap start for a new game
- A visible game timer that runs for the entire session
- Optional turn timer with alerts when a turn runs long
- Pause and resume when the table takes a break
- Save finished games and optionally record the winner
- Local game history stored on the device
- Optional background music

---

## How It Works

The app stays on a single screen during play.

The **main timer** tracks the total length of the game.  
The **turn timer** can alert players when their turn exceeds the configured limit.  

When the game ends, you can record the winner and save the result to your local game history.

All data stays in the browser on the device you are using.

---

## Install as an App

Catan Clock is a **Progressive Web App (PWA)** and can be installed on phones, tablets, or desktops so it behaves like a regular app.

On most browsers you can choose:

**Install App** or **Add to Home Screen**

---

## Settings

You can configure:

- Language
- Background music
- Turn timer on or off
- Time allowed per turn

---

## Notes

Your settings and recent game history stay on the device you are using.

If you update the app and changes do not appear immediately, reloading the page usually fixes it.

---

## Tech Stack

- React
- Vite
- Progressive Web App (PWA)
- Local browser storage for settings and game history
