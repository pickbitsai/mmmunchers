import GameBoard from "./GameBoard";

export default function Game() {
  // Only render the 3D game board inside the Canvas
  // Initialization is handled by the parent GameContainer
  return <GameBoard />;
}