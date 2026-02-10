import { useEffect, useRef, useState } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { updateGameLogic } from "../lib/gameLogic";
import OnscreenControls from "./OnscreenControls";

function getCellFontSize(text: string, baseFontSize: number): string {
  const charCount = text.length;
  if (charCount <= 8) return `${baseFontSize}px`;
  if (charCount <= 12) return `${baseFontSize * 0.75}px`;
  if (charCount <= 16) return `${baseFontSize * 0.65}px`;
  return `${baseFontSize * 0.55}px`;
}

function formatCellText(text: string): string {
  const words = text.split(' ');

  if (words.length === 1 && text.length > 12) {
    const breakPoints: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '-' || text[i] === '_' ||
          (i > 0 && text[i].match(/[A-Z]/) && text[i-1].match(/[a-z]/))) {
        breakPoints.push(i);
      }
    }
    if (breakPoints.length > 0) {
      const midPoint = breakPoints[Math.floor(breakPoints.length / 2)];
      return text.substring(0, midPoint + 1) + '\n' + text.substring(midPoint + 1);
    }
    if (text.length > 16) {
      const midPoint = Math.floor(text.length / 2);
      return text.substring(0, midPoint) + '\n' + text.substring(midPoint);
    }
  }

  if (words.length > 1) {
    const groupedWords: string[] = [];
    let currentGroup = '';
    for (const word of words) {
      const testGroup = currentGroup ? `${currentGroup} ${word}` : word;
      if (testGroup.length > 8 && currentGroup.length > 0) {
        groupedWords.push(currentGroup);
        currentGroup = word;
      } else {
        currentGroup = testGroup;
      }
    }
    if (currentGroup) groupedWords.push(currentGroup);
    return groupedWords.join('\n');
  }

  return text;
}

export default function GameBoard2D() {
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const isMovingRef = useRef<boolean>(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const {
    gamePhase,
    grid,
    player,
    enemies,
    currentChallenge,
    level,
    updatePlayer,
    updateEnemies,
    updateGrid,
    processPlayerMove,
    munchCurrentCell,
    spawnEnemies,
    gameOver,
    nextLevel,
    addScore
  } = useGameState();
  
  const { playMove, playMunch } = useAudio();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          level,
          updatePlayer,
          updateEnemies,
          updateGrid,
          processPlayerMove,
          munchCurrentCell,
          gameOver
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
  }, [gamePhase, player, enemies, grid, currentChallenge, level, updatePlayer, updateEnemies, updateGrid, processPlayerMove, munchCurrentCell, gameOver]);

  if (!grid.length || !currentChallenge) return null;

  // Calculate responsive cell size
  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width < 1024;
  
  // Use different grid sizes for mobile
  const gridWidth = grid[0]?.length || 9;
  const gridHeight = grid.length || 7;
  
  // Calculate optimal cell size based on available space
  const maxBoardWidth = dimensions.width - (isMobile ? 20 : 80); // Less padding for bigger tiles
  const maxBoardHeight = dimensions.height - (isMobile ? 180 : 240); // Less space reserved
  
  const cellSizeByWidth = Math.floor(maxBoardWidth / gridWidth);
  const cellSizeByHeight = Math.floor(maxBoardHeight / gridHeight);
  const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, isMobile ? 100 : 140); // Much larger max size
  
  const boardWidth = gridWidth * cellSize;
  const boardHeight = gridHeight * cellSize;
  
  // Calculate font size based on cell size - more conservative for better fit
  const baseFontSize = Math.max(cellSize * 0.22, 12); // Slightly smaller base
  const fontSize = baseFontSize;
  const isCellTooSmall = cellSize < 50;

  const handleMunch = () => {
    // Use the store's munchCurrentCell function which has the correct logic
    munchCurrentCell();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (gamePhase !== 'playing') return;

    let newX = player.x;
    let newY = player.y;
    let shouldMove = false;
    let shouldMunch = false;

    // Play sounds immediately on key press before any logic
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        event.preventDefault();
        playMove();
        newY = Math.max(0, player.y - 1);
        shouldMove = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        event.preventDefault();
        playMove();
        newY = Math.min(gridHeight - 1, player.y + 1);
        shouldMove = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        event.preventDefault();
        playMove();
        newX = Math.max(0, player.x - 1);
        shouldMove = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        event.preventDefault();
        playMove();
        newX = Math.min(gridWidth - 1, player.x + 1);
        shouldMove = true;
        break;
      case 'Space':
      case 'Enter':
        event.preventDefault();
        playMunch();
        shouldMunch = true;
        break;
      default:
        return;
    }

    const now = Date.now();
    
    // Handle movement logic after sound
    if (shouldMove && (newX !== player.x || newY !== player.y)) {
      // Prevent rapid-fire movements (debounce to 200ms)
      if (isMovingRef.current || now - lastMoveTimeRef.current < 200) {
        return;
      }
      
      isMovingRef.current = true;
      lastMoveTimeRef.current = now;
      updatePlayer({ x: newX, y: newY });
      
      // Reset movement flag after animation completes
      setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    }
    
    // Handle munch logic after sound
    if (shouldMunch) {
      handleMunch();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, player.x, player.y, gridWidth, gridHeight, updatePlayer, gameOver, updateGrid, grid]);

  const handleOnscreenMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Play sound immediately on touch/click
    playMove();
    
    const now = Date.now();
    
    // Prevent rapid-fire movements (debounce to 200ms)
    if (isMovingRef.current || now - lastMoveTimeRef.current < 200) {
      return;
    }
    
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
      isMovingRef.current = true;
      lastMoveTimeRef.current = now;
      updatePlayer({ x: newX, y: newY });
      
      // Reset movement flag after animation completes
      setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center pb-32">
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
              className={`absolute border-2 flex items-center justify-center font-semibold rounded-md ${
                cell.isEmpty || cell.isMunched 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-blue-100 border-blue-500 hover:bg-blue-200 shadow-md'
              } transition-all duration-200 ${
                cell.isMunched ? 'opacity-50' : ''
              }`}
              style={{
                left: colIndex * cellSize + 2,
                top: rowIndex * cellSize + 2,
                width: cellSize - 6,
                height: cellSize - 6,
                fontSize: `${fontSize}px`,
                padding: '4px',
                lineHeight: 1.2
              }}
            >
              {!cell.isEmpty && !cell.isMunched && (
                <span
                  className="text-center block w-full h-full flex items-center justify-center"
                  style={{
                    fontSize: getCellFontSize(cell.value, fontSize),
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    lineHeight: 1.1,
                    padding: '2px',
                    maxWidth: `${cellSize - 8}px`,
                    maxHeight: `${cellSize - 8}px`,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  {formatCellText(cell.value)}
                </span>
              )}
            </div>
          ))
        )}
        
        {/* Player */}
        <div
          className="absolute bg-blue-500 rounded-full border-2 border-blue-700 flex items-center justify-center text-white font-bold transition-all duration-150"
          style={{
            left: player.x * cellSize + cellSize / 4,
            top: player.y * cellSize + cellSize / 4,
            width: cellSize / 2,
            height: cellSize / 2,
            fontSize: `${cellSize / 3}px`
          }}
        >
          M
        </div>
        
        {/* Enemies */}
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`absolute rounded-full border-2 flex items-center justify-center text-white font-bold transition-all ${
              enemy.type === 'fast' 
                ? 'bg-orange-500 border-orange-700' 
                : enemy.type === 'smart'
                ? 'bg-purple-500 border-purple-700'
                : 'bg-red-500 border-red-700'
            }`}
            style={{
              left: enemy.x * cellSize + cellSize / 4,
              top: enemy.y * cellSize + cellSize / 4,
              width: cellSize / 2,
              height: cellSize / 2,
              fontSize: `${cellSize / 3}px`,
              transitionDuration: enemy.type === 'fast' ? '75ms' : '150ms'
            }}
          >
            {enemy.type === 'fast' ? 'F' : enemy.type === 'smart' ? 'S' : 'E'}
          </div>
        ))}
        </div>
      </div>
      
      {/* Mobile controls */}
      {isMobile && (
        <OnscreenControls 
          onMove={handleOnscreenMove}
          onMunch={handleMunch}
        />
      )}
    </>
  );
}