import { useKeyboardControls } from "@react-three/drei";
import { Player, Enemy, GridCell, Challenge } from "./stores/useGameState";
import { useAudio } from "./stores/useAudio";

enum Controls {
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right',
  select = 'select',
  pause = 'pause'
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
  processPlayerMove
}: GameLogicParams) {
  const currentTime = Date.now();
  
  // Handle player input
  const [, getControls] = useKeyboardControls<Controls>();
  const controls = getControls();
  
  // Player movement with cooldown
  if (currentTime - lastMoveTime > MOVE_COOLDOWN) {
    let newX = player.x;
    let newY = player.y;
    let moved = false;
    
    if (controls.up && !moved) {
      newY = Math.max(0, player.y - 1);
      moved = true;
    } else if (controls.down && !moved) {
      newY = Math.min(grid.length - 1, player.y + 1);
      moved = true;
    } else if (controls.left && !moved) {
      newX = Math.max(0, player.x - 1);
      moved = true;
    } else if (controls.right && !moved) {
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
    // Player hit by enemy - this should be handled by the game state
    console.log("Player hit by enemy!");
    const { playHit } = useAudio.getState();
    playHit();
  }
  
  updateEnemies(updatedEnemies);
}

function updateEnemyAI(enemy: Enemy, player: Player, delta: number, grid: GridCell[][]): Enemy {
  const GRID_WIDTH = grid[0]?.length || 9;
  const GRID_HEIGHT = grid.length || 7;
  
  // Different AI behaviors based on enemy type
  switch (enemy.type) {
    case 'smart':
      return updateSmartEnemyAI(enemy, player, delta, GRID_WIDTH, GRID_HEIGHT);
    case 'fast':
      return updateFastEnemyAI(enemy, player, delta, GRID_WIDTH, GRID_HEIGHT);
    default:
      return updateBasicEnemyAI(enemy, player, delta, GRID_WIDTH, GRID_HEIGHT);
  }
}

function updateBasicEnemyAI(enemy: Enemy, player: Player, delta: number, gridWidth: number, gridHeight: number): Enemy {
  const moveSpeed = enemy.speed * delta * 2; // Scale movement speed
  
  // Move towards player with some randomness
  let targetX = enemy.targetX;
  let targetY = enemy.targetY;
  
  // Update target occasionally (every ~2 seconds)
  if (Math.random() < delta * 0.5) {
    if (Math.random() < 0.7) {
      // 70% chance to move towards player
      targetX = player.x;
      targetY = player.y;
    } else {
      // 30% chance to move randomly
      targetX = Math.floor(Math.random() * gridWidth);
      targetY = Math.floor(Math.random() * gridHeight);
    }
  }
  
  // Move towards target
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0.1) {
    const newX = enemy.x + (dx / distance) * moveSpeed;
    const newY = enemy.y + (dy / distance) * moveSpeed;
    
    // Keep within bounds
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
  const moveSpeed = enemy.speed * delta * 2.5;
  
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0.1) {
    const newX = enemy.x + (dx / distance) * moveSpeed;
    const newY = enemy.y + (dy / distance) * moveSpeed;
    
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
  const moveSpeed = enemy.speed * delta * 2.2;
  
  // Predict where player might move (simple prediction)
  let predictedX = player.x;
  let predictedY = player.y;
  
  // Add some prediction based on player's recent movement
  if (player.isMoving) {
    predictedX += player.moveX * 2;
    predictedY += player.moveY * 2;
  }
  
  // Clamp prediction to grid bounds
  predictedX = Math.max(0, Math.min(gridWidth - 1, predictedX));
  predictedY = Math.max(0, Math.min(gridHeight - 1, predictedY));
  
  const dx = predictedX - enemy.x;
  const dy = predictedY - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 0.1) {
    const newX = enemy.x + (dx / distance) * moveSpeed;
    const newY = enemy.y + (dy / distance) * moveSpeed;
    
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
