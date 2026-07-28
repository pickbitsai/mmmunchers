import { useEffect, useRef, useState, useCallback } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { updateGameLogic } from "../lib/gameLogic";
import OnscreenControls from "./OnscreenControls";

const BOARD_INSET = 20;

const NEON_TILE_PALETTE = [
  { surface: "#116ca9", top: "#168dd1", accent: "#1ac8ff", glow: "rgba(26, 200, 255, 0.55)" },
  { surface: "#62359a", top: "#814fc2", accent: "#c28aff", glow: "rgba(194, 138, 255, 0.5)" },
  { surface: "#bd6815", top: "#dc8b20", accent: "#ffb52e", glow: "rgba(255, 181, 46, 0.52)" },
  { surface: "#3f842d", top: "#59a83a", accent: "#9be94c", glow: "rgba(155, 233, 76, 0.48)" },
] as const;

function getNeonTilePalette(rowIndex: number, colIndex: number) {
  return NEON_TILE_PALETTE[Math.abs(colIndex * 3 + rowIndex * 5) % NEON_TILE_PALETTE.length];
}

function getCellFontSize(text: string, baseFontSize: number, cellSize: number): string {
  const charCount = text.length;
  const words = text.split(' ');
  const longestWord = Math.max(...words.map(w => w.length));

  // Scale font so the longest word fits on one line within the cell
  // Approximate: each char at baseFontSize is ~0.6em wide
  const maxCharsPerLine = Math.floor((cellSize - 12) / (baseFontSize * 0.6));

  if (longestWord > maxCharsPerLine) {
    // Shrink so the longest word fits in one line
    const needed = (cellSize - 12) / (longestWord * 0.6);
    return `${Math.max(needed, 8)}px`;
  }

  if (charCount <= 6) return `${baseFontSize}px`;
  if (charCount <= 10) return `${baseFontSize * 0.85}px`;
  if (charCount <= 14) return `${baseFontSize * 0.7}px`;
  if (charCount <= 20) return `${baseFontSize * 0.6}px`;
  return `${baseFontSize * 0.5}px`;
}

// Splash particle effect on munch
function SplashEffect({ x, y, cellSize }: { x: number; y: number; cellSize: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const cx = BOARD_INSET + x * cellSize + cellSize / 2;
  const cy = BOARD_INSET + y * cellSize + cellSize / 2;

  return (
    <>
      {/* Neon pixel burst */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = cellSize * 0.4;
        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: cx - 4,
              top: cy - 4,
              width: 8,
              height: 8,
              background: i % 2 === 0 ? '#1ac8ff' : '#ff2fba',
              boxShadow: `0 0 8px ${i % 2 === 0 ? '#1ac8ff' : '#ff2fba'}`,
              animation: `splash-particle 0.6s ease-out forwards`,
              '--splash-x': `${Math.cos(angle) * dist}px`,
              '--splash-y': `${Math.sin(angle) * dist}px`,
              animationDelay: `${i * 0.02}s`,
              opacity: 0.9,
            } as React.CSSProperties}
          />
        );
      })}
      {/* Energy ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx - cellSize * 0.3,
          top: cy - cellSize * 0.3,
          width: cellSize * 0.6,
          height: cellSize * 0.6,
          border: '2px solid #8ae6ff',
          boxShadow: '0 0 12px rgba(26, 200, 255, 0.85)',
          animation: 'splash-ripple 0.6s ease-out forwards',
        }}
      />
    </>
  );
}

export default function GameBoard2D() {
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const isMovingRef = useRef<boolean>(false);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [splashes, setSplashes] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const splashIdRef = useRef(0);

  const {
    gamePhase,
    gameMode,
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
    loseLife,
    tickTimer,
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
          gameMode,
          updatePlayer,
          updateEnemies,
          updateGrid,
          processPlayerMove,
          munchCurrentCell,
          gameOver,
          loseLife,
          tickTimer
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
  }, [gamePhase, player, enemies, grid, currentChallenge, level, gameMode, updatePlayer, updateEnemies, updateGrid, processPlayerMove, munchCurrentCell, gameOver, loseLife, tickTimer]);

  // Trigger splash at a position
  const triggerSplash = useCallback((x: number, y: number) => {
    const id = splashIdRef.current++;
    setSplashes(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setSplashes(prev => prev.filter(s => s.id !== id));
    }, 700);
  }, []);

  if (!grid.length || !currentChallenge) return null;

  // Calculate responsive cell size
  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width < 1024;

  // Use different grid sizes for mobile
  const gridWidth = grid[0]?.length || 9;
  const gridHeight = grid.length || 7;

  // Calculate optimal cell size based on available space
  const maxBoardWidth = dimensions.width - (isMobile ? 20 : 80);
  const maxBoardHeight = dimensions.height - (isMobile ? 180 : 240);

  const cellSizeByWidth = Math.floor(maxBoardWidth / gridWidth);
  const cellSizeByHeight = Math.floor(maxBoardHeight / gridHeight);
  const cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, isMobile ? 100 : 140);

  const boardWidth = gridWidth * cellSize;
  const boardHeight = gridHeight * cellSize;

  // Calculate font size based on cell size
  const baseFontSize = Math.max(cellSize * 0.22, 12);
  const fontSize = baseFontSize;

  const handleMunch = () => {
    const cell = grid[player.y]?.[player.x];
    if (cell && !cell.isEmpty && !cell.isMunched) {
      triggerSplash(player.x, player.y);
    }
    munchCurrentCell();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (gamePhase !== 'playing') return;

    let newX = player.x;
    let newY = player.y;
    let shouldMove = false;
    let shouldMunch = false;

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

    if (shouldMove && (newX !== player.x || newY !== player.y)) {
      if (isMovingRef.current || now - lastMoveTimeRef.current < 200) {
        return;
      }

      isMovingRef.current = true;
      lastMoveTimeRef.current = now;
      updatePlayer({ x: newX, y: newY });

      setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    }

    if (shouldMunch) {
      handleMunch();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, player.x, player.y, gridWidth, gridHeight, updatePlayer, gameOver, updateGrid, grid]);

  const handleOnscreenMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    playMove();

    const now = Date.now();

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

    if (newX !== player.x || newY !== player.y) {
      isMovingRef.current = true;
      lastMoveTimeRef.current = now;
      updatePlayer({ x: newX, y: newY });

      setTimeout(() => {
        isMovingRef.current = false;
      }, 150);
    }
  };

  // Character size
  const charSize = Math.max(cellSize * 0.55, 24);
  const charFontSize = Math.max(cellSize * 0.28, 12);

  return (
    <>
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes neon-board-pulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,47,186,0.35), 0 0 24px rgba(26,200,255,0.28), inset 0 0 34px rgba(26,200,255,0.1); }
          50% { box-shadow: 0 0 0 1px rgba(26,200,255,0.5), 0 0 34px rgba(255,47,186,0.3), inset 0 0 44px rgba(255,47,186,0.1); }
        }
        @keyframes tile-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        @keyframes splash-particle {
          0% { transform: translate(0, 0) scale(1); opacity: 0.9; }
          100% { transform: translate(var(--splash-x), var(--splash-y)) scale(0.3); opacity: 0; }
        }
        @keyframes splash-ripple {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes player-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes enemy-wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        @keyframes grid-drift {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 32px 32px, 32px 32px; }
        }
      `}</style>

      <div className="fixed inset-0 flex items-center justify-center pb-32">
        {/* Neon arcade playfield */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: boardWidth + 40,
            height: boardHeight + 40,
            border: '2px solid #1ac8ff',
            boxShadow: '0 0 0 1px rgba(255,47,186,0.35), 0 0 28px rgba(26,200,255,0.3), inset 0 0 38px rgba(26,200,255,0.1)',
            background: `
              linear-gradient(rgba(26,200,255,0.075) 1px, transparent 1px),
              linear-gradient(90deg, rgba(26,200,255,0.075) 1px, transparent 1px),
              radial-gradient(circle at 50% 38%, #0b1d3a 0%, #050a1a 60%, #02040c 100%)
            `,
            backgroundSize: '32px 32px, 32px 32px, auto',
            animation: 'neon-board-pulse 5s ease-in-out infinite',
          }}
        >
          {/* Slow technical-grid drift */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,47,186,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,47,186,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px',
              animation: 'grid-drift 8s linear infinite',
              maskImage: 'radial-gradient(circle at center, black 20%, transparent 85%)',
            }}
          />

          {/* Grid cells - raised neon answer pads */}
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const inactive = cell.isEmpty || cell.isMunched;
              const palette = getNeonTilePalette(rowIndex, colIndex);
              const bobDelay = ((rowIndex * gridWidth + colIndex) * 0.15) % 2;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="absolute flex items-center justify-center font-bold"
                  style={{
                    left: BOARD_INSET + colIndex * cellSize + 4,
                    top: BOARD_INSET + rowIndex * cellSize + 4,
                    width: cellSize - 8,
                    height: cellSize - 8,
                    borderRadius: '10px',
                    fontSize: `${fontSize}px`,
                    padding: '4px',
                    lineHeight: 1.2,
                    transition: 'all 0.3s ease',
                    ...(inactive
                      ? {
                          background: 'linear-gradient(145deg, rgba(5,11,24,0.94), rgba(10,23,44,0.82))',
                          border: '1px solid rgba(26,200,255,0.16)',
                          boxShadow: 'inset 0 0 16px rgba(26,200,255,0.06)',
                        }
                      : {
                          background: `linear-gradient(
                            145deg,
                            ${palette.top} 0%,
                            ${palette.surface} 48%,
                            #08142b 125%
                          )`,
                          border: `2px solid ${palette.accent}`,
                          boxShadow: `
                            inset 0 1px 0 rgba(255,255,255,0.46),
                            inset 0 -8px 16px rgba(2,4,12,0.46),
                            0 0 14px ${palette.glow},
                            0 5px 0 #020611,
                            0 8px 12px rgba(0,0,0,0.42)
                          `,
                          animation: `tile-float ${2.1 + bobDelay * 0.35}s ease-in-out ${bobDelay}s infinite`,
                        }),
                  }}
                >
                  {/* Glossy inset panel */}
                  {!inactive && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        inset: '7%',
                        borderRadius: '7px',
                        border: '1px solid rgba(255,255,255,0.24)',
                        background: 'linear-gradient(155deg, rgba(255,255,255,0.2), transparent 40%)',
                      }}
                    />
                  )}
                </div>
              );
            })
          )}

          {/* Splash effects */}
          {splashes.map(splash => (
            <SplashEffect key={splash.id} x={splash.x} y={splash.y} cellSize={cellSize} />
          ))}

          {/* Glimmer - 2D counterpart to the Meshy-authored 3D hero */}
          <div
            className="absolute flex items-center justify-center transition-all duration-150 pointer-events-none"
            style={{
              left: BOARD_INSET + player.x * cellSize + (cellSize - charSize) / 2,
              top: BOARD_INSET + player.y * cellSize + (cellSize - charSize) / 2,
              width: charSize,
              height: charSize,
              zIndex: 20,
              animation: 'player-bounce 1.2s ease-in-out infinite',
              filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35)) drop-shadow(0 0 10px rgba(132,204,22,0.55))',
            }}
          >
            <img
              src="/characters/glimmer-2d.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="h-full w-full select-none object-contain"
            />
          </div>

          {/* Approved Trog cutout, with a small type-colored arena marker. */}
          {enemies.map((enemy) => {
            const accent = enemy.type === 'fast'
              ? '#ffb52e'
              : enemy.type === 'smart'
              ? '#c28aff'
              : '#1ac8ff';
            const enemyWidth = charSize * 1.22;

            return (
              <div
                key={enemy.id}
                className="absolute flex items-center justify-center transition-all pointer-events-none"
                style={{
                  left: BOARD_INSET + enemy.x * cellSize + (cellSize - enemyWidth) / 2,
                  top: BOARD_INSET + enemy.y * cellSize + (cellSize - charSize) / 2,
                  width: enemyWidth,
                  height: charSize,
                  zIndex: 15,
                  transitionDuration: enemy.type === 'fast' ? '75ms' : '150ms',
                  animation: `enemy-wobble ${enemy.type === 'fast' ? '0.6' : '1'}s ease-in-out infinite`,
                  filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.45)) drop-shadow(0 0 8px ${accent}88)`,
                }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    left: '13%',
                    right: '13%',
                    bottom: '5%',
                    height: '20%',
                    border: `2px solid ${accent}`,
                    boxShadow: `0 0 10px ${accent}`,
                    opacity: 0.72,
                  }}
                />
                <img
                  src="/characters/trog-2d.png"
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="relative h-full w-full select-none object-contain"
                />
                {enemy.type === 'fast' && (
                  <div
                    className="absolute -right-1 top-1/2 -translate-y-1/2 font-black"
                    style={{ color: accent, fontSize: `${charSize * 0.24}px`, textShadow: `0 0 4px ${accent}` }}
                  >
                    {"»"}
                  </div>
                )}
                {enemy.type === 'smart' && (
                  <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2"
                    style={{ color: accent, fontSize: `${charSize * 0.2}px`, textShadow: `0 0 4px ${accent}` }}
                  >
                    {"✦"}
                  </div>
                )}
              </div>
            );
          })}

          {/* Answer text, rendered above characters so standing on a tile never hides its clue */}
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              if (cell.isEmpty || cell.isMunched) return null;
              const palette = getNeonTilePalette(rowIndex, colIndex);

              return (
                <div
                  key={`text-${rowIndex}-${colIndex}`}
                  className="absolute flex items-center justify-center pointer-events-none"
                  style={{
                    left: BOARD_INSET + colIndex * cellSize + 4,
                    top: BOARD_INSET + rowIndex * cellSize + 4,
                    width: cellSize - 8,
                    height: cellSize - 8,
                    zIndex: 25,
                    padding: '4px',
                  }}
                >
                  <span
                    className="text-center flex items-center justify-center"
                    style={{
                      fontSize: getCellFontSize(cell.value, fontSize, cellSize),
                      overflowWrap: 'break-word',
                      lineHeight: 1.15,
                      padding: '2px',
                      width: `${cellSize - 16}px`,
                      maxHeight: `${cellSize - 16}px`,
                      overflow: 'hidden',
                      textAlign: 'center',
                      color: '#ffffff',
                      textShadow: `0 0 4px #ffffff, 0 0 10px ${palette.accent}, 0 2px 2px rgba(0,0,0,0.8)`,
                      fontWeight: 800,
                    }}
                  >
                    {cell.value}
                  </span>
                </div>
              );
            })
          )}
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
