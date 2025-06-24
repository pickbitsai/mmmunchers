import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { TopicProvider } from "../topics/TopicProvider";
import { MathTopic } from "../topics/MathTopic";
import { WordTopic } from "../topics/WordTopic";
import { MarvelTopic } from "../topics/MarvelTopic";

export type GamePhase = "topic_selection" | "playing" | "paused" | "game_over";

export interface GridCell {
  value: string;
  isCorrect: boolean;
  isMunched: boolean;
  isEmpty: boolean;
}

export interface Player {
  x: number;
  y: number;
  moveX: number;
  moveY: number;
  isMoving: boolean;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  type: 'basic' | 'fast' | 'smart';
}

export interface Challenge {
  description: string;
  checkAnswer: (value: string) => boolean;
}

interface GameState {
  // Core game state
  gamePhase: GamePhase;
  selectedTopic: string | null;
  topicProvider: TopicProvider | null;
  
  // Game data
  grid: GridCell[][];
  player: Player;
  enemies: Enemy[];
  currentChallenge: Challenge | null;
  
  // Game stats
  score: number;
  lives: number;
  level: number;
  timeRemaining: number;
  
  // Actions
  initializeGame: () => void;
  selectTopic: (topicId: string | null) => void;
  startGame: () => void;
  restartGame: () => void;
  togglePause: () => void;
  gameOver: () => void;
  
  // Game mechanics
  updatePlayer: (player: Partial<Player>) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateGrid: (grid: GridCell[][]) => void;
  processPlayerMove: (newX: number, newY: number) => void;
  spawnEnemies: () => void;
  nextLevel: () => void;
  addScore: (points: number) => void;
}

const GRID_WIDTH = 9;
const GRID_HEIGHT = 7;

// Pre-calculated enemy spawn positions to avoid using Math.random in render
const enemySpawnPositions = [
  { x: 0, y: 0 }, { x: 8, y: 0 }, { x: 0, y: 6 }, { x: 8, y: 6 },
  { x: 4, y: 0 }, { x: 4, y: 6 }, { x: 0, y: 3 }, { x: 8, y: 3 }
];

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gamePhase: "topic_selection",
    selectedTopic: null,
    topicProvider: null,
    
    grid: [],
    player: { x: 4, y: 3, moveX: 0, moveY: 0, isMoving: false },
    enemies: [],
    currentChallenge: null,
    
    score: 0,
    lives: 3,
    level: 1,
    timeRemaining: 0,
    
    initializeGame: () => {
      set({
        gamePhase: "topic_selection",
        selectedTopic: null,
        topicProvider: null,
        grid: [],
        player: { x: 4, y: 3, moveX: 0, moveY: 0, isMoving: false },
        enemies: [],
        currentChallenge: null,
        score: 0,
        lives: 3,
        level: 1,
        timeRemaining: 0
      });
    },
    
    selectTopic: (topicId: string | null) => {
      if (!topicId) {
        set({
          gamePhase: "topic_selection",
          selectedTopic: null,
          topicProvider: null
        });
        return;
      }
      
      let provider: TopicProvider;
      switch (topicId) {
        case 'math':
          provider = new MathTopic();
          break;
        case 'words':
          provider = new WordTopic();
          break;
        case 'marvel':
          provider = new MarvelTopic();
          break;
        default:
          console.error(`Unknown topic: ${topicId}`);
          return;
      }
      
      // Set category if available from localStorage
      const savedCategory = localStorage.getItem(`category_${topicId}`);
      if (savedCategory && 'setCategory' in provider) {
        (provider as any).setCategory(savedCategory);
      }
      
      set({
        selectedTopic: topicId,
        topicProvider: provider
      });
      
      get().startGame();
    },
    
    startGame: () => {
      const { topicProvider } = get();
      if (!topicProvider) return;
      
      // Randomize starting level (1-3)
      const startingLevel = Math.floor(Math.random() * 3) + 1;
      
      // Generate challenge and grid
      const challenge = topicProvider.generateChallenge(startingLevel);
      const grid = topicProvider.generateGrid(GRID_WIDTH, GRID_HEIGHT, challenge);
      
      set({
        gamePhase: "playing",
        currentChallenge: challenge,
        grid,
        player: { x: 4, y: 3, moveX: 0, moveY: 0, isMoving: false },
        enemies: [],
        level: startingLevel,
        score: 0,
        lives: 3,
        timeRemaining: 60 + (startingLevel * 10) // More time for higher levels
      });
    },
    
    restartGame: () => {
      const { selectedTopic } = get();
      // Randomize starting level for restart too
      const startingLevel = Math.floor(Math.random() * 3) + 1;
      
      set({
        score: 0,
        lives: 3,
        level: startingLevel,
        enemies: [],
        timeRemaining: 0
      });
      
      if (selectedTopic) {
        get().selectTopic(selectedTopic);
      }
    },
    
    togglePause: () => {
      const { gamePhase } = get();
      if (gamePhase === "playing") {
        set({ gamePhase: "paused" });
      } else if (gamePhase === "paused") {
        set({ gamePhase: "playing" });
      }
    },
    
    gameOver: () => {
      set({ 
        gamePhase: "game_over",
        enemies: []
      });
    },
    
    updatePlayer: (playerUpdate: Partial<Player>) => {
      set((state) => ({
        player: { ...state.player, ...playerUpdate }
      }));
    },
    
    updateEnemies: (enemies: Enemy[]) => {
      set({ enemies });
    },
    
    updateGrid: (grid: GridCell[][]) => {
      set({ grid });
    },
    
    processPlayerMove: (newX: number, newY: number) => {
      const { grid, player, currentChallenge } = get();
      
      // Check bounds
      if (newX < 0 || newX >= GRID_WIDTH || newY < 0 || newY >= GRID_HEIGHT) {
        return;
      }
      
      const cell = grid[newY][newX];
      
      // Check if cell can be moved to
      if (cell.isEmpty || cell.isMunched) {
        get().updatePlayer({ x: newX, y: newY });
        return;
      }
      
      // Process munching
      if (currentChallenge?.checkAnswer(cell.value)) {
        // Correct answer
        const newGrid = [...grid];
        newGrid[newY][newX] = { ...cell, isMunched: true };
        
        set((state) => ({
          grid: newGrid,
          player: { ...state.player, x: newX, y: newY },
          score: state.score + (10 * state.level)
        }));
        
        // Check if level complete (all correct answers munched)
        const remainingCorrect = newGrid.flat().some(c => c.isCorrect && !c.isMunched);
        if (!remainingCorrect) {
          get().nextLevel();
        }
      } else {
        // Wrong answer - lose a life
        set((state) => ({
          lives: state.lives - 1
        }));
        
        if (get().lives <= 0) {
          get().gameOver();
        }
      }
    },
    
    spawnEnemies: () => {
      const { level } = get();
      const numEnemies = Math.min(1 + Math.floor(level / 3), 4);
      const enemies: Enemy[] = [];
      
      for (let i = 0; i < numEnemies; i++) {
        const spawnPos = enemySpawnPositions[i % enemySpawnPositions.length];
        const enemyType = level > 5 ? (i % 2 === 0 ? 'fast' : 'smart') : 'basic';
        
        enemies.push({
          id: `enemy-${i}`,
          x: spawnPos.x,
          y: spawnPos.y,
          targetX: spawnPos.x,
          targetY: spawnPos.y,
          speed: enemyType === 'fast' ? 1.5 : enemyType === 'smart' ? 1.2 : 1.0,
          type: enemyType
        });
      }
      
      set({ enemies });
    },
    
    nextLevel: () => {
      set((state) => ({
        level: state.level + 1,
        lives: Math.min(state.lives + 1, 5), // Bonus life, max 5
        score: state.score + 100 * state.level // Level completion bonus
      }));
      
      get().startGame();
    },
    
    addScore: (points: number) => {
      set((state) => ({
        score: state.score + points
      }));
    }
  }))
);
