import { useEffect } from "react";
import { useGameState } from "../lib/stores/useGameState";
import TopicSelection from "./TopicSelection";
import GameBoard2D from "./GameBoard2D";
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
          <GameBoard2D />
          <GameUI />
        </>
      )}
    </>
  );
}
