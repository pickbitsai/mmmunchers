import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { useGameState } from "../lib/stores/useGameState";
import { updateGameLogic } from "../lib/gameLogic";
import Player from "./Player";
import Enemy from "./Enemy";
import GridCell from "./GridCell";

export default function GameBoard() {
  const groupRef = useRef<Group>(null);
  // Temporarily disable texture loading to debug R3F error
  // const grassTexture = useTexture("/textures/grass.png");
  
  const {
    gamePhase,
    grid,
    player,
    enemies,
    currentChallenge,
    updatePlayer,
    updateEnemies,
    updateGrid,
    processPlayerMove,
    munchCurrentCell,
    spawnEnemies,
    gameOver
  } = useGameState();

  // Initialize enemies when game starts
  useEffect(() => {
    if (gamePhase === 'playing' && enemies.length === 0) {
      spawnEnemies();
    }
  }, [gamePhase, enemies.length, spawnEnemies]);

  // Game loop
  useFrame((state, delta) => {
    if (gamePhase !== 'playing') return;

    updateGameLogic({
      delta,
      player,
      enemies,
      grid,
      currentChallenge,
      updatePlayer,
      updateEnemies,
      updateGrid,
      processPlayerMove,
      munchCurrentCell,
      gameOver
    });
  });

  if (!grid.length || !currentChallenge) {
    console.log('GameBoard: Missing data', { gridLength: grid.length, hasChallenge: !!currentChallenge });
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshLambertMaterial color="#2c3e50" />
      </mesh>

      {/* Grid cells */}
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GridCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            position={[
              (colIndex - 4) * 2,
              0,
              (rowIndex - 3) * 2
            ]}
          />
        ))
      )}

      {/* Player */}
      <Player
        position={[
          (player.x - 4) * 2,
          0.5,
          (player.y - 3) * 2
        ]}
      />

      {/* Enemies */}
      {enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          enemy={enemy}
          position={[
            (enemy.x - 4) * 2,
            0.5,
            (enemy.y - 3) * 2
          ]}
        />
      ))}
    </group>
  );
}
