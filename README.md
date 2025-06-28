# Number Munchers - Educational Game

A modern 3D educational game built with React Three Fiber, inspired by the classic educational arcade game. Players navigate a grid-based environment to "munch" correct answers based on mathematical or word-based challenges while avoiding enemies.

## Features

### 🎮 Game Mechanics
- **Grid-based gameplay** with 3D visualization
- **Multiple educational topics**: Math, Words, Marvel Universe, Movie Trivia
- **Progressive difficulty** with automatic level advancement
- **Enemy AI** with three types: basic, fast, and smart behaviors
- **Score system** with level-based multipliers
- **Lives system** with collision detection

### 📱 Platform Support
- **Desktop controls**: Arrow keys or WASD for movement, Space for munching
- **Mobile controls**: Touch-based directional buttons with haptic feedback
- **Responsive design** that adapts to different screen sizes
- **Mobile-optimized UI** with proper touch target sizing

### 🎵 Audio System
- **Background music** with seamless looping
- **Sound effects** for movement, munching, and game events
- **Mute/unmute controls** with persistent settings
- **Haptic feedback** on mobile devices

### 🎨 Visual Design
- **3D graphics** powered by React Three Fiber
- **Smooth animations** with GSAP integration
- **Dark theme** with gradient backgrounds
- **Accessible UI** with high contrast text

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Three Fiber** for 3D rendering
- **@react-three/drei** for 3D utilities
- **Vite** for fast development and building
- **TailwindCSS** with shadcn/ui components
- **Zustand** for state management

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** support (production)
- **In-memory storage** (development)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/number-munchers.git
cd number-munchers
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5000`

## Game Controls

### Desktop
- **Arrow Keys** or **WASD**: Move player
- **Space**: Munch current cell
- **P**: Pause/Resume game
- **M**: Toggle mute

### Mobile
- **Touch Controls**: Use on-screen directional buttons
- **MUNCH Button**: Tap to munch current cell
- **UI Buttons**: Tap pause, mute, and restart buttons

## Educational Topics

### Mathematics
- **Categories**: Multiples, Factors, Prime Numbers, Perfect Squares, Addition, Subtraction
- **Progressive difficulty** with larger numbers at higher levels
- **Real-time challenge descriptions** guide learning objectives

### Word Games
- **Categories**: Nouns, Verbs, Adjectives, All Parts of Speech
- **Vocabulary building** through pattern recognition
- **Educational descriptions** explain grammar concepts

### Marvel Universe
- **Categories**: Heroes, Villains, Teams, Powers, Locations
- **Pop culture learning** through character recognition
- **Comprehensive Marvel database** with authentic content

### Movie Trivia
- **Categories**: Actors, Directors, Genres, Decades, Franchises, Awards
- **Film literacy** through entertainment knowledge
- **Diverse movie database** spanning multiple eras

## Development

### Project Structure
```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── lib/         # Utilities and stores
│   │   └── pages/       # Route components
├── server/              # Express backend
├── shared/              # Shared types and schemas
└── docs/                # Documentation
```

### Key Technologies
- **State Management**: Zustand stores for game state, audio, and UI
- **3D Rendering**: React Three Fiber with custom components
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Touch Handling**: Coordinate-based detection for reliable mobile controls

### Adding New Topics
1. Create a new class extending `TopicProvider`
2. Implement required methods: `generateChallenge()` and `generateGrid()`
3. Add the topic to the selection screen
4. Register the topic in the game state

## Deployment

### Replit (Recommended)
The project is optimized for Replit deployment with automatic configuration.

### Manual Deployment
1. Build the project:
```bash
npm run build
```

2. Set environment variables:
```bash
DATABASE_URL=your_postgresql_url
```

3. Deploy to your preferred platform (Vercel, Netlify, Railway, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the classic MECC Number Munchers educational game
- Built with modern web technologies for accessibility and performance
- Designed to make learning engaging and interactive

## Support

If you encounter any issues or have questions:
1. Check the [documentation](docs/)
2. Search existing [issues](https://github.com/yourusername/number-munchers/issues)
3. Create a new issue with detailed information

---

**Happy Learning! 🎓**