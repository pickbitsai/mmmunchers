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
      const instructionTexts = [
        'Arrow Keys / WASD: Move',
        'P / ESC: Pause', 
        'Click button to toggle'
      ];
      
      instructionTexts.forEach(text => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        let node;
        while (node = walker.nextNode()) {
          if (node.nodeValue && node.nodeValue.includes(text)) {
            // Remove the parent element containing this text
            let parent = node.parentElement;
            while (parent && parent !== document.body) {
              if (parent.style.position === 'fixed' || parent.style.position === 'absolute') {
                parent.remove();
                break;
              }
              parent = parent.parentElement;
            }
          }
        }
      });
    };

    // Run immediately and then every 500ms
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
