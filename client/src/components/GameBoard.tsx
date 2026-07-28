import { Suspense, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import { useGameState } from "../lib/stores/useGameState";
import { updateGameLogic } from "../lib/gameLogic";
import Player from "./Player";
import Enemy from "./Enemy";
import GridCell, { TILE_SURFACE_Y } from "./GridCell";
import ArcadeFloor from "./ArcadeFloor";
import ArcadeWalls from "./ArcadeWalls";

export default function GameBoard() {
  const groupRef = useRef<Group>(null);
  const { camera, size } = useThree();
  const cameraTarget = useRef(new Vector3());
  
  const {
    gamePhase,
    gameMode,
    grid,
    player,
    enemies,
    currentChallenge,
    level,
    updatePlayer,
    updateEnemies,
    updateGrid,
    processPlayerMove,
    munchCurrentCell,
    spawnEnemies,
    gameOver,
    loseLife,
    tickTimer
  } = useGameState();

  // Initialize enemies when game starts
  useEffect(() => {
    if (gamePhase === 'playing' && enemies.length === 0) {
      spawnEnemies();
    }
  }, [gamePhase, enemies.length, spawnEnemies]);

  // Keyboard controls
  const lastMoveTimeRef = useRef<number>(0);
  const MOVE_DEBOUNCE = 300; // 300ms debounce for movement
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase !== 'playing') return;
      
      const now = Date.now();
      if (now - lastMoveTimeRef.current < MOVE_DEBOUNCE) return;
      
      let newX = player.x;
      let newY = player.y;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          newY = Math.max(0, player.y - 1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          newY = Math.min((grid.length || 6) - 1, player.y + 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          newX = Math.max(0, player.x - 1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          newX = Math.min((grid[0]?.length || 8) - 1, player.x + 1);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          munchCurrentCell();
          lastMoveTimeRef.current = now;
          return;
      }
      
      if (newX !== player.x || newY !== player.y) {
        processPlayerMove(newX, newY);
        lastMoveTimeRef.current = now;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gamePhase, player, grid, processPlayerMove, munchCurrentCell]);

  // Adjust camera based on screen size
  useEffect(() => {
    const isMobile = size.width < 768;
    const isTablet = size.width < 1024;
    
    if (isMobile) {
      // Mobile: Closer, more angled view
      camera.position.set(0, 12, 8);
    } else if (isTablet) {
      // Tablet: Medium distance
      camera.position.set(0, 14, 10);
    } else {
      // Desktop: Original view
      camera.position.set(0, 10, 10);
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
      level,
      gameMode,
      updatePlayer,
      updateEnemies,
      updateGrid,
      processPlayerMove,
      munchCurrentCell,
      gameOver,
      loseLife,
      tickTimer
    });

    // Calculate dynamic center offsets for camera
    const gridWidth = grid[0]?.length || 8;
    const gridHeight = grid.length || 6;
    const centerX = (gridWidth - 1) / 2;
    const centerY = (gridHeight - 1) / 2;

    // Smooth camera follow on mobile/tablet
    if (size.width < 1024) {
      const playerWorldX = (player.x - centerX) * 2;
      const playerWorldZ = (player.y - centerY) * 2;
      
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

  // Debug logging removed for performance

  if (!grid.length || !currentChallenge) {
    return null;
  }

  // Calculate grid dimensions
  const gridWidth = grid[0]?.length || 8;
  const gridHeight = grid.length || 6;
  
  // Calculate center offsets
  const centerX = (gridWidth - 1) / 2;
  const centerY = (gridHeight - 1) / 2;
  
  // Calculate ground plane size (slightly larger than grid)
  const groundWidth = gridWidth * 2 + 1;
  const groundHeight = gridHeight * 2 + 1;

  // Performance optimization: removed debug logging

  return (
    <group ref={groupRef}>
      {/* Neon arcade playfield */}
      <ArcadeFloor
        width={groundWidth}
        depth={groundHeight}
        position={[0, -0.32, 0]}
      />

      {/* Maze-style boundary walls */}
      <ArcadeWalls width={groundWidth} depth={groundHeight} />

      {/* Grid cells */}
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Cell rendering optimized
          return (
            <GridCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              position={[
                (colIndex - centerX) * 2,
                0,
                (rowIndex - centerY) * 2
              ]}
            />
          );
        })
      )}

      {/* Player — its own Suspense boundary so a slower-loading enemy model
          can't force a re-render that leaves a stale duplicate behind. */}
      <Suspense fallback={null}>
        <Player
          position={[
            (player.x - centerX) * 2,
            TILE_SURFACE_Y,
            (player.y - centerY) * 2
          ]}
        />
      </Suspense>

      {/* Enemies — each isolated the same way */}
      {enemies.map((enemy) => (
        <Suspense key={enemy.id} fallback={null}>
          <Enemy
            enemy={enemy}
            position={[
              (enemy.x - centerX) * 2,
              TILE_SURFACE_Y,
              (enemy.y - centerY) * 2
            ]}
          />
        </Suspense>
      ))}
    </group>
  );
}
