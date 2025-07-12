import { useEffect } from "react";
import { useGameState } from "@/lib/stores/useGameState";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { VolumeX, Volume2, RotateCw, Trophy } from "lucide-react";

export function Interface() {
  const { gamePhase, restartGame } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  // Handle clicks on the interface in the ready phase to start the game
  useEffect(() => {
    if (gamePhase === "topic_selection") {
      const handleClick = () => {
        const element = document.activeElement as HTMLElement;
        element?.blur(); // Remove focus from any button
        const event = new KeyboardEvent("keydown", { code: "Space" });
        window.dispatchEvent(event);
      };

      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [gamePhase]);

  return (
    <>      
      {/* Top-right corner UI controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={restartGame}
          title="Restart Game"
        >
          <RotateCw size={18} />
        </Button>
      </div>
      
      {/* Game completion overlay */}
      {gamePhase === "game_over" && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/30">
          <Card className="w-full max-w-md mx-4 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="text-yellow-500" />
                Game Over!
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <p className="text-center text-muted-foreground">
                Thanks for playing Number Munchers 3D!
              </p>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Button onClick={restartGame} className="w-full">
                Play Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      

    </>
  );
}
