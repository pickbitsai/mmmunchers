import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { TopicProvider } from "../topics/TopicProvider";
import { MathTopic } from "../topics/MathTopic";
import { WordTopic } from "../topics/WordTopic";
import { MarvelTopic } from "../topics/MarvelTopic";
import { MovieTopic } from "../topics/MovieTopic";
import { CustomTopic } from "../topics/CustomTopic";
import { useAudio } from "./useAudio";

export type GamePhase = "topic_selection" | "playing" | "paused" | "game_over" | "loading";
export type RenderMode = "2d" | "3d";

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
  renderMode: RenderMode;
  
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
  startGame: () => Promise<void>;
  restartGame: () => void;
  togglePause: () => void;
  gameOver: () => void;
  toggleRenderMode: () => void;
  
  // Game mechanics
  updatePlayer: (player: Partial<Player>) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateGrid: (grid: GridCell[][]) => void;
  processPlayerMove: (newX: number, newY: number) => void;
  munchCurrentCell: () => void;
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
    renderMode: "3d",
    
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
        case 'movies':
          provider = new MovieTopic();
          break;
        case 'custom':
          const customTopicName = localStorage.getItem('customTopic') || 'Custom Topic';
          provider = new CustomTopic(customTopicName);
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
    
    startGame: async () => {
      const { topicProvider, selectedTopic, level: currentLevel } = get();
      if (!topicProvider) return;
      
      // Show loading state for custom topics
      if (selectedTopic === 'custom') {
        set({ gamePhase: "loading" });
      }
      
      // Use current level if continuing, otherwise randomize starting level (1-3)
      const gameLevel = currentLevel > 0 ? currentLevel : Math.floor(Math.random() * 3) + 1;
      
      try {
        // Generate challenge and grid for the current level
        const challenge = await Promise.resolve(topicProvider.generateChallenge(gameLevel));
        const grid = await Promise.resolve(topicProvider.generateGrid(GRID_WIDTH, GRID_HEIGHT, challenge));
        
        set((state) => ({
          gamePhase: "playing",
          currentChallenge: challenge,
          grid,
          player: { x: 4, y: 3, moveX: 0, moveY: 0, isMoving: false },
          enemies: [],
          level: gameLevel,
          // Preserve score and lives when continuing to next level
          score: state.score > 0 ? state.score : 0,
          lives: state.lives > 0 ? state.lives : 3,
          timeRemaining: 60 + (gameLevel * 10) // More time for higher levels
        }));
      } catch (error) {
        console.error('Failed to generate game content:', error);
        // Return to topic selection on error
        set({
          gamePhase: "topic_selection",
          selectedTopic: null,
          topicProvider: null
        });
      }
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
    
    toggleRenderMode: () => {
      set((state) => ({
        renderMode: state.renderMode === "3d" ? "2d" : "3d"
      }));
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
      const { grid } = get();
      

      
      // Check bounds using actual grid dimensions
      const gridWidth = grid[0]?.length || 0;
      const gridHeight = grid.length || 0;
      
      if (newX < 0 || newX >= gridWidth || newY < 0 || newY >= gridHeight) {

        return;
      }
      
      // Just move the player - no auto-munching
      const { playMove } = useAudio.getState();
      playMove();

      get().updatePlayer({ x: newX, y: newY });
    },
    
    munchCurrentCell: () => {
      const { grid, player, currentChallenge } = get();
      const cell = grid[player.y][player.x];
      
      // Can't munch empty or already munched cells
      if (cell.isEmpty || cell.isMunched) {
        return;
      }
      
      // Process munching
      if (currentChallenge?.checkAnswer(cell.value)) {
        // Correct answer - play munch sound
        const { playMunch } = useAudio.getState();
        playMunch();
        
        const newGrid = [...grid];
        newGrid[player.y][player.x] = { ...cell, isMunched: true };
        
        set((state) => ({
          grid: newGrid,
          score: state.score + (10 * state.level)
        }));
        
        // Check if level complete (all correct answers munched)
        const remainingCorrect = newGrid.flat().some(c => c.isCorrect && !c.isMunched);
        const totalCorrect = newGrid.flat().filter(c => c.isCorrect).length;
        const munchedCorrect = newGrid.flat().filter(c => c.isCorrect && c.isMunched).length;
        

        
        if (!remainingCorrect) {

          get().nextLevel();
        }
      } else {
        // Wrong answer - lose a life
        const { playHit } = useAudio.getState();
        playHit();
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
      const { playSuccess } = useAudio.getState();
      playSuccess();
      

      
      // Show a brief pause before starting next level
      set((state) => ({
        level: state.level + 1,
        lives: Math.min(state.lives + 1, 5), // Bonus life, max 5
        score: state.score + 100 * state.level, // Level completion bonus
        gamePhase: "paused" as GamePhase // Brief pause to show level complete
      }));
      
      // Start next level after a short delay
      setTimeout(() => {
        get().startGame();
        get().spawnEnemies();
      }, 1500);
    },
    
    addScore: (points: number) => {
      set((state) => ({
        score: state.score + points
      }));
    }
  }))
);
