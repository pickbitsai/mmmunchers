import GameBoard from "./GameBoard";

export default function Game() {
  console.log("Game component rendering...");
  // Only render the 3D game board inside the Canvas
  // Initialization is handled by the parent GameContainer
  return <GameBoard />;
}