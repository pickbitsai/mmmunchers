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
      // Target the exact text patterns from the user
      const targetPatterns = [
        'Arrow Keys / WASD: Move',
        '⏸️ P / ESC: Pause', 
        '🔊 Click button to toggle',
        'P / ESC: Pause',
        'Click button to toggle'
      ];
      
      // Find and remove elements containing these patterns
      document.querySelectorAll('*').forEach(element => {
        if (element.textContent) {
          const text = element.textContent.trim();
          targetPatterns.forEach(pattern => {
            if (text.includes(pattern) && 
                element !== document.body && 
                element !== document.documentElement &&
                !element.closest('#root')) {
              
              // Additional check - make sure it's not our game content
              const rect = element.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                
                // Also try to remove it completely
                setTimeout(() => {
                  try {
                    element.remove();
                  } catch (e) {
                    // Ignore errors if element already removed
                  }
                }, 100);
              }
            }
          });
        }
      });
    };

    // Run immediately and then every second
    removeInstructions();
    const interval = setInterval(removeInstructions, 1000);
    
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
