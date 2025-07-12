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
import { Toaster } from "./components/ui/sonner";
import { assetLoader } from "./lib/assetLoader";
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
  const { gamePhase, initializeGame, renderMode, grid, currentChallenge } = useGameState();

  // Initialize game and preload assets once on mount
  React.useEffect(() => {
    // Preload critical 3D assets
    assetLoader.preloadCriticalAssets().catch(console.error);
    
    initializeGame();
  }, [initializeGame]);

  // Cleanup assets when component unmounts
  React.useEffect(() => {
    return () => {
      // Clean up non-critical assets on unmount
      assetLoader.cleanup();
    };
  }, []);



  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* UI Layer - Always on top */}
      {gamePhase === 'topic_selection' && <TopicSelection />}
      
      {/* Loading Screen */}
      {gamePhase === 'loading' && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Generating AI content...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      )}
      
      {/* Game Board - 2D or 3D based on renderMode */}
      {(gamePhase === 'playing' || gamePhase === 'paused' || gamePhase === 'game_over') && (
        <>
          {renderMode === '3d' ? (
            <Canvas
              shadows
              camera={{ position: [0, 10, 10], fov: 60 }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              onCreated={() => console.log("Canvas created successfully")}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
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
      <Toaster position="top-center" />
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