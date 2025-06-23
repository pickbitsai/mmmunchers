import { useEffect, useRef } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { updateGameLogic } from "../lib/gameLogic";
import OnscreenControls from "./OnscreenControls";

export default function GameBoard2D() {
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  const {
    gamePhase,
    grid,
    player,
    enemies,
    currentChallenge,
    updatePlayer,
    updateEnemies,
    updateGrid,
    processPlayerMove,
    spawnEnemies,
    gameOver
  } = useGameState();

  // Initialize enemies when game starts
  useEffect(() => {
    if (gamePhase === 'playing' && enemies.length === 0) {
      spawnEnemies();
    }
  }, [gamePhase, enemies.length, spawnEnemies]);

  // Game loop
  useEffect(() => {
    const gameLoop = (currentTime: number) => {
      if (gamePhase !== 'playing') {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const delta = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (delta < 0.1) { // Cap delta to prevent large jumps
        updateGameLogic({
          delta,
          player,
          enemies,
          grid,
          currentChallenge,
          updatePlayer,
          updateEnemies,
          updateGrid,
          processPlayerMove
        });
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gamePhase === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gamePhase, player, enemies, grid, currentChallenge, updatePlayer, updateEnemies, updateGrid, processPlayerMove]);

  if (!grid.length || !currentChallenge) return null;

  const cellSize = 60;
  const gridWidth = grid[0]?.length || 9;
  const gridHeight = grid.length || 7;
  const boardWidth = gridWidth * cellSize;
  const boardHeight = gridHeight * cellSize;

  const handleMunch = () => {
    const currentCell = grid[player.y]?.[player.x];
    if (!currentCell || currentCell.isEmpty || currentCell.isMunched) {
      return; // Nothing to munch
    }

    // Check if the answer is correct
    if (currentCell.isCorrect) {
      // Correct answer - mark as munched and award points
      const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (rowIndex === player.y && colIndex === player.x) {
            return { ...cell, isMunched: true };
          }
          return cell;
        })
      );
      updateGrid(newGrid);
      // Add score or other positive feedback here
    } else {
      // Wrong answer - game over
      gameOver();
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleMunchAction = () => {
      const currentCell = grid[player.y]?.[player.x];
      if (!currentCell || currentCell.isEmpty || currentCell.isMunched) {
        return; // Nothing to munch
      }

      // Check if the answer is correct
      if (currentCell.isCorrect) {
        // Correct answer - mark as munched and award points
        const newGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (rowIndex === player.y && colIndex === player.x) {
              return { ...cell, isMunched: true };
            }
            return cell;
          })
        );
        updateGrid(newGrid);
      } else {
        // Wrong answer - game over
        gameOver();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (gamePhase !== 'playing') return;

      let newX = player.x;
      let newY = player.y;

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          newY = Math.max(0, player.y - 1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          newY = Math.min(gridHeight - 1, player.y + 1);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          newX = Math.max(0, player.x - 1);
          break;
        case 'ArrowRight':
        case 'KeyD':
          newX = Math.min(gridWidth - 1, player.x + 1);
          break;
        case 'Space':
        case 'Enter':
          event.preventDefault();
          handleMunchAction();
          return;
        default:
          return;
      }

      event.preventDefault();
      if (newX !== player.x || newY !== player.y) {
        updatePlayer({ x: newX, y: newY });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, player.x, player.y, gridWidth, gridHeight, updatePlayer, gameOver, updateGrid, grid]);

  const handleOnscreenMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    let newX = player.x;
    let newY = player.y;
    
    switch (direction) {
      case 'up':
        newY = Math.max(0, player.y - 1);
        break;
      case 'down':
        newY = Math.min(gridHeight - 1, player.y + 1);
        break;
      case 'left':
        newX = Math.max(0, player.x - 1);
        break;
      case 'right':
        newX = Math.min(gridWidth - 1, player.x + 1);
        break;
    }
    
    // Allow movement to any square (don't check if it's empty or correct)
    if (newX !== player.x || newY !== player.y) {
      updatePlayer({ x: newX, y: newY });
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center">
        <div 
          className="relative bg-green-800 border-4 border-green-600 rounded-lg shadow-2xl"
          style={{ 
            width: boardWidth + 40, 
            height: boardHeight + 40,
            padding: '20px'
          }}
        >
          {/* Grid cells */}
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`absolute border-2 flex items-center justify-center text-lg font-bold ${
                cell.isEmpty || cell.isMunched 
                  ? 'border-green-700 bg-green-900/20' 
                  : cell.isCorrect 
                  ? 'border-blue-400 bg-blue-500/80 text-white shadow-lg' 
                  : 'border-gray-400 bg-gray-200 text-gray-800'
              }`}
              style={{
                left: colIndex * cellSize,
                top: rowIndex * cellSize,
                width: cellSize - 2,
                height: cellSize - 2,
                transition: 'all 0.2s ease'
              }}
            >
              {!cell.isEmpty && !cell.isMunched && cell.value}
            </div>
          ))
        )}

        {/* Player */}
        <div
          className="absolute bg-green-400 border-3 border-green-200 rounded-lg flex items-center justify-center text-2xl shadow-lg transition-all duration-200 z-10"
          style={{
            left: player.x * cellSize + 4,
            top: player.y * cellSize + 4,
            width: cellSize - 8,
            height: cellSize - 8,
          }}
        >
          🎮
        </div>

        {/* Enemies */}
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`absolute border-3 rounded-lg flex items-center justify-center text-xl shadow-lg transition-all duration-100 z-10 ${
              enemy.type === 'fast' 
                ? 'bg-orange-500 border-orange-300' 
                : enemy.type === 'smart'
                ? 'bg-purple-500 border-purple-300'
                : 'bg-red-500 border-red-300'
            }`}
            style={{
              left: enemy.x * cellSize + 6,
              top: enemy.y * cellSize + 6,
              width: cellSize - 12,
              height: cellSize - 12,
            }}
          >
            👾
          </div>
        ))}

        {/* Grid overlay for visual clarity */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`
          }}
        />
        </div>
      </div>
      
      {/* Onscreen Controls - positioned outside game board */}
      <OnscreenControls onMove={handleOnscreenMove} onMunch={handleMunch} />
    </>
  );
}