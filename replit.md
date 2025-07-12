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
- June 23, 2025. Added level progression system with automatic advancement when all correct answers are munched
- June 23, 2025. Implemented separate movement and munch controls with 200ms debounce protection
- June 23, 2025. Added score system (10 points × level per correct answer, 100 × level bonus per level completion)
- June 23, 2025. Fixed layout overlaps: repositioned UI cards, controls below grid, MUNCH button on right side
- June 23, 2025. Implemented system overlay removal to hide "Arrow Keys / WASD: Move" instruction text
- June 24, 2025. Removed instruction text cards from game interface (GameUI, interface, TopicSelection components)
- June 24, 2025. Made all grid tiles uniform green color instead of blue/gray distinction for correct answers
- June 24, 2025. Implemented game over trigger when player overlaps with enemy using existing collision detection
- June 24, 2025. Updated all grid text to have black text on white background for better readability
- June 24, 2025. Added randomized starting level (1-3) for varied gameplay difficulty
- June 24, 2025. Implemented category selection system for Math, Word, and Marvel topics
- June 24, 2025. Created Marvel Universe topic with heroes, villains, teams, powers, and locations
- June 24, 2025. Improved text fitting in grid cells with smaller font sizes and overflow handling
- June 24, 2025. Fixed dropdown interaction to prevent immediate game launch and allow proper category selection
- June 24, 2025. Enhanced text wrapping with truncation for long words (8+ characters) and better font sizing
- June 24, 2025. Fixed mobile dropdown interaction issues by creating custom mobile-friendly Select component with proper touch handling
- June 24, 2025. Resolved mobile scrolling conflicts and improved layout to work properly under browser navigation bars
- June 24, 2025. Added success sound effect for correct answers when player munches correct grid items
- June 24, 2025. Implemented Movie Trivia topic with actors, directors, genres, decades, franchises, and awards categories
- June 24, 2025. Fixed text overflow in grid cells with improved wrapping, smaller font sizes, and multi-line text clipping
- June 24, 2025. Enhanced audio system with sound effects for player munching, movement, and enemy movement actions
- June 24, 2025. Improved munch sound effect with lower playback rate and different base sound for more satisfying crunch feedback
- June 26, 2025. Prepared project for public release: removed development artifacts, created comprehensive documentation, cleaned up debugging code
- June 28, 2025. Fixed mobile touch controls with coordinate-based detection system for reliable character movement on mobile devices
- June 28, 2025. Cleaned up all debugging code and console logging for production-ready deployment
- June 28, 2025. Resolved GitHub build failures by optimizing TypeScript configuration and adding proper deployment workflows
- January 12, 2025. Fixed game title display to show "mmmunchers" in both browser tab and main game interface
- January 12, 2025. Improved 2D game board text wrapping with intelligent word breaking to prevent single-letter wraps
- January 12, 2025. Fixed level progression bug: game now always starts at level 1 instead of random level 1-3
- January 12, 2025. Added debug logging for answer validation to help identify incorrect answer checking issues
- January 12, 2025. Added QA visual indicators: correct answers shown in green, incorrect in red, with color coding and small dot indicators
- January 12, 2025. Added QA legend to game UI explaining the color coding system for easier testing
- January 12, 2025. Fixed major answer validation bug: "Select everything about X" challenges now correctly mark ALL topic-related items as correct
- January 12, 2025. Improved AI challenge generation to distinguish between "everything about" and specific subset challenges
- January 12, 2025. Redesigned AI content generation: AI now provides mix of correct and incorrect answers for balanced gameplay
- January 12, 2025. Added intelligent answer separation system to categorize AI-generated items based on topic relevance
- January 12, 2025. Enhanced AI prompts to explicitly request both topic-related and unrelated items for natural challenge balance
- January 12, 2025. Fixed OpenAI prompt structure to request separate correctItems and incorrectItems arrays for accurate classification
- January 12, 2025. Implemented universal topic classification system that works for any user-submitted topic without pre-configuration
- January 12, 2025. Added comprehensive debugging and improved answer validation system for reliable correct/incorrect item separation
- January 12, 2025. MAJOR SECURITY OVERHAUL: Moved OpenAI API key to server-side only, eliminating client-side exposure
- January 12, 2025. Implemented secure server-side AI proxy endpoint with comprehensive input validation and rate limiting
- January 12, 2025. Added advanced security headers including HSTS, CSP, and XSS protection for production deployment
- January 12, 2025. Enhanced error handling to prevent information leakage while maintaining user experience
- January 12, 2025. Implemented IP-based rate limiting (5 requests/minute) to prevent API abuse and cost overflow
- January 12, 2025. Added comprehensive input sanitization and validation across all API endpoints
- January 12, 2025. Cleaned up debug logging to only show in development mode, securing production deployment
- January 12, 2025. Created comprehensive security audit documentation and deployment security checklist
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```