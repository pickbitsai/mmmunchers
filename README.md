# Number Munchers 3D

A modern 3D educational game inspired by the classic Number Munchers arcade game. Navigate through grid-based challenges, munch correct answers, and avoid enemies while learning math, vocabulary, and pop culture topics.

![Number Munchers 3D](./client/public/screenshot.png)

## Features

- **3D Graphics**: Built with React Three Fiber for immersive gameplay
- **Multiple Topics**: Mathematics, Word Games, Marvel Universe, and Movie Trivia
- **Progressive Difficulty**: Levels automatically increase in complexity
- **Responsive Design**: Works on desktop and mobile devices
- **Audio System**: Background music and sound effects with mute controls
- **Educational Value**: Learn while playing with category-specific challenges

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/number-munchers-3d.git
cd number-munchers-3d
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## How to Play

1. **Select a Topic**: Choose from Math, Words, Marvel, or Movies
2. **Choose Category**: Pick a specific category within your topic
3. **Navigate**: Use arrow keys or WASD to move around the grid
4. **Munch**: Press Space or click the MUNCH button to eat correct answers
5. **Avoid Enemies**: Stay away from the moving enemies that patrol the grid
6. **Progress**: Complete levels by munching all correct answers

### Controls

- **Movement**: Arrow Keys or WASD
- **Munch**: Spacebar or on-screen MUNCH button
- **Pause**: P or ESC key
- **Audio Toggle**: Click the speaker icon

## Topics & Categories

### Mathematics
- Basic arithmetic operations
- Multiples and factors
- Prime numbers
- Perfect squares
- Number patterns

### Word Games
- Parts of speech (nouns, verbs, adjectives)
- Word patterns and letter games
- Vocabulary building

### Marvel Universe
- Heroes and villains
- Teams and organizations
- Superpowers
- Locations and realms

### Movie Trivia
- Actors and directors
- Movie genres
- Film decades
- Franchises and awards

## Development

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and game logic
│   │   └── pages/         # Page components
│   └── public/            # Static assets
├── server/                # Express backend
├── shared/                # Shared types and schemas
└── docs/                  # Documentation
```

### Technology Stack

- **Frontend**: React 18, TypeScript, React Three Fiber
- **3D Graphics**: Three.js, @react-three/drei
- **Styling**: TailwindCSS, shadcn/ui components
- **State Management**: Zustand
- **Backend**: Express.js, Node.js
- **Build Tools**: Vite, ESBuild

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Adding New Topics

The game uses a modular topic system. To add a new educational topic:

1. Create a new class extending `TopicProvider` in `client/src/lib/topics/`
2. Implement the required methods: `getName()`, `generateChallenge()`, `generateGrid()`
3. Add category selection support with `getCategories()` and `setCategory()`
4. Register your topic in the game state management

Example:
```typescript
export class ScienceTopic extends TopicProvider {
  getName(): string {
    return "Science";
  }
  
  generateChallenge(level: number): Challenge {
    // Your challenge generation logic
  }
  
  generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
    // Your grid generation logic
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the classic MECC Number Munchers educational game
- Built with modern web technologies for enhanced accessibility
- Educational content designed to make learning fun and engaging

## Support

For questions, bug reports, or feature requests, please open an issue on GitHub.