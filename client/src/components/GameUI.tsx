import { useGameState } from "../lib/stores/useGameState";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../lib/stores/useAudio";

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
    selectTopic
  } = useGameState();

  const { isMuted, toggleMute } = useAudio();

  if (gamePhase === 'topic_selection') return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <Card className="absolute top-2 left-2 pointer-events-auto bg-black/80 text-white border-gray-600">
        <CardContent className="p-2">
          <div className="flex gap-4 text-xs">
            <div>Score: <span className="font-bold text-yellow-400">{score}</span></div>
            <div>Lives: <span className="font-bold text-red-400">{lives}</span></div>
            <div>Level: <span className="font-bold text-blue-400">{level}</span></div>
            {timeRemaining > 0 && (
              <div>Time: <span className="font-bold text-green-400">{Math.ceil(timeRemaining)}</span></div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Display */}
      {currentChallenge && (
        <Card className="absolute top-2 right-2 pointer-events-auto bg-black/80 text-white border-gray-600">
          <CardContent className="p-2">
            <div className="text-center">
              <div className="text-sm font-bold text-cyan-400 mb-1">
                {currentChallenge.description}
              </div>
              <div className="text-xs text-gray-300">
                Munch the correct answers!
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control buttons */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto">
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
              <div className="flex gap-4">
                <Button 
                  onClick={restartGame} 
                  variant="outline" 
                  className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                >
                  Play Again
                </Button>
                <Button 
                  onClick={() => selectTopic(null)} 
                  variant="outline" 
                  className="bg-white/10 text-white border-gray-600"
                >
                  Main Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  );
}
