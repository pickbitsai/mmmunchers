import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { TopicProvider, GridCell } from "../topics/TopicProvider";
import { MathTopic } from "../topics/MathTopic";
import { WordTopic } from "../topics/WordTopic";
import { MarvelTopic } from "../topics/MarvelTopic";
import { MovieTopic } from "../topics/MovieTopic";
import { ScienceTopic } from "../topics/ScienceTopic";
import { HistoryTopic } from "../topics/HistoryTopic";
import { GeographyTopic } from "../topics/GeographyTopic";
import { AnimalsTopic } from "../topics/AnimalsTopic";
import { DinosaurTopic } from "../topics/DinosaurTopic";
import { MusicTopic } from "../topics/MusicTopic";
import { SurfingTopic } from "../topics/SurfingTopic";
import { useAudio } from "./useAudio";

export type { GridCell };
export type GamePhase = "main_menu" | "mode_selection" | "topic_selection" | "playing" | "paused" | "game_over" | "level_complete";
export type GameMode = "classic" | "time_attack" | "trog_attack" | "zen" | "streak";
export type RenderMode = "2d" | "3d";

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
  gameMode: GameMode;
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
  streak: number;
  bestStreak: number;

  // Actions
  initializeGame: () => void;
  setGameMode: (mode: GameMode) => void;
  selectTopic: (topicId: string | null) => void;
  startGame: () => Promise<void>;
  restartGame: () => void;
  togglePause: () => void;
  gameOver: () => void;
  toggleRenderMode: () => void;
  goToMainMenu: () => void;
  goToModeSelection: () => void;
  goToTopicSelection: () => void;

  // Game mechanics
  updatePlayer: (player: Partial<Player>) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateGrid: (grid: GridCell[][]) => void;
  processPlayerMove: (newX: number, newY: number) => void;
  munchCurrentCell: () => void;
  spawnEnemies: () => void;
  nextLevel: () => void;
  addScore: (points: number) => void;
  addTime: (seconds: number) => void;
  tickTimer: (delta: number) => void;
  loseLife: () => void;
}

// Responsive grid sizes
const getGridDimensions = () => {
  const currentWidth = window.innerWidth;
  if (currentWidth < 640) return { width: 5, height: 4 };
  if (currentWidth < 768) return { width: 6, height: 5 };
  if (currentWidth < 1024) return { width: 7, height: 5 };
  return { width: 8, height: 6 };
};

const TOPIC_MAP: Record<string, () => TopicProvider> = {
  math: () => new MathTopic(),
  words: () => new WordTopic(),
  marvel: () => new MarvelTopic(),
  movies: () => new MovieTopic(),
  science: () => new ScienceTopic(),
  history: () => new HistoryTopic(),
  geography: () => new GeographyTopic(),
  animals: () => new AnimalsTopic(),
  dinosaurs: () => new DinosaurTopic(),
  music: () => new MusicTopic(),
  surfing: () => new SurfingTopic(),
};

// Mode-specific settings
function getModeSettings(mode: GameMode, level: number) {
  switch (mode) {
    case 'classic':
      return { lives: 3, maxLives: 5, time: 60 + (level * 10), hasEnemies: true, hasTimer: true };
    case 'time_attack':
      return { lives: 1, maxLives: 1, time: 30, hasEnemies: false, hasTimer: true };
    case 'trog_attack':
      return { lives: 5, maxLives: 7, time: 0, hasEnemies: true, hasTimer: false };
    case 'zen':
      return { lives: 99, maxLives: 99, time: 0, hasEnemies: false, hasTimer: false };
    case 'streak':
      return { lives: 1, maxLives: 1, time: 0, hasEnemies: false, hasTimer: false };
  }
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gamePhase: "main_menu",
    gameMode: "classic",
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
    streak: 0,
    bestStreak: 0,

    initializeGame: () => {
      set({
        gamePhase: "main_menu",
        gameMode: "classic",
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
        streak: 0,
        bestStreak: 0
      });
    },

    goToMainMenu: () => {
      set({
        gamePhase: "main_menu",
        selectedTopic: null,
        topicProvider: null,
        enemies: [],
        grid: [],
        currentChallenge: null,
        score: 0,
        lives: 3,
        level: 1,
        streak: 0,
        bestStreak: 0
      });
    },

    goToModeSelection: () => {
      set({ gamePhase: "mode_selection" });
    },

    goToTopicSelection: () => {
      set({ gamePhase: "topic_selection" });
    },

    setGameMode: (mode: GameMode) => {
      set({ gameMode: mode, gamePhase: "topic_selection" });
    },

    selectTopic: (topicId: string | null) => {
      if (!topicId) {
        set({
          gamePhase: "main_menu",
          selectedTopic: null,
          topicProvider: null
        });
        return;
      }

      const factory = TOPIC_MAP[topicId];
      if (!factory) return;

      const provider = factory();

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
      const { topicProvider, level: currentLevel, gameMode } = get();
      if (!topicProvider) return;

      const gameLevel = currentLevel > 0 ? currentLevel : 1;
      const settings = getModeSettings(gameMode, gameLevel);

      try {
        const { width: gridWidth, height: gridHeight } = getGridDimensions();

        const challenge = await Promise.resolve(topicProvider.generateChallenge(gameLevel));
        const grid = await Promise.resolve(topicProvider.generateGrid(gridWidth, gridHeight, challenge));

        set((state) => ({
          gamePhase: "playing",
          currentChallenge: challenge,
          grid,
          player: { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2), moveX: 0, moveY: 0, isMoving: false },
          enemies: [],
          level: gameLevel,
          score: state.score > 0 ? state.score : 0,
          lives: state.lives > 0 && state.level > 1 ? state.lives : settings.lives,
          timeRemaining: settings.time,
          streak: gameMode === 'streak' && state.level > 1 ? state.streak : 0
        }));
      } catch {
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
        level: 1,
        enemies: [],
        timeRemaining: 0,
        streak: 0,
        bestStreak: 0
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
      set((state) => ({
        gamePhase: "game_over",
        enemies: [],
        bestStreak: Math.max(state.bestStreak, state.streak)
      }));
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

      const gridWidth = grid[0]?.length || 0;
      const gridHeight = grid.length || 0;

      if (newX < 0 || newX >= gridWidth || newY < 0 || newY >= gridHeight) {
        return;
      }

      const { playMove } = useAudio.getState();
      playMove();

      get().updatePlayer({ x: newX, y: newY });
    },

    munchCurrentCell: () => {
      const { grid, player, currentChallenge, gameMode } = get();
      const cell = grid[player.y][player.x];

      if (cell.isEmpty || cell.isMunched) return;

      if (currentChallenge?.checkAnswer(cell.value)) {
        const { playMunch } = useAudio.getState();
        playMunch();

        const newGrid = [...grid];
        newGrid[player.y][player.x] = { ...cell, isMunched: true };

        // Mode-specific scoring
        let scoreBonus = 10 * get().level;
        const newStreak = get().streak + 1;

        if (gameMode === 'streak') {
          scoreBonus = 10 * newStreak; // Score scales with streak
        } else if (gameMode === 'time_attack') {
          scoreBonus = 20 * get().level; // Double points in time attack
        }

        set((state) => ({
          grid: newGrid,
          score: state.score + scoreBonus,
          streak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak)
        }));

        // Time Attack: add bonus time
        if (gameMode === 'time_attack') {
          get().addTime(5);
        }

        // Check level completion
        const remainingCorrect = newGrid.flat().some(c => c.isCorrect && !c.isMunched);
        if (!remainingCorrect) {
          get().nextLevel();
        }
      } else {
        // Wrong answer
        const { playHit } = useAudio.getState();
        playHit();

        if (gameMode === 'streak') {
          // Streak mode: wrong answer ends game immediately
          set((state) => ({
            bestStreak: Math.max(state.bestStreak, state.streak)
          }));
          get().gameOver();
          return;
        }

        if (gameMode === 'time_attack') {
          // Time Attack: lose 3 seconds
          set((state) => ({
            timeRemaining: Math.max(0, state.timeRemaining - 3),
            streak: 0
          }));
          if (get().timeRemaining <= 0) {
            get().gameOver();
          }
          return;
        }

        // Classic / Trog: lose a life
        set((state) => ({
          lives: state.lives - 1,
          streak: 0
        }));

        if (get().lives <= 0) {
          get().gameOver();
        }
      }
    },

    spawnEnemies: () => {
      const { level, grid, gameMode } = get();
      const settings = getModeSettings(gameMode, level);
      if (!settings.hasEnemies) return;

      // Trog Attack spawns more enemies
      const baseCount = gameMode === 'trog_attack'
        ? 2 + Math.floor(level / 2)
        : 1 + Math.floor(level / 3);
      const numEnemies = Math.min(baseCount, gameMode === 'trog_attack' ? 6 : 4);
      const enemies: Enemy[] = [];

      const gridWidth = grid[0]?.length || 8;
      const gridHeight = grid.length || 6;

      const spawnPositions = [
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
        const spawnPos = spawnPositions[i % spawnPositions.length];
        let enemyType: 'basic' | 'fast' | 'smart';

        if (gameMode === 'trog_attack') {
          // Trog Attack: more aggressive enemy mix
          enemyType = level > 3 ? (i % 3 === 0 ? 'smart' : i % 3 === 1 ? 'fast' : 'basic') : (i % 2 === 0 ? 'fast' : 'basic');
        } else {
          enemyType = level > 5 ? (i % 2 === 0 ? 'fast' : 'smart') : 'basic';
        }

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

      set({ enemies });
    },

    nextLevel: () => {
      const { playSuccess } = useAudio.getState();
      playSuccess();

      const { gameMode } = get();
      const settings = getModeSettings(gameMode, get().level + 1);

      set((state) => ({
        level: state.level + 1,
        lives: Math.min(state.lives + 1, settings.maxLives),
        score: state.score + 100 * state.level,
        gamePhase: "level_complete" as GamePhase
      }));

      setTimeout(() => {
        get().startGame();
        get().spawnEnemies();
      }, 1500);
    },

    addScore: (points: number) => {
      set((state) => ({
        score: state.score + points
      }));
    },

    addTime: (seconds: number) => {
      set((state) => ({
        timeRemaining: state.timeRemaining + seconds
      }));
    },

    tickTimer: (delta: number) => {
      const { gameMode, gamePhase, timeRemaining } = get();
      const settings = getModeSettings(gameMode, get().level);

      if (!settings.hasTimer || gamePhase !== 'playing' || timeRemaining <= 0) return;

      const newTime = timeRemaining - delta;
      if (newTime <= 0) {
        set({ timeRemaining: 0 });
        get().gameOver();
      } else {
        set({ timeRemaining: newTime });
      }
    },

    loseLife: () => {
      set((state) => ({
        lives: state.lives - 1,
        streak: 0
      }));

      if (get().lives <= 0) {
        get().gameOver();
      } else {
        // Respawn player to center after losing a life
        const { grid } = get();
        const gridWidth = grid[0]?.length || 8;
        const gridHeight = grid.length || 6;
        set({
          player: { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2), moveX: 0, moveY: 0, isMoving: false }
        });
      }
    }
  }))
);
