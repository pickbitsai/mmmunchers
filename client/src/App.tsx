import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./components/Game";
import GameBoard2D from "./components/GameBoard2D";
import SoundManager from "./components/SoundManager";
import TopicSelection from "./components/TopicSelection";
import GameUI from "./components/GameUI";
import { useGameState } from "./lib/stores/useGameState";
import "@fontsource/inter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});

function GameContainer() {
  const { gamePhase, initializeGame, renderMode } = useGameState();

  // Initialize game once on mount
  React.useEffect(() => {

    initializeGame();
  }, [initializeGame]);



  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* UI Layer - Always on top */}
      {gamePhase === 'topic_selection' && <TopicSelection />}
      
      {/* Game Board - 2D or 3D based on renderMode */}
      {(gamePhase === 'playing' || gamePhase === 'paused' || gamePhase === 'game_over') && (
        <>
          {renderMode === '3d' ? (
            <Canvas
              shadows
              camera={{ position: [0, 10, 10], fov: 60 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <Suspense fallback={null}>
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameContainer />
    </QueryClientProvider>
  );
}

export default App;