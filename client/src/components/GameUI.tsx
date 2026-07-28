import { useGameState } from "../lib/stores/useGameState";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../lib/stores/useAudio";
import OnscreenControls from "./OnscreenControls";
import { useEffect, useState, useRef } from "react";

export default function GameUI() {
  const {
    gamePhase,
    gameMode,
    score,
    lives,
    level,
    currentChallenge,
    timeRemaining,
    streak,
    bestStreak,
    enemies,
    togglePause,
    restartGame,
    goToMainMenu,
    processPlayerMove,
    munchCurrentCell,
    renderMode
  } = useGameState();

  const { isMuted, toggleMute } = useAudio();
  const [isMobile, setIsMobile] = useState(false);
  const [gameOverSelectedIndex, setGameOverSelectedIndex] = useState(0);
  const lastMoveTimeRef = useRef<number>(0);
  const isMovingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Game over keyboard controls
  useEffect(() => {
    if (gamePhase !== 'game_over') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          setGameOverSelectedIndex(prev => prev === 0 ? 1 : 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (gameOverSelectedIndex === 0) restartGame();
          else goToMainMenu();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, gameOverSelectedIndex, restartGame, goToMainMenu]);

  useEffect(() => {
    if (gamePhase === 'game_over') setGameOverSelectedIndex(0);
  }, [gamePhase]);

  if (gamePhase === 'topic_selection' || gamePhase === 'main_menu' || gamePhase === 'mode_selection') return null;

  // Mode-specific stat rendering
  const renderStats = () => {
    switch (gameMode) {
      case 'time_attack':
        return (
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm justify-around sm:justify-start">
            <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div>Level: <span className="font-bold text-blue-400">{level}</span></div>
            <div>Time: <span className={`font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>{Math.ceil(timeRemaining)}s</span></div>
          </div>
        );
      case 'trog_attack':
        return (
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm justify-around sm:justify-start">
            <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div>Lives: <span className="font-bold text-red-400">{lives}</span></div>
            <div>Level: <span className="font-bold text-blue-400">{level}</span></div>
            <div className="hidden sm:block">Trogs: <span className="font-bold text-orange-400">{enemies.length}</span></div>
          </div>
        );
      case 'zen':
        return (
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm justify-around sm:justify-start">
            <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div>Level: <span className="font-bold text-blue-400">{level}</span></div>
          </div>
        );
      case 'streak':
        return (
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm justify-around sm:justify-start">
            <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div>Streak: <span className="font-bold text-orange-400">{streak}</span></div>
            <div>Best: <span className="font-bold text-pink-400">{bestStreak}</span></div>
            <div>Level: <span className="font-bold text-blue-400">{level}</span></div>
          </div>
        );
      default: // classic
        return (
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm justify-around sm:justify-start">
            <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div>Lives: <span className="font-bold text-red-400">{lives}</span></div>
            <div>Level: <span className="font-bold text-blue-400">{level}</span></div>
            {timeRemaining > 0 && (
              <div className="hidden sm:block">Time: <span className="font-bold text-green-400">{Math.ceil(timeRemaining)}</span></div>
            )}
          </div>
        );
    }
  };

  // Game over stats
  const renderGameOverStats = () => {
    if (gameMode === 'streak') {
      return (
        <>
          <div className="text-xl mb-2">Final Score: <span className="text-yellow-400 font-bold">{score}</span></div>
          <div className="text-lg mb-6">Best Streak: <span className="text-orange-400 font-bold">{bestStreak}</span></div>
        </>
      );
    }
    if (gameMode === 'time_attack') {
      return (
        <>
          <div className="text-xl mb-2">Final Score: <span className="text-yellow-400 font-bold">{score}</span></div>
          <div className="text-lg mb-6">Reached Level: <span className="text-blue-400 font-bold">{level}</span></div>
        </>
      );
    }
    return (
      <div className="text-xl mb-6">Final Score: <span className="text-yellow-400 font-bold">{score}</span></div>
    );
  };

  const modeLabels: Record<string, string> = {
    classic: 'Classic',
    time_attack: 'Time Attack',
    trog_attack: 'Trog Attack',
    zen: 'Zen',
    streak: 'Streak'
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top HUD */}
      <div className="absolute top-2 left-2 right-2 pointer-events-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center justify-between">
            {/* Stats */}
            <Card className="bg-black/80 text-white border-gray-600 shrink-0">
              <CardContent className="px-3 py-2">
                {renderStats()}
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 shrink-0">
              {/* Mode badge */}
              <div className="hidden sm:block px-3 py-2 rounded text-xs text-cyan-300 bg-black/80 border border-gray-600 whitespace-nowrap">
                {modeLabels[gameMode]}
              </div>

              {/* Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className="bg-black/80 text-white border-gray-600 hover:bg-gray-700"
              >
                {gamePhase === 'paused' || gamePhase === 'level_complete' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMute}
                className="bg-black/80 text-white border-gray-600 hover:bg-gray-700"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Challenge / objective banner */}
          {currentChallenge && (
            <div
              className="rounded-xl px-4 py-2.5 sm:px-6 sm:py-3 text-center"
              style={{
                background: 'linear-gradient(90deg, rgba(26,200,255,0.14), rgba(255,47,186,0.14))',
                border: '1px solid rgba(26,200,255,0.55)',
                boxShadow: '0 0 20px rgba(26,200,255,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-cyan-300/80 text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mr-2 align-middle">
                Objective
              </span>
              <span
                className="text-white text-sm sm:text-lg md:text-xl font-extrabold tracking-wide align-middle"
                style={{ textShadow: '0 0 14px rgba(26,200,255,0.65)' }}
              >
                {currentChallenge.description}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop keyboard control hint */}
      {!isMobile && gamePhase === 'playing' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full text-xs text-gray-300 bg-black/70 border border-gray-700 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <Key>W</Key><Key>A</Key><Key>S</Key><Key>D</Key>
              <span className="text-gray-500 mx-0.5">or</span>
              <Key>&larr;</Key><Key>&uarr;</Key><Key>&darr;</Key><Key>&rarr;</Key>
              <span className="ml-1">move</span>
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5">
              <Key wide>Space</Key>
              <span className="ml-1">munch</span>
            </span>
          </div>
        </div>
      )}

      {/* Level Complete overlay */}
      {gamePhase === 'level_complete' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card
            className="bg-black/90 text-white border-green-500/40"
            style={{ boxShadow: '0 0 40px rgba(74,222,128,0.25)' }}
          >
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-2 text-green-400" style={{ textShadow: '0 0 16px rgba(74,222,128,0.6)' }}>
                Level Complete!
              </h2>
              <div className="text-lg text-gray-300">Get ready for Level {level}...</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pause overlay */}
      {gamePhase === 'paused' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card
            className="bg-black/90 text-white border-cyan-500/40"
            style={{ boxShadow: '0 0 40px rgba(26,200,255,0.25)' }}
          >
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4" style={{ textShadow: '0 0 16px rgba(26,200,255,0.5)' }}>
                Game Paused
              </h2>
              <div className="flex gap-4">
                <Button
                  onClick={togglePause}
                  className="bg-gradient-to-b from-lime-300 to-green-500 text-[#0b1a02] font-bold border-b-2 border-green-700 hover:brightness-110"
                >
                  Resume
                </Button>
                <Button onClick={goToMainMenu} variant="outline" className="bg-white/10 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/10">
                  Main Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Over overlay */}
      {gamePhase === 'game_over' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center pointer-events-auto">
          <Card
            className="bg-black/90 text-white border-red-500/40"
            style={{ boxShadow: '0 0 40px rgba(248,113,113,0.25)' }}
          >
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-2 text-red-400" style={{ textShadow: '0 0 16px rgba(248,113,113,0.6)' }}>
                {gameMode === 'streak' ? 'Streak Over!' : 'Game Over!'}
              </h2>
              {renderGameOverStats()}
              {!isMobile && (
                <div className="text-sm text-gray-400 mb-4">
                  Arrow keys to select, Enter to confirm
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={restartGame}
                  variant="outline"
                  className={`${
                    gameOverSelectedIndex === 0
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-500 ring-2 ring-white'
                      : 'bg-green-600/70 hover:bg-green-700 text-white border-green-500'
                  } transition-all`}
                  onMouseEnter={() => setGameOverSelectedIndex(0)}
                >
                  Play Again
                </Button>
                <Button
                  onClick={goToMainMenu}
                  variant="outline"
                  className={`${
                    gameOverSelectedIndex === 1
                      ? 'bg-white/20 text-white border-gray-600 ring-2 ring-white'
                      : 'bg-white/10 text-white border-gray-600'
                  } transition-all`}
                  onMouseEnter={() => setGameOverSelectedIndex(1)}
                >
                  Main Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile controls */}
      {(() => {
        if (isMobile && gamePhase === 'playing' && renderMode === '3d') {
          return (
            <OnscreenControls
              onMove={(direction) => {
                const now = Date.now();
                if (isMovingRef.current || now - lastMoveTimeRef.current < 200) return;

                const state = useGameState.getState();
                const player = state.player;
                const grid = state.grid;
                let newX = player.x;
                let newY = player.y;

                switch (direction) {
                  case 'up': newY = Math.max(0, player.y - 1); break;
                  case 'down': newY = Math.min(grid.length - 1, player.y + 1); break;
                  case 'left': newX = Math.max(0, player.x - 1); break;
                  case 'right': newX = Math.min((grid[0]?.length || 9) - 1, player.x + 1); break;
                }

                if (newX !== player.x || newY !== player.y) {
                  isMovingRef.current = true;
                  lastMoveTimeRef.current = now;
                  processPlayerMove(newX, newY);
                  setTimeout(() => { isMovingRef.current = false; }, 150);
                }
              }}
              onMunch={munchCurrentCell}
            />
          );
        }
        return null;
      })()}

      {isMobile && gamePhase === 'playing' && renderMode === '3d' && (
        <div className="absolute bottom-52 left-4 pointer-events-none">
          <p className="text-white text-xs bg-black/60 px-2 py-1 rounded text-left">
            Use controls to move, MUNCH to eat
          </p>
        </div>
      )}
    </div>
  );
}

function Key({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center rounded border border-gray-500 bg-gray-800 text-gray-100 font-semibold ${
        wide ? 'px-2 h-5 text-[10px]' : 'w-5 h-5 text-[10px]'
      }`}
    >
      {children}
    </kbd>
  );
}
