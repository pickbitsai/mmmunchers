import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useGameState } from "../lib/stores/useGameState";
import { updateGameLogic } from "../lib/gameLogic";
import Player from "./Player";
import Enemy from "./Enemy";
import GridCell from "./GridCell";

export default function GameBoard() {
  const groupRef = useRef<Group>(null);
  const { camera, size } = useThree();
  const cameraTarget = useRef(new Vector3());
  
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

  // Adjust camera based on screen size
  useEffect(() => {
    const isMobile = size.width < 768;
    const isTablet = size.width < 1024;
    
    if (isMobile) {
      // Mobile: Closer, more angled view
      camera.position.set(0, 12, 8);
      camera.fov = 75;
    } else if (isTablet) {
      // Tablet: Medium distance
      camera.position.set(0, 14, 10);
      camera.fov = 65;
    } else {
      // Desktop: Original view
      camera.position.set(0, 10, 10);
      camera.fov = 60;
    }
    camera.updateProjectionMatrix();
  }, [size, camera]);

  // Game loop with camera follow
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

    // Smooth camera follow on mobile/tablet
    if (size.width < 1024) {
      const playerWorldX = (player.x - 4) * 2;
      const playerWorldZ = (player.y - 3) * 2;
      
      // Update camera target
      cameraTarget.current.lerp(
        new Vector3(playerWorldX * 0.3, camera.position.y, playerWorldZ * 0.3 + 10),
        0.1
      );
      
      camera.position.x = cameraTarget.current.x;
      camera.position.z = cameraTarget.current.z;
      camera.lookAt(playerWorldX, 0, playerWorldZ);
    } else {
      // Desktop: Fixed camera
      camera.lookAt(0, 0, 0);
    }
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
