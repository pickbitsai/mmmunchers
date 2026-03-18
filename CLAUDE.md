# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Number Munchers 3D - A modern 3D educational game built with React, TypeScript, and Three.js. Features 11 educational topics, 5 game modes, and dual 2D/3D rendering. Pure client-side static app — no backend required.

## Key Commands

### Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
npm run check        # Run TypeScript type checking
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Three.js/React Three Fiber
- **State Management**: Zustand stores
- **UI**: shadcn/ui components (Radix UI) + TailwindCSS
- **Audio**: Howler.js
- **Build Tool**: Vite

### Project Structure
- `client/src/components/` - React components (MainMenu, ModeSelection, TopicSelection, Game, GameBoard, GameBoard2D, GameUI, Player, Enemy, etc.)
- `client/src/lib/stores/` - Zustand stores (useGameState, useAudio)
- `client/src/lib/topics/` - Educational content providers (11 topics)
- `client/src/lib/gameLogic.ts` - Enemy AI, collision detection, timer
- `client/src/lib/utils.ts` - Utilities
- `client/src/lib/assetLoader.ts` - 3D asset preloading
- `public/` - Static assets (fonts, sounds, textures, 3D models)

### Key Architectural Patterns

1. **Topic System**: Educational content extends `TopicProvider` base class:
   - `getName()` - Topic display name
   - `generateChallenge(level)` - Creates a Challenge with description + checkAnswer function
   - `generateGrid(width, height, challenge)` - Populates grid with correct/incorrect items
   - `setCategory?(category)` / `getCategories?()` - Optional category filtering
   - **11 topics**: Math, Words, Science, History, Geography, Animals, Dinosaurs, Marvel, Movies, Music, Surfing

2. **Game Modes** (5 modes):
   - **Classic**: Enemies + timer + lives. Standard munching.
   - **Time Attack**: No enemies, 30s timer, +5s correct, -3s wrong.
   - **Trog Attack**: Heavy enemies, no timer, 5 lives.
   - **Zen**: No enemies, no timer, no pressure. Practice mode.
   - **Streak**: No enemies, chain correct answers. One wrong = game over.

3. **Game State** (`useGameState`):
   - Phases: `main_menu → mode_selection → topic_selection → playing ↔ paused → game_over`
   - Also: `level_complete` (brief transition between levels)
   - Mode-specific settings control enemies, timer, lives, scoring

4. **Menu Flow** (3 screens):
   - `MainMenu` → Play button, render mode toggle, audio toggle
   - `ModeSelection` → 5 game mode cards
   - `TopicSelection` → 11 topic cards with category dropdowns

5. **3D/2D Rendering**: Dual rendering modes:
   - React Three Fiber components for 3D mode (GameBoard.tsx)
   - Canvas-based 2D rendering as fallback (GameBoard2D.tsx)

6. **Enemy AI System**:
   - Three types: basic (70% chase/30% random), fast (direct chase), smart (predictive)
   - Level-based scaling of count, types, and move interval
   - Trog Attack mode: faster intervals, more enemies

### Development Notes

- **Path Aliases**: Use `@/` for client/src imports
- **TypeScript**: Strict mode enabled
- **Asset Loading**: Vite handles .glb, .gltf, .mp3, .wav, .ogg, .glsl files
- **Component Pattern**: Functional components with hooks
- **No backend**: Pure static client-side app, deploy anywhere

### Common Tasks

To add a new topic:
1. Create a new class extending `TopicProvider` in `client/src/lib/topics/`
2. Implement: `getName()`, `generateChallenge(level)`, `generateGrid(w, h, challenge)`
3. Add topic to `TOPIC_MAP` in `client/src/lib/stores/useGameState.tsx`
4. Add topic card to `topics` array in `client/src/components/TopicSelection.tsx`

To add a new game mode:
1. Add mode to `GameMode` type in `useGameState.tsx`
2. Add settings in `getModeSettings()` function
3. Add mode card in `ModeSelection.tsx`
4. Add mode-specific HUD in `GameUI.tsx` `renderStats()`
5. Handle mode behavior in `munchCurrentCell()` and `gameLogic.ts`

To modify game mechanics:
- Core game state: `client/src/lib/stores/useGameState.tsx`
- Enemy AI & collision: `client/src/lib/gameLogic.ts`
- 3D board: `client/src/components/GameBoard.tsx`
- 2D board: `client/src/components/GameBoard2D.tsx`

### Deployment
- Pure static site — deploy `dist/` to any host (Vercel, Netlify, GitHub Pages, etc.)
- Build with `npm run build`, preview with `npm run preview`
