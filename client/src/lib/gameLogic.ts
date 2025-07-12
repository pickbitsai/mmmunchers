import { Player, Enemy, GridCell, Challenge } from "./stores/useGameState";
import { useAudio } from "./stores/useAudio";

// Keyboard handling moved to GameBoard component to prevent conflicts

interface GameLogicParams {
  delta: number;
  player: Player;
  enemies: Enemy[];
  grid: GridCell[][];
  currentChallenge: Challenge | null;
  level: number;
  updatePlayer: (player: Partial<Player>) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateGrid: (grid: GridCell[][]) => void;
  processPlayerMove: (newX: number, newY: number) => void;
  munchCurrentCell: () => void;
  gameOver: () => void;
}

let lastMoveTime = 0;
let lastMunchTime = 0;
const MOVE_COOLDOWN = 200; // milliseconds between moves
const MUNCH_COOLDOWN = 300; // milliseconds between munches

export function updateGameLogic({
  delta,
  player,
  enemies,
  grid,
  currentChallenge,
  level,
  updatePlayer,
  updateEnemies,
  updateGrid,
  processPlayerMove,
  munchCurrentCell,
  gameOver
}: GameLogicParams) {
  const currentTime = Date.now();
  
  // Player input is handled by GameBoard component, not here
  // This prevents conflicts between two keyboard handlers
  
  // Update enemy AI with level-based timing
  const currentLevel = level || 1;
  const updatedEnemies = enemies.map(enemy => updateEnemyAI(enemy, player, delta, grid, currentLevel));
  
  // Check for collisions between player and enemies
  const collision = updatedEnemies.some(enemy => 
    Math.abs(enemy.x - player.x) < 0.5 && Math.abs(enemy.y - player.y) < 0.5
  );
  
  if (collision) {
    // Player hit by enemy - trigger game over
    const { playHit } = useAudio.getState();
    playHit();
    gameOver();
    return; // Stop processing further game logic
  }
  
  updateEnemies(updatedEnemies);
}

function updateEnemyAI(enemy: Enemy, player: Player, delta: number, grid: GridCell[][], level: number): Enemy {
  const currentTime = Date.now();
  const GRID_WIDTH = grid[0]?.length || 9;
  const GRID_HEIGHT = grid.length || 7;
  
  // Calculate move interval based on level (2 seconds base, decreasing by 0.1s per level, min 0.5s)
  const baseMoveInterval = 2000; // 2 seconds
  const currentLevel = level || 1;
  const levelSpeedIncrease = Math.min(currentLevel - 1, 15) * 100; // Max 1.5s reduction
  const moveInterval = Math.max(500, baseMoveInterval - levelSpeedIncrease); // Minimum 0.5s
  
  // Check if enough time has passed since last move
  const canMove = currentTime - enemy.lastMoveTime >= moveInterval;
  
  if (!canMove) {
    return enemy; // Not time to move yet
  }
  
  // Different AI behaviors based on enemy type
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
  
  // Play sound when enemy moves
  if (updatedEnemy.x !== enemy.x || updatedEnemy.y !== enemy.y) {
    const { playEnemyMove } = useAudio.getState();
    playEnemyMove();
  }
  
  return updatedEnemy;
}

function updateBasicEnemyAI(enemy: Enemy, player: Player, gridWidth: number, gridHeight: number, currentTime: number): Enemy {
  // Choose movement direction with some randomness
  let newX = enemy.x;
  let newY = enemy.y;
  
  // 70% chance to move towards player, 30% chance to move randomly
  if (Math.random() < 0.7) {
    // Move towards player - choose one direction only
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Move horizontally
      newX = enemy.x + (dx > 0 ? 1 : -1);
    } else if (Math.abs(dy) > 0) {
      // Move vertically
      newY = enemy.y + (dy > 0 ? 1 : -1);
    }
  } else {
    // Random movement - pick a direction
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 }   // right
    ];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    newX = enemy.x + randomDir.x;
    newY = enemy.y + randomDir.y;
  }
  
  // Keep within bounds
  newX = Math.max(0, Math.min(gridWidth - 1, newX));
  newY = Math.max(0, Math.min(gridHeight - 1, newY));
  
  return {
    ...enemy,
    x: newX,
    y: newY,
    targetX: newX,
    targetY: newY,
    lastMoveTime: currentTime,
    isMoving: true
  };
}

function updateFastEnemyAI(enemy: Enemy, player: Player, gridWidth: number, gridHeight: number, currentTime: number): Enemy {
  // Fast enemies move directly towards player (no randomness)
  let newX = enemy.x;
  let newY = enemy.y;
  
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  
  // Always move towards player - choose primary direction
  if (Math.abs(dx) > Math.abs(dy)) {
    // Move horizontally
    newX = enemy.x + (dx > 0 ? 1 : -1);
  } else if (Math.abs(dy) > 0) {
    // Move vertically
    newY = enemy.y + (dy > 0 ? 1 : -1);
  }
  
  // Keep within bounds
  newX = Math.max(0, Math.min(gridWidth - 1, newX));
  newY = Math.max(0, Math.min(gridHeight - 1, newY));
  
  return {
    ...enemy,
    x: newX,
    y: newY,
    targetX: player.x,
    targetY: player.y,
    lastMoveTime: currentTime,
    isMoving: true
  };
}

function updateSmartEnemyAI(enemy: Enemy, player: Player, gridWidth: number, gridHeight: number, currentTime: number): Enemy {
  // Smart enemies try to predict player movement and cut them off
  let predictedX = player.x;
  let predictedY = player.y;
  
  // Add some prediction based on player's recent movement
  if (player.isMoving) {
    predictedX += player.moveX * 2; // Predict 2 steps ahead
    predictedY += player.moveY * 2;
  }
  
  // Clamp prediction to grid bounds
  predictedX = Math.max(0, Math.min(gridWidth - 1, predictedX));
  predictedY = Math.max(0, Math.min(gridHeight - 1, predictedY));
  
  let newX = enemy.x;
  let newY = enemy.y;
  
  const dx = predictedX - enemy.x;
  const dy = predictedY - enemy.y;
  
  // Smart movement - try to intercept
  if (Math.abs(dx) > Math.abs(dy)) {
    // Move horizontally towards predicted position
    newX = enemy.x + (dx > 0 ? 1 : -1);
  } else if (Math.abs(dy) > 0) {
    // Move vertically towards predicted position
    newY = enemy.y + (dy > 0 ? 1 : -1);
  }
  
  // Keep within bounds
  newX = Math.max(0, Math.min(gridWidth - 1, newX));
  newY = Math.max(0, Math.min(gridHeight - 1, newY));
  
  return {
    ...enemy,
    x: newX,
    y: newY,
    targetX: predictedX,
    targetY: predictedY,
    lastMoveTime: currentTime,
    isMoving: true
  };
}
