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
      // Only target elements that are likely system overlays (positioned absolutely/fixed)
      const targetTexts = [
        'Arrow Keys / WASD: Move',
        'P / ESC: Pause',
        'Click button to toggle'
      ];
      
      targetTexts.forEach(text => {
        // Find elements containing this text
        const elements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && 
          el.textContent.includes(text) && 
          el.id !== 'root' &&
          !el.closest('#root') // Don't remove elements inside our game
        );
        
        elements.forEach(element => {
          const computedStyle = window.getComputedStyle(element);
          // Only remove if it's positioned (likely an overlay)
          if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') {
            element.remove();
          }
        });
      });
    };

    // Run less frequently and safely
    const interval = setInterval(removeInstructions, 2000);
    
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
