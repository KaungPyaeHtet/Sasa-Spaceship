# Contributing

## Architecture Overview

### Scene Flow

```
Boot → Preloader → MainMenu → LevelMenu → Game → GameOver
                           ↘ Setting
                           ↘ Tutorial
```

- **Boot** — loads only the background image (no progress bar needed)
- **Preloader** — loads all other assets, registers global animations, fades in/out
- **LevelMenu** — passes `{ level: i }` data to Game via `scene.start("Game", { level: i })`
- **Game** — reads level config from `levels[data.level - 1]`, drives all gameplay

### Key Design Decisions

**Single Level scene** — one `Game.ts` handles all levels via data. Do not create `Level1.ts`, `Level2.ts`, etc. Add level config to `data/levels.ts` instead.

**Animations registered globally in Preloader** — `this.anims.create()` calls belong in `Preloader.create()` via `createAnimations(this.anims)`. All scenes can call `.play("key")` without re-registering.

**Frame-based status sprites** — overheat and spaceship UI are not auto-played animations. Frames are set manually via `StatusSprite.update(ratio)` where `ratio` is `0.0–1.0`. This gives precise control tied to game state.

**Reusable UI components** live in `src/game/ui/`:
- `BackButton.ts` — `createBackButton(scene, targetScene)`
- `CardDisplay.ts` — `createCardDisplay(scene, x, y, w, h, card, onPlay)`
- `StatusSprite.ts` — `new StatusSprite(scene, x, y, baseKey, frameCount)`

### CSP Note

Phaser uses `eval` internally. The dev server sets `Content-Security-Policy: script-src 'self' 'unsafe-eval'` in `vite/config.dev.mjs` to allow this. Do not remove it.

## Adding a Reusable UI Component

1. Create the file in `src/game/ui/`
2. Accept `scene: Scene` as the first parameter
3. Export a plain function (not a class) unless stateful

## Asset Conventions

| Asset type | Location | Naming |
|---|---|---|
| Card backgrounds | `public/assets/cards/` | `*.png` |
| Animated status sprites | `public/assets/ui/<name>/` | `<name>1.png` … `<name>N.png` |
| Buttons | `public/assets/ui/button/` | `<color>.png` |
| Level select boxes | `public/assets/ui/box/` | `<color>.png` |

Load all assets in `Preloader.preload()`. Use descriptive keys (`"blue_button"`, `"blue_box"`, `"card_sample"`).
