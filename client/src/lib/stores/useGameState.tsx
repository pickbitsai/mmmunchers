import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { TopicProvider } from "../topics/TopicProvider";
import { MathTopic } from "../topics/MathTopic";
import { WordTopic } from "../topics/WordTopic";
import { MarvelTopic } from "../topics/MarvelTopic";
import { MovieTopic } from "../topics/MovieTopic";
import { CustomTopic } from "../topics/CustomTopic";
import { useAudio } from "./useAudio";
import { toast } from "sonner";

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
  lastMoveTime: number;
  isMoving: boolean;
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

// Responsive grid sizes - smaller grids for bigger tiles
// Cache the dimensions to avoid recalculating on every access
let cachedGridDimensions: { width: number; height: number } | null = null;
let lastWindowWidth = 0;

const getGridDimensions = () => {
  const currentWidth = window.innerWidth;
  
  // Return cached dimensions if window width hasn't changed significantly
  if (cachedGridDimensions && Math.abs(currentWidth - lastWindowWidth) < 50) {
    return cachedGridDimensions;
  }
  
  lastWindowWidth = currentWidth;
  
  if (currentWidth < 640) { // Mobile
    cachedGridDimensions = { width: 5, height: 4 };
  } else if (currentWidth < 768) { // Small tablet
    cachedGridDimensions = { width: 6, height: 5 };
  } else if (currentWidth < 1024) { // Tablet
    cachedGridDimensions = { width: 7, height: 5 };
  } else { // Desktop
    cachedGridDimensions = { width: 8, height: 6 };
  }
  
  return cachedGridDimensions;
};

const GRID_DIMENSIONS = getGridDimensions();
const GRID_WIDTH = GRID_DIMENSIONS.width;
const GRID_HEIGHT = GRID_DIMENSIONS.height;

// Pre-calculated enemy spawn positions to avoid using Math.random in render
const getEnemySpawnPositions = (gridWidth: number, gridHeight: number) => {
  const midX = Math.floor(gridWidth / 2);
  const midY = Math.floor(gridHeight / 2);
  return [
    { x: 0, y: 0 }, 
    { x: gridWidth - 1, y: 0 }, 
    { x: 0, y: gridHeight - 1 }, 
    { x: gridWidth - 1, y: gridHeight - 1 },
    { x: midX, y: 0 }, 
    { x: midX, y: gridHeight - 1 }, 
    { x: 0, y: midY }, 
    { x: gridWidth - 1, y: midY }
  ];
};

const enemySpawnPositions = getEnemySpawnPositions(GRID_WIDTH, GRID_HEIGHT);

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
      
      // Use current level if continuing, otherwise start at level 1
      const gameLevel = currentLevel > 0 ? currentLevel : 1;
      
      try {
        // Get current grid dimensions based on window size
        const currentDimensions = getGridDimensions();
        const gridWidth = currentDimensions.width;
        const gridHeight = currentDimensions.height;
        
        // Generate challenge and grid for the current level
        const challenge = await Promise.resolve(topicProvider.generateChallenge(gameLevel));
        const grid = await Promise.resolve(topicProvider.generateGrid(gridWidth, gridHeight, challenge));
        
        console.log("Generated game content:", { 
          challenge: challenge?.description, 
          gridSize: `${gridWidth}x${gridHeight}`, 
          gridLength: grid.length,
          hasChallenge: !!challenge
        });
        
        set((state) => ({
          gamePhase: "playing",
          currentChallenge: challenge,
          grid,
          player: { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2), moveX: 0, moveY: 0, isMoving: false },
          enemies: [],
          level: gameLevel,
          // Preserve score and lives when continuing to next level
          score: state.score > 0 ? state.score : 0,
          lives: state.lives > 0 ? state.lives : 3,
          timeRemaining: 60 + (gameLevel * 10) // More time for higher levels
        }));
      } catch (error) {
        console.error('Failed to generate game content:', error);
        
        // Show error message to user
        if (selectedTopic === 'custom') {
          toast.error('Failed to generate custom board. Please try a different topic or check your spelling.');
        } else {
          toast.error('Failed to start game. Please try again.');
        }
        
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
      
      set({
        score: 0,
        lives: 3,
        level: 1, // Always start at level 1 when restarting
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
      
      // Debug logging for answer validation
      console.log("Munching cell:", {
        cellValue: cell.value,
        isCorrect: cell.isCorrect,
        challenge: currentChallenge?.description,
        answerCheckResult: currentChallenge?.checkAnswer(cell.value)
      });
      
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
      const { level, grid } = get();
      const numEnemies = Math.min(1 + Math.floor(level / 3), 4);
      const enemies: Enemy[] = [];
      
      console.log("Spawning enemies:", { level, numEnemies, gridSize: `${grid[0]?.length}x${grid.length}` });
      
      // Get actual grid dimensions from current grid
      const gridWidth = grid[0]?.length || 8;
      const gridHeight = grid.length || 6;
      
      // Generate spawn positions based on actual grid size
      const dynamicSpawnPositions = [
        { x: 0, y: 0 },
        { x: gridWidth - 1, y: 0 },
        { x: 0, y: gridHeight - 1 },
        { x: gridWidth - 1, y: gridHeight - 1 },
        { x: Math.floor(gridWidth / 2), y: 0 },
        { x: Math.floor(gridWidth / 2), y: gridHeight - 1 },
        { x: 0, y: Math.floor(gridHeight / 2) },
        { x: gridWidth - 1, y: Math.floor(gridHeight / 2) }
      ];
      
      for (let i = 0; i < numEnemies; i++) {
        const spawnPos = dynamicSpawnPositions[i % dynamicSpawnPositions.length];
        const enemyType = level > 5 ? (i % 2 === 0 ? 'fast' : 'smart') : 'basic';
        
        enemies.push({
          id: `enemy-${i}`,
          x: spawnPos.x,
          y: spawnPos.y,
          targetX: spawnPos.x,
          targetY: spawnPos.y,
          speed: enemyType === 'fast' ? 1.5 : enemyType === 'smart' ? 1.2 : 1.0,
          type: enemyType,
          lastMoveTime: 0,
          isMoving: false
        });
      }
      
      console.log("Created enemies:", enemies);
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
