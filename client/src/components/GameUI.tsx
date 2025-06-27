import { useGameState } from "../lib/stores/useGameState";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../lib/stores/useAudio";
import OnscreenControls from "./OnscreenControls";
import { useEffect, useState } from "react";

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
    munchCurrentCell
  } = useGameState();

  const { isMuted, toggleMute } = useAudio();
  const [isMobile, setIsMobile] = useState(false);
  const [gameOverSelectedIndex, setGameOverSelectedIndex] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
    <div className="fixed inset-0 pointer-events-none">
      {/* Mobile-friendly top HUD */}
      <div className="absolute top-2 left-2 right-2 pointer-events-auto flex flex-col sm:flex-row gap-2">
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

        {/* Challenge Display */}
        {currentChallenge && (
          <Card className="bg-black/80 text-white border-gray-600 sm:max-w-xs">
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
      </div>

      {/* Control buttons - moved to bottom right on mobile */}
      <div className="absolute bottom-20 sm:top-16 right-2 sm:left-1/2 sm:transform sm:-translate-x-1/2 flex gap-2 pointer-events-auto">
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

      {/* Mobile controls */}
      {isMobile && gamePhase === 'playing' && (
        <OnscreenControls 
          onMove={(direction) => {
            const player = useGameState.getState().player;
            let newX = player.x;
            let newY = player.y;
            
            switch(direction) {
              case 'up': newY = Math.max(0, player.y - 1); break;
              case 'down': newY = Math.min(6, player.y + 1); break;
              case 'left': newX = Math.max(0, player.x - 1); break;
              case 'right': newX = Math.min(8, player.x + 1); break;
            }
            
            processPlayerMove(newX, newY);
          }}
          onMunch={munchCurrentCell}
        />
      )}

      {/* Mobile hint */}
      {isMobile && gamePhase === 'playing' && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <p className="text-white text-xs bg-black/60 px-2 py-1 rounded">
            Use controls to move • Center button to munch
          </p>
        </div>
      )}

    </div>
  );
}
