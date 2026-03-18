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
        <div className="flex flex-row gap-2 items-center">
          {/* Stats */}
          <Card className="bg-black/80 text-white border-gray-600 flex-1">
            <CardContent className="p-2">
              {renderStats()}
            </CardContent>
          </Card>

          {/* Mode badge */}
          <div className="hidden sm:block px-2 py-1 rounded text-xs text-cyan-300 bg-black/80 border border-gray-600 whitespace-nowrap">
            {modeLabels[gameMode]}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
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

        {/* Challenge Description */}
        {currentChallenge && (
          <Card className="bg-black/80 text-white border-gray-600 mt-2">
            <CardContent className="p-2">
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold text-cyan-400">
                  {currentChallenge.description}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Level Complete overlay */}
      {gamePhase === 'level_complete' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card className="bg-black/90 text-white border-gray-600">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-2 text-green-400">Level Complete!</h2>
              <div className="text-lg text-gray-300">Get ready for Level {level}...</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pause overlay */}
      {gamePhase === 'paused' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card className="bg-black/90 text-white border-gray-600">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
              <div className="flex gap-4">
                <Button onClick={togglePause} variant="outline" className="bg-white/10 text-white border-gray-600">
                  Resume
                </Button>
                <Button onClick={goToMainMenu} variant="outline" className="bg-white/10 text-white border-gray-600">
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
          <Card className="bg-black/90 text-white border-gray-600">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-2 text-red-400">
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
