import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./components/Game";
import SoundManager from "./components/SoundManager";
import "@fontsource/inter";

// Define control keys for the game
enum Controls {
  up = 'up',
  down = 'down',
  left = 'left',
  right = 'right',
  select = 'select',
  pause = 'pause'
}

const keyMap = [
  { name: Controls.up, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.down, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.select, keys: ['Space', 'Enter'] },
  { name: Controls.pause, keys: ['KeyP', 'Escape'] },
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Canvas
          shadows
          camera={{
            position: [0, 12, 8],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#1a1a2e"]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          <Suspense fallback={null}>
            {/* Temporarily simplified scene to debug R3F error */}
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="orange" />
            </mesh>
          </Suspense>
        </Canvas>
        <SoundManager />
      </div>
    </QueryClientProvider>
  );
}

export default App;
