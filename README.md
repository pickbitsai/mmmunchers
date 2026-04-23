# mmmunchers

A modern 3D reimagining of the classic _Number Munchers_ educational game. Navigate a grid, munch the correct answers, and dodge enemies. 11 topics, 5 game modes, dual 2D/3D rendering. Pure client-side — no backend.

Built with React, TypeScript, Three.js / React Three Fiber, and Vite.

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the production bundle to `dist/public` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Run TypeScript type checking |

Node 20+ is recommended (see `.nvmrc`).

## Controls

**Desktop**
- Arrow keys / WASD — move
- Space — munch
- P — pause
- M — mute

**Mobile** — on-screen D-pad plus a MUNCH button.

## Game modes

| Mode | Enemies | Timer | Lives | Notes |
|---|---|---|---|---|
| Classic | Yes | Yes | 3 | The standard loop |
| Time Attack | No | 30s | — | +5s correct, −3s wrong |
| Trog Attack | Many, fast | No | 5 | Enemy-heavy challenge |
| Zen | No | No | — | Pure practice, no pressure |
| Streak | No | No | — | Chain correct answers; one wrong ends the run |

## Topics

Math, Words, Science, History, Geography, Animals, Dinosaurs, Marvel, Movies, Music, Surfing. Most topics have category filters (e.g. Math → multiples, factors, primes, perfect squares; Marvel → heroes, villains, teams).

## Project layout

```
client/
  index.html
  src/
    components/        React components (Game, GameBoard, GameBoard2D, MainMenu, ...)
    lib/
      gameLogic.ts     Enemy AI, collision, timer
      assetLoader.ts   3D asset preloading
      stores/          Zustand stores (useGameState, useAudio)
      topics/          Educational content providers (one file per topic)
  public/              Static assets (fonts, sounds, textures, geometries)
```

## Adding a new topic

1. Create `client/src/lib/topics/MyTopic.ts` extending `TopicProvider`
2. Implement `getName()`, `generateChallenge(level)`, `generateGrid(w, h, challenge)`
3. Register it in the `TOPIC_MAP` in `client/src/lib/stores/useGameState.tsx`
4. Add a card for it in `client/src/components/TopicSelection.tsx`

## Adding a new game mode

1. Extend the `GameMode` union in `client/src/lib/stores/useGameState.tsx`
2. Add defaults to `getModeSettings()`
3. Add a card in `ModeSelection.tsx`
4. Add any mode-specific HUD bits in `GameUI.tsx`
5. Wire up mode-specific behavior in `munchCurrentCell()` / `gameLogic.ts`

## Deploy

This is a pure static site — `npm run build` emits `dist/public/`, which you can host anywhere (Vercel, Netlify, GitHub Pages, Cloudflare Pages, plain S3). Config files for Vercel (`vercel.json`) and Netlify (`netlify.toml`) are included.

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

## Credits

Inspired by the classic MECC _Number Munchers_ (1986).
