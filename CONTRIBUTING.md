# Contributing to Number Munchers 3D

Thank you for your interest in contributing to Number Munchers 3D! This document outlines the guidelines and processes for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Install dependencies with `npm install`
4. Start the development server with `npm run dev`
5. Make your changes and test them thoroughly

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Basic knowledge of React, TypeScript, and Three.js

### Project Structure
```
client/src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Game.tsx        # Main game component
│   ├── GameBoard.tsx   # 3D game board
│   └── ...
├── lib/
│   ├── stores/         # Zustand state management
│   ├── topics/         # Educational topic providers
│   └── gameLogic.ts    # Core game mechanics
└── pages/              # Route components
```

## Types of Contributions

### 1. Educational Topics
Add new learning subjects by creating topic providers:

- Create a new class extending `TopicProvider`
- Implement challenge generation logic
- Add category support for varied gameplay
- Include comprehensive test coverage

### 2. Game Features
Enhance gameplay mechanics:

- New enemy types with unique behaviors
- Power-ups and special items
- Visual effects and animations
- Audio improvements

### 3. UI/UX Improvements
Improve the user experience:

- Accessibility enhancements
- Mobile responsiveness
- Performance optimizations
- Design refinements

### 4. Bug Fixes
Help maintain code quality:

- Fix reported issues
- Improve error handling
- Add missing features
- Performance optimizations

## Code Style Guidelines

### TypeScript
- Use strict typing with proper interfaces
- Prefer `interface` over `type` for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices for state management
- Use memo and callback optimizations when appropriate

### Styling
- Use TailwindCSS utility classes
- Follow the existing design system
- Ensure responsive design across devices
- Maintain consistent spacing and typography

## Testing

- Write unit tests for new functionality
- Test educational content accuracy
- Verify cross-browser compatibility
- Check mobile device responsiveness

## Educational Content Guidelines

When adding new topics or challenges:

1. **Accuracy**: Ensure all educational content is factually correct
2. **Age Appropriate**: Consider the target age group (elementary to middle school)
3. **Progressive Difficulty**: Implement proper level scaling
4. **Clear Instructions**: Make challenges easy to understand
5. **Variety**: Provide diverse question types within each topic

## Submitting Changes

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Update documentation if needed
4. Test your changes thoroughly
5. Submit a pull request with:
   - Clear title and description
   - Screenshots or GIFs for UI changes
   - List of changes made
   - Testing instructions

### Commit Message Format
```
type(scope): brief description

Detailed explanation of changes if needed

- List specific changes
- Include any breaking changes
- Reference issue numbers
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Adding New Educational Topics

### Step-by-Step Guide

1. Create a new file in `client/src/lib/topics/`
2. Extend the `TopicProvider` abstract class
3. Implement required methods:
   ```typescript
   export class MyTopic extends TopicProvider {
     getName(): string { return "My Topic"; }
     
     generateChallenge(level: number): Challenge {
       // Generate level-appropriate challenges
     }
     
     generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
       // Populate grid with correct/incorrect answers
     }
     
     getCategories(): Array<{id: string, name: string}> {
       // Return available categories
     }
     
     setCategory(category: string): void {
       // Set active category
     }
   }
   ```

4. Add comprehensive challenge varieties
5. Test with different difficulty levels
6. Update documentation

### Topic Requirements

- Minimum 5 categories per topic
- 10+ unique challenges per category
- Progressive difficulty scaling
- Clear answer validation logic
- Educational value verification

## Code Review Process

All contributions go through code review:

1. **Automated Checks**: CI runs tests and linting
2. **Peer Review**: Other contributors review code quality
3. **Educational Review**: Content accuracy verification
4. **Final Approval**: Maintainer approval for merge

## Getting Help

- Open an issue for questions or discussions
- Join community discussions in pull requests
- Check existing issues before creating new ones
- Be respectful and constructive in all interactions

## Recognition

Contributors are recognized in:
- README.md acknowledgments
- Release notes for significant contributions
- Community highlights for educational content

Thank you for helping make learning fun and accessible through Number Munchers 3D!