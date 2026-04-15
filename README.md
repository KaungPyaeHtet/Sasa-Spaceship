# Sasa Spaces

A card-based space resource management game built with Phaser 3, Vite, and TypeScript.

## Gameplay

Play cards to complete products and manage your ship's heat. Each level has a target number of products to complete before your heat reaches the limit. Overheat and it's game over.

## Tech Stack

- [Phaser 3.90.0](https://github.com/phaserjs/phaser)
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
├── data/
│   ├── cards.ts          — Card definitions (heat, products per card)
│   ├── levels.ts         — Level configs (maxHeat, targetProducts per level)
│   └── animations.ts     — Global animation keyframe registration
├── ui/
│   ├── BackButton.ts     — Reusable back button component
│   ├── CardDisplay.ts    — Reusable card renderer
│   └── StatusSprite.ts   — Frame-based sprite updater (overheat/spaceship UI)
└── scenes/
    ├── Boot.ts           — Loads background image before Preloader
    ├── Preloader.ts      — Loads all assets, registers global animations, fades in
    ├── MainMenu.ts       — Title screen with Play / Setting / Tutorial buttons
    ├── LevelMenu.ts      — Level select grid (1–10)
    ├── Game.ts           — Core gameplay scene
    ├── Setting.ts        — Settings screen
    ├── Tutorial.ts       — Tutorial screen
    └── GameOver.ts       — Game over screen

public/assets/
├── bg.png
├── cards/sample_card.png
├── ui/
│   ├── button/           — blue.png, yellow.png
│   ├── box/              — blue.png (level select boxes)
│   ├── overheat/         — overheat1–8.png (heat status frames)
│   └── spaceship/        — spaceship1–8.png (product status frames)
```

## Adding Content

**New card** — add an entry to `src/game/data/cards.ts`:
```ts
{ name: "My Card", heat: 10, products: 2 }
```

**New level** — add an entry to `src/game/data/levels.ts`:
```ts
{ maxHeat: 50, targetProducts: 10 }
```
Then increment the level count in `LevelMenu.ts`.
