# Number Munchers - Educational Game

## Overview

Number Munchers is a modern 3D educational game built with React Three Fiber, inspired by the classic educational arcade game. Players navigate a grid-based environment to "munch" correct answers based on mathematical or word-based challenges while avoiding enemies. The game features multiple educational topics, progressive difficulty levels, and engaging 3D graphics.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for component-based UI development
- **React Three Fiber** for 3D rendering and game graphics
- **@react-three/drei** for advanced 3D utilities and controls
- **Vite** as the build tool and development server
- **TailwindCSS** with shadcn/ui components for styling
- **Zustand** for state management across game components
- **TanStack Query** for data fetching and caching

### Backend Architecture
- **Express.js** server with TypeScript
- **In-memory storage** for development (MemStorage class)
- **Drizzle ORM** configured for PostgreSQL (production-ready)
- RESTful API structure with `/api` prefix routing

### Build System
- **ESBuild** for server-side bundling
- **Vite** for client-side bundling with React support
- **GLSL shader support** for advanced visual effects
- **Asset handling** for 3D models (.gltf, .glb) and audio files

## Key Components

### Game Logic System
- **Topic-based challenges**: Modular system supporting Mathematics and Word Games
- **Grid-based gameplay**: 2D grid with 3D visualization
- **Enemy AI**: Multiple enemy types (basic, fast, smart) with different behaviors
- **Player controls**: Keyboard-based movement with customizable key mappings
- **Progressive difficulty**: Level-based challenge generation

### Educational Topics
- **MathTopic**: Arithmetic operations, multiples, factors, prime numbers, perfect squares
- **WordTopic**: Parts of speech (nouns, verbs, adjectives), word patterns, letter games
- **Extensible architecture**: Abstract TopicProvider class for easy addition of new subjects

### Audio System
- **Background music** with looping capability
- **Sound effects** for player actions (hit, success)
- **Mute/unmute controls** with persistent state
- **Audio preloading** and memory management

### UI Components
- **Topic Selection Screen**: Grid-based topic picker with availability states
- **Game HUD**: Real-time display of score, lives, level, and remaining time
- **Challenge Display**: Dynamic instruction panel for current objectives
- **Control Interface**: Pause/resume, restart, audio toggle functionality

## Data Flow

1. **Game Initialization**: User selects educational topic from main menu
2. **Challenge Generation**: Selected topic provider generates level-appropriate challenges
3. **Grid Population**: Game board populated with correct/incorrect answers based on challenge
4. **Game Loop**: 
   - Player input processed through keyboard controls
   - Enemy AI updates positions and targets
   - Collision detection between player, enemies, and grid cells
   - Score/lives/progress updated based on game events
5. **State Persistence**: Game state maintained through Zustand stores
6. **Level Progression**: Automatic advancement based on completion criteria

## External Dependencies

### Core Game Framework
- **@react-three/fiber**: 3D rendering engine integration
- **@react-three/drei**: Advanced 3D utilities and camera controls
- **@react-three/postprocessing**: Visual effects and post-processing

### UI Framework
- **@radix-ui components**: Accessible UI primitives for dialogs, buttons, cards
- **class-variance-authority**: Type-safe styling variants
- **tailwind-merge**: Intelligent CSS class merging

### Development Tools
- **@neondatabase/serverless**: PostgreSQL database driver (production)
- **drizzle-orm**: Type-safe database ORM
- **vite-plugin-glsl**: Shader file processing

### Audio and Assets
- **Font loading**: Inter font family via @fontsource
- **3D model support**: GLTF/GLB format handling
- **Audio formats**: MP3, OGG, WAV support

## Deployment Strategy

### Development Environment
- **Replit integration**: Configured for seamless cloud development
- **Hot module replacement**: Instant updates during development
- **Development server**: Express with Vite middleware integration

### Production Build
- **Client bundling**: Vite builds React app to `dist/public`
- **Server bundling**: ESBuild creates Node.js server bundle
- **Asset optimization**: Automatic compression and optimization
- **Environment variables**: Database URL and configuration management

### Database Strategy
- **Development**: In-memory storage for rapid prototyping
- **Production**: PostgreSQL with Drizzle ORM migrations
- **Schema management**: Type-safe database operations with Drizzle Kit

### Scaling Considerations
- **Autoscale deployment**: Configured for automatic scaling based on demand
- **Static asset serving**: Optimized for CDN delivery
- **Session management**: Ready for Redis or database-backed sessions

## Changelog
```
Changelog:
- June 23, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```