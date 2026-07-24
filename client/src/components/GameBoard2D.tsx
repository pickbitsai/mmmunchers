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

          {/* Player - green blob muncher (2026) */}
          <div
            className="absolute flex items-center justify-center transition-all duration-150 pointer-events-none"
            style={{
              left: player.x * cellSize + (cellSize - charSize) / 2,
              top: player.y * cellSize + (cellSize - charSize) / 2,
              width: charSize,
              height: charSize,
              zIndex: 20,
              animation: 'player-bounce 1.2s ease-in-out infinite',
              filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35)) drop-shadow(0 0 10px rgba(132,204,22,0.55))',
            }}
          >
            {/* Antennae */}
            {[-1, 1].map((s) => (
              <div
                key={s}
                className="absolute"
                style={{
                  top: '-14%',
                  left: '50%',
                  width: charSize * 0.05,
                  height: charSize * 0.22,
                  background: '#4a7c0f',
                  borderRadius: '3px',
                  transform: `translateX(-50%) translateX(${s * charSize * 0.13}px) rotate(${s * 22}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    position: 'absolute',
                    top: `-${charSize * 0.05}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: charSize * 0.12,
                    height: charSize * 0.12,
                    background: 'radial-gradient(circle at 35% 30%, #d9f99d, #84cc16)',
                    boxShadow: '0 0 6px rgba(190,242,100,0.7)',
                  }}
                />
              </div>
            ))}

            {/* Body */}
            <div
              className="relative w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 28%, #bef264 0%, #84cc16 45%, #558b0f 100%)',
                border: `${Math.max(charSize * 0.03, 2)}px solid #3f6212`,
                boxShadow: 'inset 0 -5px 8px rgba(0,0,0,0.22), inset 0 3px 6px rgba(255,255,255,0.4)',
              }}
            >
              {/* Spots */}
              <div className="absolute rounded-full" style={{ top: '18%', right: '18%', width: charSize * 0.1, height: charSize * 0.1, background: 'rgba(63,98,18,0.5)' }} />
              <div className="absolute rounded-full" style={{ bottom: '24%', left: '16%', width: charSize * 0.08, height: charSize * 0.08, background: 'rgba(63,98,18,0.4)' }} />

              {/* Cheeks */}
              <div className="absolute rounded-full" style={{ top: '48%', left: '8%', width: charSize * 0.14, height: charSize * 0.1, background: 'rgba(255,143,176,0.65)', filter: 'blur(1px)' }} />
              <div className="absolute rounded-full" style={{ top: '48%', right: '8%', width: charSize * 0.14, height: charSize * 0.1, background: 'rgba(255,143,176,0.65)', filter: 'blur(1px)' }} />

              {/* Eyes - big and googly */}
              <div className="absolute flex gap-1.5" style={{ top: '18%', left: '50%', transform: 'translateX(-50%)' }}>
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-full bg-white relative" style={{ width: charSize * 0.27, height: charSize * 0.3, boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.15)' }}>
                    <div className="rounded-full bg-gray-900 absolute" style={{ width: charSize * 0.14, height: charSize * 0.14, left: '50%', top: '42%', transform: 'translate(-50%, 0)' }}>
                      <div className="rounded-full bg-white absolute" style={{ width: charSize * 0.05, height: charSize * 0.05, top: '10%', right: '10%' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mouth - happy open chomper */}
              <div
                className="absolute overflow-hidden"
                style={{
                  bottom: '14%',
                  left: '28%',
                  width: '44%',
                  height: '26%',
                  background: 'linear-gradient(#7a1030, #4a0a1e)',
                  border: '2px solid #3f0a16',
                  borderRadius: '30% 30% 55% 55%',
                }}
              >
                {/* Teeth */}
                <div className="absolute top-0 left-[12%] bg-white" style={{ width: '22%', height: '42%', borderRadius: '0 0 3px 3px' }} />
                <div className="absolute top-0 right-[12%] bg-white" style={{ width: '22%', height: '42%', borderRadius: '0 0 3px 3px' }} />
                {/* Tongue */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full" style={{ width: '55%', height: '45%', background: '#ff6b8a' }} />
              </div>
            </div>
          </div>

          {/* Enemies - blocky voxel crystal monsters (2026) */}
          {enemies.map((enemy) => {
            const colors = enemy.type === 'fast'
              ? { body: '#f59e0b', light: '#fcd34d', dark: '#b45309' }
              : enemy.type === 'smart'
              ? { body: '#a855f7', light: '#d8b4fe', dark: '#6b21a8' }
              : { body: '#2f9fe0', light: '#7cd0ff', dark: '#1c5f8c' };

            const facet = 'polygon(50% 0%, 100% 26%, 100% 74%, 50% 100%, 0% 74%, 0% 26%)';

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
                  filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.35)) drop-shadow(0 0 8px ${colors.body}55)`,
                }}
              >
                {/* Crystal shards on top */}
                <div className="absolute" style={{
                  top: '-16%', left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: `${charSize * 0.09}px solid transparent`,
                  borderRight: `${charSize * 0.09}px solid transparent`,
                  borderBottom: `${charSize * 0.24}px solid ${colors.light}`,
                }} />
                <div className="absolute" style={{
                  top: '-8%', left: '24%',
                  width: 0, height: 0,
                  borderLeft: `${charSize * 0.06}px solid transparent`,
                  borderRight: `${charSize * 0.06}px solid transparent`,
                  borderBottom: `${charSize * 0.16}px solid ${colors.body}`,
                  transform: 'rotate(-18deg)',
                }} />
                <div className="absolute" style={{
                  top: '-8%', right: '24%',
                  width: 0, height: 0,
                  borderLeft: `${charSize * 0.06}px solid transparent`,
                  borderRight: `${charSize * 0.06}px solid transparent`,
                  borderBottom: `${charSize * 0.16}px solid ${colors.body}`,
                  transform: 'rotate(18deg)',
                }} />

                {/* Faceted crystal body */}
                <div
                  className="relative"
                  style={{
                    width: '90%',
                    height: '90%',
                    clipPath: facet,
                    background: `linear-gradient(150deg, ${colors.light} 0%, ${colors.body} 45%, ${colors.dark} 100%)`,
                    boxShadow: `inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 3px 6px rgba(255,255,255,0.35)`,
                  }}
                >
                  {/* Facet edge highlight */}
                  <div className="absolute inset-0" style={{
                    clipPath: 'polygon(50% 0%, 100% 26%, 50% 50%, 0% 26%)',
                    background: 'rgba(255,255,255,0.18)',
                  }} />

                  {/* Glowing yellow angry eyes */}
                  <div className="absolute flex gap-1.5" style={{ top: '34%', left: '50%', transform: 'translateX(-50%)' }}>
                    {[0, 1].map((i) => (
                      <div key={i} style={{
                        width: charSize * 0.16, height: charSize * 0.13,
                        background: 'radial-gradient(circle at 50% 40%, #fff7c2 0%, #ffe14d 45%, #f5a800 100%)',
                        boxShadow: `0 0 ${charSize * 0.09}px #ffd24d, 0 0 ${charSize * 0.04}px #fff`,
                        borderRadius: '2px',
                        clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 85%)',
                        transform: i === 0 ? 'scaleX(-1)' : 'none',
                      }}>
                        <div style={{
                          position: 'absolute', left: '50%', top: '30%', transform: 'translateX(-50%)',
                          width: charSize * 0.03, height: charSize * 0.07, background: '#1a1400', borderRadius: '1px',
                        }} />
                      </div>
                    ))}
                  </div>

                  {/* Angry brows */}
                  <div className="absolute" style={{
                    top: '26%', left: '20%', width: '26%', height: `${Math.max(charSize * 0.04, 2)}px`,
                    background: colors.dark, transform: 'rotate(16deg)', borderRadius: '2px',
                  }} />
                  <div className="absolute" style={{
                    top: '26%', right: '20%', width: '26%', height: `${Math.max(charSize * 0.04, 2)}px`,
                    background: colors.dark, transform: 'rotate(-16deg)', borderRadius: '2px',
                  }} />

                  {/* Jagged grin */}
                  <div className="absolute flex justify-center gap-[2px]" style={{ bottom: '22%', left: '50%', transform: 'translateX(-50%)', width: '48%' }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} style={{
                        width: charSize * 0.06, height: charSize * 0.08,
                        background: '#fff',
                        clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                      }} />
                    ))}
                  </div>
                </div>

                {/* Type indicator */}
                {enemy.type === 'fast' && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 font-black" style={{ color: colors.light, fontSize: `${charSize * 0.24}px`, textShadow: `0 0 4px ${colors.body}` }}>
                    {"»"}
                  </div>
                )}
                {enemy.type === 'smart' && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2" style={{ color: colors.light, fontSize: `${charSize * 0.2}px`, textShadow: `0 0 4px ${colors.body}` }}>
                    {"✦"}
                  </div>
                )}
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
