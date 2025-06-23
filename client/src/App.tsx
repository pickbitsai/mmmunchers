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
    // Safely remove system overlay instructions
    const removeOverlays = () => {
      // Only target specific Replit overlay elements, not our game content
      const targetSelectors = [
        '[data-testid*="keyboard"]',
        '[data-testid*="floating"]',
        '[class*="replit-ui-kit-tooltip"]',
        '[role="tooltip"]'
      ];
      
      targetSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            if (el.textContent?.includes('Arrow Keys') || 
                el.textContent?.includes('WASD') ||
                el.textContent?.includes('Click button to toggle')) {
              el.remove();
            }
          });
        } catch (e) {
          // Silently handle any DOM errors
        }
      });
    };

    const interval = setInterval(removeOverlays, 1000);
    
    return () => {
      clearInterval(interval);
    };
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
