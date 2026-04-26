# Sasa Spaces

> *Manage the machine. Survive the heat.*

A card-based space resource management game built with Phaser 4, Vite, and TypeScript.

## Gameplay

You are the chief engineer of a deep-space rocket factory. Process resource cards to fill your ship's Electricity, Fuel, and Titanium bars — then launch. Do it 3 times before the timer runs out and the reactor overheats.

- Drag cards onto the machine to process them
- Stack compatible cards for combo bonuses and extra time
- Unlock Power Mode (3 slots) to run cards simultaneously
- Survive random events: Meteor Showers, Solar Flares, System Glitches
- Earn stars across 10 escalating levels

## Team

| Role | Name |
|------|------|
| Game Design | Vincent |
| Coding | Ozzy |
| Graphic Design & Illustration | Kimmy |
| Audio & Storyline | Nora |
| Sound | Alex |

## Tech Stack

- [Phaser 4.0.0](https://github.com/phaserjs/phaser)
- [Vite 6.3.1](https://github.com/vitejs/vite)
- [TypeScript 5.7.2](https://github.com/microsoft/TypeScript)

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development web server |
| `npm run build` | Create a production build in the `dist` folder |

The local development server runs on `http://localhost:8080` by default.

## Project Structure

```
src/game/
├── audio/
│   └── AudioManager.ts     — Volume state, music, SFX, voiceline playback
├── data/
│   ├── cards.ts            — Card definitions (heat, resources, duration, points)
│   ├── cardUpgrades.ts     — Tier system mapping cards to level ranges
│   ├── levels.ts           — Level configs (maxHeat, heatPerSecond, timeLimit, resources needed)
│   ├── randomEvents.ts     — Random event definitions and level thresholds
│   ├── animations.ts       — Global animation keyframe registration
│   └── progress.ts         — Star/progress persistence via localStorage
├── ui/
│   ├── CardDisplay.ts      — Draggable card + processing slot renderers
│   ├── CardSFX.ts          — Card ID → audio key mapping
│   ├── ComboPanel.ts       — Combo banner UI
│   ├── EventBanner.ts      — Random event warning banner
│   ├── HUDBars.ts          — Heat bar and resource bar builders
│   ├── StatusSprite.ts     — Frame-based sprite updater (overheat/spaceship)
│   ├── BackButton.ts       — Reusable back button component
│   └── sounds.ts           — Hover SFX helper
├── vfx/
│   └── VFX.ts              — Particles, drop zone pulse, float text effects
└── scenes/
    ├── Boot.ts             — Loads background before Preloader
    ├── Preloader.ts        — Loads all assets, registers animations
    ├── Story.ts            — Pre-game story cutscene
    ├── MainMenu.ts         — Title screen
    ├── LevelMenu.ts        — Level select grid (1–10) with star display
    ├── Game.ts             — Core gameplay scene
    ├── GameOver.ts         — End-of-level result screen
    ├── PauseMenu.ts        — In-game pause overlay
    ├── CardInfo.ts         — Card info popup
    ├── Achievement.ts      — Achievement display
    ├── Tutorial.ts         — Interactive tutorial overlay
    ├── Setting.ts          — Volume sliders and settings
    └── Credits.ts          — Scrolling credits scene

public/assets/
├── bg.png
├── logo.png
├── fonts/supercharge.otf
├── audio/                  — Background music, SFX, voicelines
├── cards/                  — Card art across 10 upgrade tiers
├── spaceships/             — Spaceship sprites per level
├── machine/                — Machine animation frames
├── story/                  — Story scene images
└── ui/                     — Buttons, boxes
```

## Adding Content

**New card** — add an entry to `src/game/data/cards.ts`:
```ts
{
    id: 'mycard',
    name: 'My Card',
    imageKey: 'mycard',
    duration: 2,
    heat: 3,
    resource: 'fuel',
    resourceAmount: 4,
    points: 2,
    description: 'Does something cool',
}
```

**New level** — add an entry to `src/game/data/levels.ts`:
```ts
{ maxHeat: 100, heatPerSecond: 1.2, timeLimit: 90, star1Pct: 0.35, star2Pct: 0.68, electricityNeeded: 9, fuelNeeded: 9, titaniumNeeded: 9 }
```
Then update the level count in `LevelMenu.ts`.
