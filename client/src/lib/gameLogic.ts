import { Player, Enemy, GridCell, Challenge, GameMode } from "./stores/useGameState";
import { useAudio } from "./stores/useAudio";

interface GameLogicParams {
  delta: number;
  player: Player;
  enemies: Enemy[];
  grid: GridCell[][];
  currentChallenge: Challenge | null;
  level: number;
  gameMode: GameMode;
  updatePlayer: (player: Partial<Player>) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateGrid: (grid: GridCell[][]) => void;
  processPlayerMove: (newX: number, newY: number) => void;
  munchCurrentCell: () => void;
  gameOver: () => void;
  loseLife: () => void;
  tickTimer: (delta: number) => void;
}

export function updateGameLogic({
  delta,
  player,
  enemies,
  grid,
  level,
  gameMode,
  updateEnemies,
  gameOver,
  loseLife,
  tickTimer
}: GameLogicParams) {
  // Tick the timer
  tickTimer(delta);

  // Skip enemy logic for modes without enemies
  if (gameMode === 'zen' || gameMode === 'streak' || gameMode === 'time_attack') {
    return;
  }

  // Update enemy AI
  const currentLevel = level || 1;
  const updatedEnemies = enemies.map(enemy => updateEnemyAI(enemy, player, delta, grid, currentLevel, gameMode));

  // Check for collisions
  const collision = updatedEnemies.some(enemy =>
    Math.abs(enemy.x - player.x) < 0.5 && Math.abs(enemy.y - player.y) < 0.5
  );

  if (collision) {
    const { playHit } = useAudio.getState();
    playHit();
    loseLife();
    return;
  }

  updateEnemies(updatedEnemies);
}

function updateEnemyAI(enemy: Enemy, player: Player, delta: number, grid: GridCell[][], level: number, gameMode: GameMode): Enemy {
  const currentTime = Date.now();
  const GRID_WIDTH = grid[0]?.length || 9;
  const GRID_HEIGHT = grid.length || 7;

  // Trog Attack: faster base interval
  const baseMoveInterval = gameMode === 'trog_attack' ? 1500 : 2000;
  const currentLevel = level || 1;
  const levelSpeedIncrease = Math.min(currentLevel - 1, 15) * 100;
  const moveInterval = Math.max(gameMode === 'trog_attack' ? 300 : 500, baseMoveInterval - levelSpeedIncrease);

  const canMove = currentTime - enemy.lastMoveTime >= moveInterval;
  if (!canMove) return enemy;

  let updatedEnemy: Enemy;
  switch (enemy.type) {
    case 'smart':
      updatedEnemy = updateSmartEnemyAI(enemy, player, GRID_WIDTH, GRID_HEIGHT, currentTime);
      break;
    case 'fast':
      updatedEnemy = updateFastEnemyAI(enemy, player, GRID_WIDTH, GRID_HEIGHT, currentTime);
      break;
    default:
      updatedEnemy = updateBasicEnemyAI(enemy, player, GRID_WIDTH, GRID_HEIGHT, currentTime);
      break;
  }

  if (updatedEnemy.x !== enemy.x || updatedEnemy.y !== enemy.y) {
    const { playEnemyMove } = useAudio.getState();
    playEnemyMove();
  }

  return updatedEnemy;
}

function updateBasicEnemyAI(enemy: Enemy, player: Player, gridWidth: number, gridHeight: number, currentTime: number): Enemy {
  let newX = enemy.x;
  let newY = enemy.y;

  if (Math.random() < 0.7) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      newX = enemy.x + (dx > 0 ? 1 : -1);
    } else if (Math.abs(dy) > 0) {
      newY = enemy.y + (dy > 0 ? 1 : -1);
    }
  } else {
    const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    newX = enemy.x + randomDir.x;
    newY = enemy.y + randomDir.y;
  }

  newX = Math.max(0, Math.min(gridWidth - 1, newX));
  newY = Math.max(0, Math.min(gridHeight - 1, newY));

  return { ...enemy, x: newX, y: newY, targetX: newX, targetY: newY, lastMoveTime: currentTime, isMoving: true };
}

function updateFastEnemyAI(enemy: Enemy, player: Player, gridWidth: number, gridHeight: number, currentTime: number): Enemy {
  let newX = enemy.x;
  let newY = enemy.y;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    newX = enemy.x + (dx > 0 ? 1 : -1);
  } else if (Math.abs(dy) > 0) {
    newY = enemy.y + (dy > 0 ? 1 : -1);
  }

  newX = Math.max(0, Math.min(gridWidth - 1, newX));
  newY = Math.max(0, Math.min(gridHeight - 1, newY));

  return { ...enemy, x: newX, y: newY, targetX: player.x, targetY: player.y, lastMoveTime: currentTime, isMoving: true };
}

function updateSmartEnemyAI(enemy: Enemy, player: Player, gridWidth: number, gridHeight: number, currentTime: number): Enemy {
  let predictedX = player.x;
  let predictedY = player.y;

  if (player.isMoving) {
    predictedX += player.moveX * 2;
    predictedY += player.moveY * 2;
  }

  predictedX = Math.max(0, Math.min(gridWidth - 1, predictedX));
  predictedY = Math.max(0, Math.min(gridHeight - 1, predictedY));

  let newX = enemy.x;
  let newY = enemy.y;

  const dx = predictedX - enemy.x;
  const dy = predictedY - enemy.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    newX = enemy.x + (dx > 0 ? 1 : -1);
  } else if (Math.abs(dy) > 0) {
    newY = enemy.y + (dy > 0 ? 1 : -1);
  }

  newX = Math.max(0, Math.min(gridWidth - 1, newX));
  newY = Math.max(0, Math.min(gridHeight - 1, newY));

  return { ...enemy, x: newX, y: newY, targetX: predictedX, targetY: predictedY, lastMoveTime: currentTime, isMoving: true };
}
