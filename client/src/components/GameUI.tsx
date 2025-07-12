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
    score,
    lives,
    level,
    currentChallenge,
    timeRemaining,
    togglePause,
    restartGame,
    selectTopic,
    processPlayerMove,
    munchCurrentCell,
    renderMode
  } = useGameState();

  const { isMuted, toggleMute, playMove } = useAudio();
  const [isMobile, setIsMobile] = useState(false);
  const [gameOverSelectedIndex, setGameOverSelectedIndex] = useState(0);
  const lastMoveTimeRef = useRef<number>(0);
  const isMovingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard controls for game over screen
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
          if (gameOverSelectedIndex === 0) {
            restartGame();
          } else {
            selectTopic(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, gameOverSelectedIndex, restartGame, selectTopic]);

  // Reset selected index when game over screen appears
  useEffect(() => {
    if (gamePhase === 'game_over') {
      setGameOverSelectedIndex(0);
    }
  }, [gamePhase]);

  if (gamePhase === 'topic_selection') return null;
  


  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top HUD - Single row layout */}
      <div className="absolute top-2 left-2 right-2 pointer-events-auto">
        <div className="flex flex-row gap-2 items-center">
          {/* Stats */}
          <Card className="bg-black/80 text-white border-gray-600 flex-1">
            <CardContent className="p-2">
              <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm justify-around sm:justify-start">
                <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
                <div>Lives: <span className="font-bold text-red-400">{lives}</span></div>
                <div>Level: <span className="font-bold text-blue-400">{level}</span></div>
                {timeRemaining > 0 && (
                  <div className="hidden sm:block">Time: <span className="font-bold text-green-400">{Math.ceil(timeRemaining)}</span></div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Control buttons - inline with stats */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              className="bg-black/80 text-white border-gray-600 hover:bg-gray-700"
            >
              {gamePhase === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
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

        {/* Challenge Display - Second row */}
        {currentChallenge && (
          <Card className="bg-black/80 text-white border-gray-600 mt-2">
            <CardContent className="p-2">
              <div className="text-center">
                <div className="text-xs sm:text-sm font-bold text-cyan-400">
                  {currentChallenge.description}
                </div>
                <div className="text-xs text-gray-300 hidden sm:block">
                  Munch the correct answers!
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QA Legend - Third row */}
        <Card className="bg-black/80 text-white border-gray-600 mt-2">
          <CardContent className="p-2">
            <div className="text-center">
              <div className="text-xs text-gray-300 mb-1">QA Mode:</div>
              <div className="flex gap-4 justify-center items-center text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Correct</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Incorrect</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <Button onClick={() => selectTopic(null)} variant="outline" className="bg-white/10 text-white border-gray-600">
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
              <h2 className="text-3xl font-bold mb-2 text-red-400">Game Over!</h2>
              <div className="text-xl mb-6">Final Score: <span className="text-yellow-400 font-bold">{score}</span></div>
              {!isMobile && (
                <div className="text-sm text-gray-400 mb-4">
                  Use arrow keys to select • Press Enter to confirm
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
                  onClick={() => selectTopic(null)} 
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

      {/* Mobile controls - only for 3D mode */}
      {(() => {

        if (isMobile && gamePhase === 'playing' && renderMode === '3d') {
          return (
            <OnscreenControls 
              onMove={(direction) => {
                const now = Date.now();
                
                // Prevent rapid-fire movements (debounce to 200ms)
                if (isMovingRef.current || now - lastMoveTimeRef.current < 200) {
                  return;
                }
                
                const state = useGameState.getState();
                const player = state.player;
                const grid = state.grid;
                let newX = player.x;
                let newY = player.y;
                
                switch(direction) {
                  case 'up': 
                    newY = Math.max(0, player.y - 1); 
                    break;
                  case 'down': 
                    newY = Math.min(grid.length - 1, player.y + 1); 
                    break;
                  case 'left': 
                    newX = Math.max(0, player.x - 1); 
                    break;
                  case 'right': 
                    newX = Math.min((grid[0]?.length || 9) - 1, player.x + 1); 
                    break;
                }
                
                // Use processPlayerMove which includes bounds checking and sound
                if (newX !== player.x || newY !== player.y) {
                  isMovingRef.current = true;
                  lastMoveTimeRef.current = now;
                  processPlayerMove(newX, newY);
                  
                  // Reset movement flag after animation completes
                  setTimeout(() => {
                    isMovingRef.current = false;
                  }, 150);
                }
              }}
              onMunch={munchCurrentCell}
            />
          );
        }
        return null;
      })()}

      {/* Mobile hint - only for 3D mode - positioned above controls */}
      {isMobile && gamePhase === 'playing' && renderMode === '3d' && (
        <div className="absolute bottom-52 left-4 pointer-events-none">
          <p className="text-white text-xs bg-black/60 px-2 py-1 rounded text-left">
            Use controls to move • MUNCH button to eat
          </p>
        </div>
      )}

    </div>
  );
}
