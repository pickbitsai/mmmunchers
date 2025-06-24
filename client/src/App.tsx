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
        // More comprehensive text patterns
        const targetPatterns = [
          'Arrow Keys',
          'WASD',
          'Move',
          'P / ESC',
          'Pause', 
          'Click button',
          'toggle',
          '⏸️',
          '🔊'
        ];
        
        // Get ALL elements and check their text content
        const walker = document.createTreeWalker(
          document,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (node) => {
              const element = node as Element;
              if (element.closest('#root') || 
                  element === document.body || 
                  element === document.documentElement) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            }
          },
          false
        );
        
        const elementsToRemove: Element[] = [];
        let currentNode: Element | null = walker.nextNode() as Element;
        
        while (currentNode) {
          if (currentNode.textContent) {
            const text = currentNode.textContent.toLowerCase();
            for (const pattern of targetPatterns) {
              if (text.includes(pattern.toLowerCase())) {
                elementsToRemove.push(currentNode);
                break;
              }
            }
          }
          currentNode = walker.nextNode() as Element;
        }
        
        // Remove all found elements
        elementsToRemove.forEach(element => {
          try {
            element.remove();
          } catch (e) {
            // Element may already be removed
          }
        });
        
        // Also remove by common overlay selectors
        const overlaySelectors = [
          'div[style*="position: fixed"]',
          'div[style*="position: absolute"]',
          '[role="tooltip"]',
          '[data-testid*="floating"]',
          '[data-testid*="keyboard"]'
        ];
        
        overlaySelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            if (!el.closest('#root') && 
                el.textContent && 
                (el.textContent.includes('Arrow') || 
                 el.textContent.includes('WASD') || 
                 el.textContent.includes('ESC') ||
                 el.textContent.includes('Click'))) {
              el.remove();
            }
          });
        });
        
      } catch (error) {
        // Silently handle any errors
      }
    };

    // Run immediately and very frequently
    removeInstructions();
    const interval = setInterval(removeInstructions, 100);
    
    // Also run on mutations
    const observer = new MutationObserver(removeInstructions);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true
    });
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
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
