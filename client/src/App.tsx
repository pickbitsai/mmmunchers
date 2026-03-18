import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import React from "react";
import Game from "./components/Game";
import GameBoard2D from "./components/GameBoard2D";
import SoundManager from "./components/SoundManager";
import MainMenu from "./components/MainMenu";
import ModeSelection from "./components/ModeSelection";
import TopicSelection from "./components/TopicSelection";
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
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #87CEEB 0%, #a8d8ea 30%, #e0f0ff 60%, #f0e68c 85%, #deb887 100%)' }}>
      {/* Menu Screens */}
      {gamePhase === 'main_menu' && <MainMenu />}
      {gamePhase === 'mode_selection' && <ModeSelection />}
      {gamePhase === 'topic_selection' && <TopicSelection />}

      {/* Game Board - 2D or 3D */}
      {(gamePhase === 'playing' || gamePhase === 'paused' || gamePhase === 'game_over' || gamePhase === 'level_complete') && (
        <>
          {renderMode === '3d' ? (
            <Canvas
              shadows
              camera={{ position: [0, 10, 10], fov: 60 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              onCreated={() => {}}
            >
              <color attach="background" args={['#87CEEB']} />
              <fog attach="fog" args={['#a8d8ea', 25, 60]} />
              <ambientLight intensity={0.6} color="#fff5e6" />
              <directionalLight
                position={[15, 20, 10]}
                intensity={1.5}
                color="#fff3d4"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <directionalLight
                position={[-10, 5, -5]}
                intensity={0.3}
                color="#88ccff"
              />
              <hemisphereLight
                args={['#87CEEB', '#deb887', 0.4]}
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
