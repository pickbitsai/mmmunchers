import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface OnscreenControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onMunch: () => void;
}

export default function OnscreenControls({ onMove, onMunch }: OnscreenControlsProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [touchCount, setTouchCount] = useState(0);
  const lastMoveTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  // Custom touch handler for mobile controls
  React.useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      if (e.type !== 'touchstart') return;
      
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY) as Element;
      
      if (!element) return;
      
      const controlElement = element.closest('[data-control]') as HTMLElement;
      if (controlElement) {
        e.preventDefault();
        e.stopPropagation();
        
        const direction = controlElement.getAttribute('data-control');
        console.log('Touch control detected:', direction);
        
        if (direction === 'munch') {
          handleMunchPress();
        } else if (direction && ['up', 'down', 'left', 'right'].includes(direction)) {
          handleButtonPress(direction as 'up' | 'down' | 'left' | 'right');
        }
        
        setTouchCount(prev => prev + 1);
      }
    };

    document.addEventListener('touchstart', handleTouch, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  const handleButtonPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    console.log('OnscreenControls - Button press detected:', direction);
    
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    const now = Date.now();
    
    // Prevent rapid-fire movements (debounce to 200ms)
    if (isProcessingRef.current || now - lastMoveTimeRef.current < 200) {
      console.log('OnscreenControls - Button press blocked by debounce');
      return;
    }
    
    isProcessingRef.current = true;
    lastMoveTimeRef.current = now;
    
    console.log('OnscreenControls - Executing move:', direction);
    setPressedButton(direction);
    onMove(direction);
    
    // Visual feedback and reset processing flag
    setTimeout(() => {
      setPressedButton(null);
      isProcessingRef.current = false;
    }, 150);
  };

  const handleMunchPress = () => {
    console.log('Munch button press detected');
    
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
    console.log('Executing munch');
    setPressedButton('munch');
    onMunch();
    setTimeout(() => setPressedButton(null), 150);
  };

  const buttonClass = (direction: string) => `
    w-14 h-14 p-0 bg-black/60 hover:bg-black/80 border-2 border-white/30 
    text-white shadow-lg backdrop-blur-sm transition-all duration-150 select-none
    ${pressedButton === direction ? 'bg-blue-500 scale-95' : ''}
  `;

  return (
    <>
      {/* Debug indicator */}
      <div className="fixed top-4 left-4 z-50 bg-red-500 text-white p-2 rounded text-xs">
        Touch count: {touchCount}
      </div>
      
      {/* D-pad directional controls - centered below grid */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50" style={{ touchAction: 'none' }}>
        <div className="relative">
          {/* Up */}
          <div
            data-control="up"
            className={`${buttonClass('up')} absolute -top-16 left-1/2 transform -translate-x-1/2 rounded-md cursor-pointer flex items-center justify-center`}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
          >
            <ChevronUp className="w-6 h-6 pointer-events-none" />
          </div>

          {/* Left */}
          <div
            data-control="left"
            className={`${buttonClass('left')} absolute top-0 -left-16 rounded-md cursor-pointer flex items-center justify-center`}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
          >
            <ChevronLeft className="w-6 h-6 pointer-events-none" />
          </div>

          {/* Center (visual reference) */}
          <div className="w-14 h-14 bg-black/20 border-2 border-white/20 rounded-md" />

          {/* Right */}
          <div
            data-control="right"
            className={`${buttonClass('right')} absolute top-0 -right-16 rounded-md cursor-pointer flex items-center justify-center`}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
          >
            <ChevronRight className="w-6 h-6 pointer-events-none" />
          </div>

          {/* Down */}
          <div
            data-control="down"
            className={`${buttonClass('down')} absolute -bottom-16 left-1/2 transform -translate-x-1/2 rounded-md cursor-pointer flex items-center justify-center`}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
          >
            <ChevronDown className="w-6 h-6 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Munch Button - right side of screen */}
      <div className="fixed right-4 bottom-20 z-50" style={{ touchAction: 'none' }}>
        <div
          data-control="munch"
          className={`w-20 h-20 p-0 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-300 
                     text-white shadow-lg transition-all duration-150 text-base font-bold rounded-lg select-none
                     cursor-pointer flex items-center justify-center
                     ${pressedButton === 'munch' ? 'bg-yellow-600 scale-95' : ''}`}
          style={{ touchAction: 'manipulation', userSelect: 'none' }}
        >
          MUNCH
        </div>
      </div>
    </>
  );
}