# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Number Munchers 3D - A modern 3D educational game built with React, TypeScript, and Three.js. The game features math, vocabulary, and pop culture learning topics in an interactive 3D environment.

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
- **Backend**: Express.js server with PostgreSQL database
- **ORM**: Drizzle ORM with Zod validation
- **State Management**: Zustand stores
- **UI**: shadcn/ui components (Radix UI) + TailwindCSS
- **Build Tool**: Vite

### Project Structure
- `client/src/components/` - Game components (Board3D, Muncher3D, Monster, etc.)
- `client/src/lib/` - Core game logic, stores, topics, and utilities
- `client/src/pages/` - Page components
- `server/` - Express backend with API routes
- `shared/` - Shared types and Drizzle database schemas
- `public/` - Static assets (fonts, sounds, textures, 3D models)

### Key Architectural Patterns

1. **Topic System**: Educational content is organized into topics that extend `TopicProvider` base class. Topics define:
   - Topic metadata (name, icon, description)
   - Problem generation logic
   - Answer validation
   - Available subtopics

2. **Game State Management**: Uses Zustand stores for:
   - `useGameStore` - Core game state (level, score, lives, board state)
   - `useSettingsStore` - User preferences and settings
   - `useSoundStore` - Audio management

3. **3D Rendering**: React Three Fiber components with:
   - Custom shaders for visual effects
   - GLTF model loading for 3D assets
   - Postprocessing effects for polish

4. **Database Schema**: Defined in `shared/schema.ts` using Drizzle ORM
   - User profiles and authentication
   - Game progress tracking
   - Leaderboard functionality

### Development Notes

- **Path Aliases**: Use `@/` for client/src imports and `@shared/` for shared imports
- **Environment Variables**: Requires `DATABASE_URL` for database connection
- **Asset Loading**: Vite configured to handle .glb, .gltf, .mp3, .wav, and .glsl files
- **Type Safety**: Strict TypeScript enabled - always define proper types
- **Component Pattern**: Use functional components with hooks
- **Audio**: Managed through SoundManager singleton using Howler.js

### Common Tasks

To add a new topic:
1. Create a new class extending `TopicProvider` in `client/src/lib/topics/`
2. Implement required methods: `generateProblem()`, `isCorrectAnswer()`, `getSubtopics()`
3. Register the topic in `client/src/lib/topics/index.ts`

To modify game mechanics:
- Core game logic is in `client/src/lib/stores/gameStore.ts`
- Board generation logic in `client/src/lib/gameLogic.ts`
- 3D components in `client/src/components/`

To work with the database:
- Schema definitions in `shared/schema.ts`
- Use `npm run db:push` after schema changes
- API routes in `server/` directory