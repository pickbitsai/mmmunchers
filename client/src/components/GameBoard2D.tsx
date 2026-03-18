import { useEffect, useRef, useState, useCallback } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { updateGameLogic } from "../lib/gameLogic";
import OnscreenControls from "./OnscreenControls";

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

  const cx = x * cellSize + cellSize / 2;
  const cy = y * cellSize + cellSize / 2;

  return (
    <>
      {/* Water splash droplets */}
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
              background: i % 2 === 0 ? '#88ddff' : '#ffffff',
              animation: `splash-particle 0.6s ease-out forwards`,
              '--splash-x': `${Math.cos(angle) * dist}px`,
              '--splash-y': `${Math.sin(angle) * dist}px`,
              animationDelay: `${i * 0.02}s`,
              opacity: 0.9,
            } as React.CSSProperties}
          />
        );
      })}
      {/* Ripple ring */}
      <div
        className="absolute rounded-full pointer-events-none border-2 border-sky-300"
        style={{
          left: cx - cellSize * 0.3,
          top: cy - cellSize * 0.3,
          width: cellSize * 0.6,
          height: cellSize * 0.6,
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
        @keyframes ocean-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes tile-bob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(0.3deg); }
          75% { transform: translateY(1px) rotate(-0.2deg); }
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
        @keyframes wave-line {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }
      `}</style>

      <div className="fixed inset-0 flex items-center justify-center pb-32">
        {/* Board container with beach theme */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            width: boardWidth + 40,
            height: boardHeight + 40,
            padding: '20px',
            /* Sandy border frame */
            border: '6px solid #c4956a',
            boxShadow: '0 0 0 3px #a0784c, 0 8px 32px rgba(0,0,0,0.3), inset 0 0 20px rgba(0,119,190,0.15)',
            /* Ocean water background */
            background: 'linear-gradient(135deg, #0077be 0%, #00a4cc 25%, #0088aa 50%, #006699 75%, #0077be 100%)',
            backgroundSize: '300% 300%',
            animation: 'ocean-shimmer 8s ease-in-out infinite',
          }}
        >
          {/* Animated wave overlay lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 18px,
                rgba(255,255,255,0.4) 18px,
                rgba(255,255,255,0.4) 20px
              )`,
              animation: 'wave-line 3s linear infinite',
            }}
          />

          {/* Grid cells - wooden plank tiles */}
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isWater = cell.isEmpty || cell.isMunched;
              // Stagger bob animation per tile
              const bobDelay = ((rowIndex * gridWidth + colIndex) * 0.15) % 2;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="absolute flex items-center justify-center font-bold"
                  style={{
                    left: colIndex * cellSize + 3,
                    top: rowIndex * cellSize + 3,
                    width: cellSize - 8,
                    height: cellSize - 8,
                    borderRadius: isWater ? '4px' : '8px',
                    fontSize: `${fontSize}px`,
                    padding: '4px',
                    lineHeight: 1.2,
                    transition: 'all 0.3s ease',
                    ...(isWater
                      ? {
                          /* Water gap - transparent to show ocean */
                          background: 'rgba(0, 100, 160, 0.3)',
                          border: '1px solid rgba(100, 200, 255, 0.15)',
                        }
                      : {
                          /* Wooden plank tile */
                          background: `linear-gradient(
                            180deg,
                            #e8c98e 0%,
                            #deb887 20%,
                            #d4a76a 40%,
                            #deb887 60%,
                            #c4956a 80%,
                            #deb887 100%
                          )`,
                          border: '2px solid #a0784c',
                          boxShadow: `
                            inset 0 1px 0 rgba(255,255,255,0.3),
                            inset 0 -2px 4px rgba(0,0,0,0.1),
                            0 3px 8px rgba(0,0,0,0.25),
                            0 1px 2px rgba(0,0,0,0.15)
                          `,
                          animation: `tile-bob ${2 + bobDelay * 0.5}s ease-in-out ${bobDelay}s infinite`,
                        }),
                  }}
                >
                  {/* Wood grain lines */}
                  {!isWater && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(0deg, transparent 0%, transparent 30%, rgba(139,90,43,0.3) 30%, rgba(139,90,43,0.3) 31%, transparent 31%, transparent 65%, rgba(139,90,43,0.25) 65%, rgba(139,90,43,0.25) 66%, transparent 66%)
                        `,
                        borderRadius: '6px',
                      }}
                    />
                  )}

                  {/* Cell text */}
                  {!cell.isEmpty && !cell.isMunched && (
                    <span
                      className="text-center flex items-center justify-center relative z-10"
                      style={{
                        fontSize: getCellFontSize(cell.value, fontSize, cellSize),
                        overflowWrap: 'break-word',
                        lineHeight: 1.15,
                        padding: '2px',
                        width: `${cellSize - 16}px`,
                        maxHeight: `${cellSize - 16}px`,
                        overflow: 'hidden',
                        textAlign: 'center',
                        color: '#2c1810',
                        textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                        fontWeight: 700,
                      }}
                    >
                      {cell.value}
                    </span>
                  )}
                </div>
              );
            })
          )}

          {/* Splash effects */}
          {splashes.map(splash => (
            <SplashEffect key={splash.id} x={splash.x} y={splash.y} cellSize={cellSize} />
          ))}

          {/* Player - beach muncher character */}
          <div
            className="absolute flex items-center justify-center transition-all duration-150 pointer-events-none"
            style={{
              left: player.x * cellSize + (cellSize - charSize) / 2,
              top: player.y * cellSize + (cellSize - charSize) / 2,
              width: charSize,
              height: charSize,
              zIndex: 20,
              animation: 'player-bounce 1.5s ease-in-out infinite',
              filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))',
            }}
          >
            {/* Player body */}
            <div
              className="relative w-full h-full rounded-full"
              style={{
                background: 'linear-gradient(145deg, #4fc3f7 0%, #0288d1 50%, #01579b 100%)',
                border: '3px solid #01579b',
                boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)',
              }}
            >
              {/* Eyes */}
              <div className="absolute flex gap-1" style={{ top: '22%', left: '50%', transform: 'translateX(-50%)' }}>
                <div className="rounded-full bg-white" style={{ width: charSize * 0.2, height: charSize * 0.22 }}>
                  <div className="rounded-full bg-gray-900" style={{ width: charSize * 0.1, height: charSize * 0.1, margin: '20% auto 0' }} />
                </div>
                <div className="rounded-full bg-white" style={{ width: charSize * 0.2, height: charSize * 0.22 }}>
                  <div className="rounded-full bg-gray-900" style={{ width: charSize * 0.1, height: charSize * 0.1, margin: '20% auto 0' }} />
                </div>
              </div>
              {/* Mouth - wide open muncher mouth */}
              <div
                className="absolute rounded-b-full"
                style={{
                  bottom: '15%',
                  left: '25%',
                  width: '50%',
                  height: '30%',
                  background: '#b71c1c',
                  border: '2px solid #880e0e',
                  borderTop: 'none',
                  borderTopLeftRadius: '2px',
                  borderTopRightRadius: '2px',
                }}
              >
                {/* Teeth */}
                <div className="absolute top-0 left-[15%] w-[20%] bg-white" style={{ height: '30%', borderRadius: '0 0 2px 2px' }} />
                <div className="absolute top-0 right-[15%] w-[20%] bg-white" style={{ height: '30%', borderRadius: '0 0 2px 2px' }} />
              </div>
            </div>
          </div>

          {/* Enemies - troll characters */}
          {enemies.map((enemy) => {
            const colors = enemy.type === 'fast'
              ? { body: '#FF6B35', border: '#cc4400', eye: '#FF0000' }
              : enemy.type === 'smart'
              ? { body: '#9C27B0', border: '#6a0080', eye: '#FF0000' }
              : { body: '#c62828', border: '#8e0000', eye: '#FF0000' };

            return (
              <div
                key={enemy.id}
                className="absolute flex items-center justify-center transition-all pointer-events-none"
                style={{
                  left: enemy.x * cellSize + (cellSize - charSize) / 2,
                  top: enemy.y * cellSize + (cellSize - charSize) / 2,
                  width: charSize,
                  height: charSize,
                  zIndex: 15,
                  transitionDuration: enemy.type === 'fast' ? '75ms' : '150ms',
                  animation: `enemy-wobble ${enemy.type === 'fast' ? '0.6' : '1'}s ease-in-out infinite`,
                  filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))',
                }}
              >
                {/* Enemy body */}
                <div
                  className="relative w-full h-full"
                  style={{
                    background: `linear-gradient(145deg, ${colors.body} 0%, ${colors.border} 100%)`,
                    border: `3px solid ${colors.border}`,
                    borderRadius: '40% 40% 50% 50%',
                    boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.2)',
                  }}
                >
                  {/* Horns */}
                  <div className="absolute" style={{
                    top: '-20%', left: '12%',
                    width: 0, height: 0,
                    borderLeft: `${charSize * 0.08}px solid transparent`,
                    borderRight: `${charSize * 0.08}px solid transparent`,
                    borderBottom: `${charSize * 0.22}px solid #FFD700`,
                    transform: 'rotate(-15deg)',
                  }} />
                  <div className="absolute" style={{
                    top: '-20%', right: '12%',
                    width: 0, height: 0,
                    borderLeft: `${charSize * 0.08}px solid transparent`,
                    borderRight: `${charSize * 0.08}px solid transparent`,
                    borderBottom: `${charSize * 0.22}px solid #FFD700`,
                    transform: 'rotate(15deg)',
                  }} />
                  {/* Eyes - angry with red glow */}
                  <div className="absolute flex gap-1" style={{ top: '28%', left: '50%', transform: 'translateX(-50%)' }}>
                    <div className="rounded-full" style={{
                      width: charSize * 0.18, height: charSize * 0.18,
                      background: `radial-gradient(circle, ${colors.eye} 40%, #880000 100%)`,
                      boxShadow: `0 0 ${charSize * 0.06}px ${colors.eye}`,
                    }} />
                    <div className="rounded-full" style={{
                      width: charSize * 0.18, height: charSize * 0.18,
                      background: `radial-gradient(circle, ${colors.eye} 40%, #880000 100%)`,
                      boxShadow: `0 0 ${charSize * 0.06}px ${colors.eye}`,
                    }} />
                  </div>
                  {/* Angry eyebrows */}
                  <div className="absolute" style={{
                    top: '22%', left: '18%', width: '25%', height: '3px',
                    background: '#000', transform: 'rotate(15deg)', borderRadius: '2px',
                  }} />
                  <div className="absolute" style={{
                    top: '22%', right: '18%', width: '25%', height: '3px',
                    background: '#000', transform: 'rotate(-15deg)', borderRadius: '2px',
                  }} />
                  {/* Mouth with teeth */}
                  <div className="absolute" style={{
                    bottom: '20%', left: '25%', width: '50%', height: '20%',
                    background: '#000', borderRadius: '2px 2px 8px 8px',
                  }}>
                    <div className="absolute top-0 left-[10%] bg-white" style={{
                      width: '20%', height: '45%',
                      clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                    }} />
                    <div className="absolute top-0 right-[10%] bg-white" style={{
                      width: '20%', height: '45%',
                      clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                    }} />
                  </div>
                  {/* Type indicator */}
                  {enemy.type === 'fast' && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 text-yellow-300" style={{ fontSize: `${charSize * 0.25}px` }}>
                      {">>"}
                    </div>
                  )}
                  {enemy.type === 'smart' && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-yellow-300" style={{ fontSize: `${charSize * 0.2}px` }}>
                      {"*"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
