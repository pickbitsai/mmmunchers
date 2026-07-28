import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import React from "react";
import Game from "./components/Game";
import GameBoard2D from "./components/GameBoard2D";
import SoundManager from "./components/SoundManager";
import MainMenu from "./components/MainMenu";
import GameUI from "./components/GameUI";
import { useGameState } from "./lib/stores/useGameState";
import { assetLoader } from "./lib/assetLoader";
import "@fontsource/inter";

function App() {
  const { gamePhase, initializeGame, renderMode } = useGameState();

  React.useEffect(() => {
    assetLoader.preloadCriticalAssets().catch(() => {});
    initializeGame();
  }, [initializeGame]);

  React.useEffect(() => {
    return () => {
      assetLoader.cleanup();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at 50% 25%, #0b1c38 0%, #040817 48%, #02040b 100%)' }}>
      {/* Menu Screen — single cascading page (mode → topic) */}
      {(gamePhase === 'main_menu' || gamePhase === 'mode_selection' || gamePhase === 'topic_selection') && <MainMenu />}

      {/* Game Board - 2D or 3D */}
      {(gamePhase === 'playing' || gamePhase === 'paused' || gamePhase === 'game_over' || gamePhase === 'level_complete') && (
        <>
          {renderMode === '3d' ? (
            <Canvas
              shadows
              dpr={[1, 1.5]}
              camera={{ position: [0, 10, 10], fov: 60 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              onCreated={() => {}}
            >
              <color attach="background" args={['#02040d']} />
              <fog attach="fog" args={['#02040d', 24, 58]} />
              <ambientLight intensity={0.42} color="#c8efff" />
              <directionalLight
                position={[12, 18, 10]}
                intensity={1.35}
                color="#e6f8ff"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              <pointLight position={[-12, 7, 8]} intensity={18} distance={38} color="#1ac8ff" />
              <pointLight position={[12, 6, -5]} intensity={16} distance={34} color="#ff2fba" />
              <hemisphereLight
                args={['#173d66', '#03040a', 0.7]}
              />
              <Suspense fallback={<mesh><boxGeometry args={[1,1,1]} /><meshBasicMaterial color="red" /></mesh>}>
                <Game />
              </Suspense>
            </Canvas>
          ) : (
            <GameBoard2D />
          )}
          <GameUI />
        </>
      )}

      <SoundManager />
    </div>
  );
}

export default App;
