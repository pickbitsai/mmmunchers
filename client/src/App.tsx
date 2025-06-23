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
      // Find and remove any element containing these exact texts
      const targetTexts = [
        'Arrow Keys / WASD: Move',
        'Arrow Keys / WASD',
        'P / ESC: Pause',
        'Click button to toggle',
        'WASD: Move',
        'ESC: Pause'
      ];
      
      // Get all elements in the document
      const allElements = Array.from(document.querySelectorAll('*'));
      
      allElements.forEach(element => {
        if (element.textContent && element.textContent.trim()) {
          targetTexts.forEach(text => {
            if (element.textContent && element.textContent.includes(text) && element.id !== 'root') {
              // Remove this element completely
              element.remove();
            }
          });
        }
      });
      
      // Also check for elements with these specific aria-labels or data attributes
      const attributeSelectors = [
        '[aria-label*="Arrow Keys"]',
        '[aria-label*="WASD"]', 
        '[aria-label*="ESC"]',
        '[data-testid*="keyboard"]',
        '[data-testid*="controls"]'
      ];
      
      attributeSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
    };

    // Run more frequently to catch these overlays
    removeInstructions();
    const interval = setInterval(removeInstructions, 100);
    
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
