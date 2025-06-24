import { Player, Enemy, GridCell, Challenge } from "./stores/useGameState";
import { useAudio } from "./stores/useAudio";

// Simple keyboard state tracking
const keyState: { [key: string]: boolean } = {};

// Setup keyboard listeners
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    keyState[e.code] = true;
  });
  
  window.addEventListener('keyup', (e) => {
    keyState[e.code] = false;
  });
}

interface GameLogicParams {
  delta: number;
  player: Player;
  enemies: Enemy[];
  grid: GridCell[][];
  currentChallenge: Challenge | null;
  updatePlayer: (player: Partial<Player>) => void;
  updateEnemies: (enemies: Enemy[]) => void;
  updateGrid: (grid: GridCell[][]) => void;
  processPlayerMove: (newX: number, newY: number) => void;
  gameOver: () => void;
}

let lastMoveTime = 0;
const MOVE_COOLDOWN = 200; // milliseconds between moves

export function updateGameLogic({
  delta,
  player,
  enemies,
  grid,
  currentChallenge,
  updatePlayer,
  updateEnemies,
  updateGrid,
  processPlayerMove,
  gameOver
}: GameLogicParams) {
  const currentTime = Date.now();
  
  // Handle player input with simple keyboard tracking
  if (currentTime - lastMoveTime > MOVE_COOLDOWN) {
    let newX = player.x;
    let newY = player.y;
    let moved = false;
    
    // Check for movement keys
    if ((keyState['ArrowUp'] || keyState['KeyW']) && !moved) {
      newY = Math.max(0, player.y - 1);
      moved = true;
    } else if ((keyState['ArrowDown'] || keyState['KeyS']) && !moved) {
      newY = Math.min(grid.length - 1, player.y + 1);
      moved = true;
    } else if ((keyState['ArrowLeft'] || keyState['KeyA']) && !moved) {
      newX = Math.max(0, player.x - 1);
      moved = true;
    } else if ((keyState['ArrowRight'] || keyState['KeyD']) && !moved) {
      newX = Math.min(grid[0]?.length - 1 || 0, player.x + 1);
      moved = true;
    }
    
    if (moved && (newX !== player.x || newY !== player.y)) {
      processPlayerMove(newX, newY);
      lastMoveTime = currentTime;
      console.log(`Player moved to: ${newX}, ${newY}`);
    }
  }
  
  // Update enemy AI
  const updatedEnemies = enemies.map(enemy => updateEnemyAI(enemy, player, delta, grid));
  
  // Check for collisions between player and enemies
  const collision = updatedEnemies.some(enemy => 
    Math.abs(enemy.x - player.x) < 0.5 && Math.abs(enemy.y - player.y) < 0.5
  );
  
  if (collision) {
    // Player hit by enemy - trigger game over
    console.log("Player hit by enemy!");
    const { playHit } = useAudio.getState();
    playHit();
    gameOver();
    return; // Stop processing further game logic
  }
  
  updateEnemies(updatedEnemies);
}

function updateEnemyAI(enemy: Enemy, player: Player, delta: number, grid: GridCell[][]): Enemy {
  const wasAtTarget = (enemy.x === enemy.targetX && enemy.y === enemy.targetY);
  const GRID_WIDTH = grid[0]?.length || 9;
  const GRID_HEIGHT = grid.length || 7;
  
  // Different AI behaviors based on enemy type
  let updatedEnemy: Enemy;
  switch (enemy.type) {
    case 'smart':
      updatedEnemy = updateSmartEnemyAI(enemy, player, delta, GRID_WIDTH, GRID_HEIGHT);
      break;
    case 'fast':
      updatedEnemy = updateFastEnemyAI(enemy, player, delta, GRID_WIDTH, GRID_HEIGHT);
      break;
    default:
      updatedEnemy = updateBasicEnemyAI(enemy, player, delta, GRID_WIDTH, GRID_HEIGHT);
      break;
  }
  
  // Play sound when enemy starts moving to a new target
  const isStartingNewMove = wasAtTarget && (updatedEnemy.targetX !== enemy.x || updatedEnemy.targetY !== enemy.y);
  if (isStartingNewMove) {
    const { playEnemyMove } = useAudio.getState();
    playEnemyMove();
  }
  
  return updatedEnemy;
}

function updateBasicEnemyAI(enemy: Enemy, player: Player, delta: number, gridWidth: number, gridHeight: number): Enemy {
  const moveSpeed = enemy.speed * delta * 1.5; // Slower, more controlled movement
  
  // Move towards player with some randomness
  let targetX = enemy.targetX;
  let targetY = enemy.targetY;
  
  // Update target occasionally (every ~1-3 seconds)
  if (Math.random() < delta * 0.3) {
    if (Math.random() < 0.8) {
      // 80% chance to move towards player
      targetX = player.x;
      targetY = player.y;
    } else {
      // 20% chance to move randomly
      targetX = Math.floor(Math.random() * gridWidth);
      targetY = Math.floor(Math.random() * gridHeight);
    }
  }
  
  // Move towards target with grid-based movement
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0.2) {
    let newX = enemy.x;
    let newY = enemy.y;
    
    // Grid-based movement - move in primary direction first
    if (Math.abs(dx) > Math.abs(dy)) {
      newX = enemy.x + (dx > 0 ? moveSpeed : -moveSpeed);
    } else {
      newY = enemy.y + (dy > 0 ? moveSpeed : -moveSpeed);
    }
    
    // Keep within bounds and snap to grid positions
    const clampedX = Math.max(0, Math.min(gridWidth - 1, newX));
    const clampedY = Math.max(0, Math.min(gridHeight - 1, newY));
    
    return {
      ...enemy,
      x: clampedX,
      y: clampedY,
      targetX,
      targetY
    };
  }
  
  return { ...enemy, targetX, targetY };
}

function updateFastEnemyAI(enemy: Enemy, player: Player, delta: number, gridWidth: number, gridHeight: number): Enemy {
  // Fast enemies move directly towards player with higher speed
  const moveSpeed = enemy.speed * delta * 2.0;
  
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0.15) {
    let newX = enemy.x;
    let newY = enemy.y;
    
    // Move in larger steps but still grid-aligned
    if (Math.abs(dx) > Math.abs(dy)) {
      newX = enemy.x + (dx > 0 ? moveSpeed * 1.5 : -moveSpeed * 1.5);
    } else {
      newY = enemy.y + (dy > 0 ? moveSpeed * 1.5 : -moveSpeed * 1.5);
    }
    
    const clampedX = Math.max(0, Math.min(gridWidth - 1, newX));
    const clampedY = Math.max(0, Math.min(gridHeight - 1, newY));
    
    return {
      ...enemy,
      x: clampedX,
      y: clampedY,
      targetX: player.x,
      targetY: player.y
    };
  }
  
  return enemy;
}

function updateSmartEnemyAI(enemy: Enemy, player: Player, delta: number, gridWidth: number, gridHeight: number): Enemy {
  // Smart enemies try to predict player movement and cut them off
  const moveSpeed = enemy.speed * delta * 1.8;
  
  // Predict where player might move (simple prediction)
  let predictedX = player.x;
  let predictedY = player.y;
  
  // Add some prediction based on player's recent movement
  if (player.isMoving) {
    predictedX += player.moveX * 1.5;
    predictedY += player.moveY * 1.5;
  }
  
  // Clamp prediction to grid bounds
  predictedX = Math.max(0, Math.min(gridWidth - 1, predictedX));
  predictedY = Math.max(0, Math.min(gridHeight - 1, predictedY));
  
  const dx = predictedX - enemy.x;
  const dy = predictedY - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0.2) {
    let newX = enemy.x;
    let newY = enemy.y;
    
    // Smart movement - try to intercept
    if (Math.abs(dx) > Math.abs(dy)) {
      newX = enemy.x + (dx > 0 ? moveSpeed : -moveSpeed);
    } else {
      newY = enemy.y + (dy > 0 ? moveSpeed : -moveSpeed);
    }
    
    const clampedX = Math.max(0, Math.min(gridWidth - 1, newX));
    const clampedY = Math.max(0, Math.min(gridHeight - 1, newY));
    
    return {
      ...enemy,
      x: clampedX,
      y: clampedY,
      targetX: predictedX,
      targetY: predictedY
    };
  }
  
  return enemy;
}
