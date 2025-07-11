# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Number Munchers 3D - A modern 3D educational game built with React, TypeScript, and Three.js. The game features math, vocabulary, and pop culture learning topics in an interactive 3D environment with optional AI-powered custom content generation.

## Key Commands

### Development
```bash
npm run dev          # Start development server (frontend + backend)
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Run TypeScript type checking
npm run db:push      # Push database schema changes with Drizzle
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Three.js/React Three Fiber for 3D graphics
- **Backend**: Express.js server with optional PostgreSQL database
- **ORM**: Drizzle ORM with Zod validation
- **State Management**: Zustand stores
- **UI**: shadcn/ui components (Radix UI) + TailwindCSS
- **Audio**: Howler.js for cross-platform support
- **AI Integration**: OpenAI API for dynamic content generation
- **Build Tool**: Vite (frontend) + esbuild (backend)

### Project Structure
- `client/src/components/` - Game components (Game, GameBoard, GameBoard2D, Player, Enemy, etc.)
- `client/src/lib/` - Core game logic, stores, topics, and utilities
- `client/src/lib/stores/` - Zustand stores (useGameState, useAudio)
- `client/src/lib/topics/` - Educational content providers
- `client/src/lib/services/` - External service integrations (AI)
- `server/` - Express backend with API routes
- `shared/` - Shared types and Drizzle database schemas
- `public/` - Static assets (fonts, sounds, textures, 3D models)

### Key Architectural Patterns

1. **Topic System**: Educational content is organized into topics that extend `TopicProvider` base class. Topics define:
   - Topic metadata (name, icon, description)
   - Problem generation logic (`generateProblem()`)
   - Answer validation (`isCorrectAnswer()`)
   - Available subtopics (`getSubtopics()`)
   - Custom topics use AI for dynamic content generation

2. **Game State Management**: Uses Zustand stores for:
   - `useGameState` - Core game state (level, score, lives, board state, player/enemy positions)
   - `useAudio` - Audio management with Howler.js integration
   - Game phases: topic_selection, playing, paused, game_over, loading

3. **3D/2D Rendering**: Dual rendering modes with:
   - React Three Fiber components for 3D mode
   - Canvas-based 2D rendering as fallback
   - GLTF model loading for 3D assets
   - Custom shaders and postprocessing effects

4. **Enemy AI System**:
   - Three enemy types: basic (random), fast (2x speed), smart (pathfinding)
   - Pre-calculated spawn positions for deterministic behavior
   - Level-based scaling of enemy count and types

### Environment Variables
```bash
DATABASE_URL         # PostgreSQL connection (optional)
VITE_AI_API_KEY     # OpenAI API key for custom topics (optional)
NODE_ENV            # development/production
HOST                # Server host (default: 127.0.0.1)
ALLOWED_ORIGIN      # CORS allowed origin for production
```

### Development Notes

- **Path Aliases**: Use `@/` for client/src imports and `@shared/` for shared imports
- **TypeScript**: Strict mode enabled - always define proper types
- **Asset Loading**: Vite configured to handle .glb, .gltf, .mp3, .wav, .ogg, and .glsl files
- **Component Pattern**: Use functional components with hooks
- **Server Security**: Binds to 127.0.0.1 by default, proper CORS configuration required
- **Build Process**: Custom build script at `scripts/build.js` generates production artifacts

### Common Tasks

To add a new topic:
1. Create a new class extending `TopicProvider` in `client/src/lib/topics/`
2. Implement required methods: `generateProblem()`, `isCorrectAnswer()`, `getSubtopics()`
3. Register the topic in `client/src/lib/topics/index.ts`
4. Add topic to TopicSelection component if needed

To modify game mechanics:
- Core game logic is in `client/src/lib/stores/useGameState.tsx`
- Board generation logic in `client/src/lib/gameLogic.ts`
- 3D components in `client/src/components/` (Game.tsx, GameBoard.tsx)
- 2D rendering in `client/src/components/GameBoard2D.tsx`

To work with the database:
- Schema definitions in `shared/schema.ts`
- Use `npm run db:push` after schema changes
- API routes in `server/routes.ts`
- Storage abstraction in `server/storage.ts`

### Deployment
- Multiple deployment options supported (Replit, Vercel, Netlify, Railway)
- Production build creates artifacts in `.next/` directory
- GitHub Actions CI/CD configured with artifact uploads
- See `docs/DEPLOYMENT.md` for platform-specific instructions