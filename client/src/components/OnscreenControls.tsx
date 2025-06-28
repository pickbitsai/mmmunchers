import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface OnscreenControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onMunch: () => void;
}

export default function OnscreenControls({ onMove, onMunch }: OnscreenControlsProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const lastMoveTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  // Touch detection for mobile controls
  React.useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      if (e.type !== 'touchstart') return;
      
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate control areas based on fixed positioning
      const controlCenterX = windowWidth / 2;
      const controlCenterY = windowHeight - 100;
      const munchX = windowWidth - 60;
      const munchY = windowHeight - 100;
      const buttonSize = 56;
      
      // Check touch areas for each button
      if (Math.abs(x - controlCenterX) < buttonSize/2 && 
          Math.abs(y - (controlCenterY - 64)) < buttonSize/2) {
        handleButtonPress('up');
        e.preventDefault();
        return;
      }
      
      if (Math.abs(x - controlCenterX) < buttonSize/2 && 
          Math.abs(y - (controlCenterY + 64)) < buttonSize/2) {
        handleButtonPress('down');
        e.preventDefault();
        return;
      }
      
      if (Math.abs(x - (controlCenterX - 64)) < buttonSize/2 && 
          Math.abs(y - controlCenterY) < buttonSize/2) {
        handleButtonPress('left');
        e.preventDefault();
        return;
      }
      
      if (Math.abs(x - (controlCenterX + 64)) < buttonSize/2 && 
          Math.abs(y - controlCenterY) < buttonSize/2) {
        handleButtonPress('right');
        e.preventDefault();
        return;
      }
      
      if (Math.abs(x - munchX) < 40 && Math.abs(y - munchY) < 40) {
        handleMunchPress();
        e.preventDefault();
        return;
      }
    };

    document.addEventListener('touchstart', handleTouch, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  const handleButtonPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    const now = Date.now();
    
    // Prevent rapid-fire movements (debounce to 200ms)
    if (isProcessingRef.current || now - lastMoveTimeRef.current < 200) {
      return;
    }
    
    isProcessingRef.current = true;
    lastMoveTimeRef.current = now;
    
    setPressedButton(direction);
    onMove(direction);
    
    // Visual feedback and reset processing flag
    setTimeout(() => {
      setPressedButton(null);
      isProcessingRef.current = false;
    }, 150);
  };

  const handleMunchPress = () => {
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    
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
      
      {/* D-pad directional controls - centered below grid */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50" style={{ touchAction: 'none' }}>
        <div className="relative">
          {/* Up */}
          <div
            data-control="up"
            className={`${buttonClass('up')} absolute -top-16 left-1/2 transform -translate-x-1/2 rounded-md cursor-pointer flex items-center justify-center`}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
            onClick={() => handleButtonPress('up')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('up'); }}
          >
            <ChevronUp className="w-6 h-6 pointer-events-none" />
          </div>

          {/* Left */}
          <div
            data-control="left"
            className={`${buttonClass('left')} absolute top-0 -left-16 rounded-md cursor-pointer flex items-center justify-center`}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
            onClick={() => handleButtonPress('left')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('left'); }}
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
            onClick={() => handleButtonPress('right')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('right'); }}
          >
            <ChevronRight className="w-6 h-6 pointer-events-none" />
          </div>

          {/* Down */}
          <div
            data-control="down"
            className={`${buttonClass('down')} absolute -bottom-16 left-1/2 transform -translate-x-1/2 rounded-md cursor-pointer flex items-center justify-center`}
            style={{ touchAction: 'manipulation', userSelect: 'none' }}
            onClick={() => handleButtonPress('down')}
            onTouchStart={(e) => { e.preventDefault(); handleButtonPress('down'); }}
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
          onClick={handleMunchPress}
          onTouchStart={(e) => { e.preventDefault(); handleMunchPress(); }}
        >
          MUNCH
        </div>
      </div>
    </>
  );
}