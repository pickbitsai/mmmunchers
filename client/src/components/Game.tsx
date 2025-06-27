<<<<<<< HEAD
import GameBoard from "./GameBoard";

export default function Game() {
  // Only render the 3D game board inside the Canvas
  // Initialization is handled by the parent GameContainer
  return <GameBoard />;
}
=======
import { useEffect } from "react";
import { useGameState } from "../lib/stores/useGameState";
import TopicSelection from "./TopicSelection";
import GameBoard from "./GameBoard";
import GameUI from "./GameUI";

export default function Game() {
  const { gamePhase, initializeGame } = useGameState();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <>
      {gamePhase === 'topic_selection' && <TopicSelection />}
      {(gamePhase === 'playing' || gamePhase === 'paused' || gamePhase === 'game_over') && (
        <>
          <GameBoard />
          <GameUI />
        </>
      )}
    </>
  );
}
>>>>>>> 8dfa9d15082776f0965b94f8640826bd7e21a1e5
