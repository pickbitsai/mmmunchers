import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./components/Game";
import SoundManager from "./components/SoundManager";
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

function App() {
  useEffect(() => {
    const removeInstructions = () => {
      try {
        // Target the exact text patterns
        const targetPatterns = [
          'Arrow Keys / WASD: Move',
          '⏸️ P / ESC: Pause', 
          '🔊 Click button to toggle',
          'P / ESC: Pause',
          'Click button to toggle',
          'WASD: Move'
        ];
        
        // Remove elements containing these patterns
        targetPatterns.forEach(pattern => {
          const elements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent?.includes(pattern) && 
            !el.closest('#root') &&
            el !== document.body &&
            el !== document.documentElement
          );
          
          elements.forEach(element => {
            element.remove();
          });
        });
      } catch (error) {
        // Silently handle any errors
      }
    };

    // Run immediately and frequently
    removeInstructions();
    const interval = setInterval(removeInstructions, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <Game />
        <SoundManager />
      </div>
    </QueryClientProvider>
  );
}

export default App;
