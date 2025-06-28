import { useState, useRef } from "react";
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

  const handleButtonPress = (direction: 'up' | 'down' | 'left' | 'right', event?: React.MouseEvent | React.TouchEvent) => {
    console.log('Button press detected:', direction, event?.type);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Add haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    const now = Date.now();
    
    // Prevent rapid-fire movements (debounce to 200ms)
    if (isProcessingRef.current || now - lastMoveTimeRef.current < 200) {
      console.log('Button press blocked by debounce');
      return;
    }
    
    isProcessingRef.current = true;
    lastMoveTimeRef.current = now;
    
    console.log('Executing move:', direction);
    setPressedButton(direction);
    onMove(direction);
    
    // Visual feedback and reset processing flag
    setTimeout(() => {
      setPressedButton(null);
      isProcessingRef.current = false;
    }, 150);
  };

  const handleMunchPress = (event?: React.MouseEvent | React.TouchEvent) => {
    console.log('Munch button press detected:', event?.type);
    
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
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
      {/* D-pad directional controls - centered below grid */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50" style={{ touchAction: 'none' }}>
        <div className="relative">
          {/* Up */}
          <button
            className={`${buttonClass('up')} absolute -top-16 left-1/2 transform -translate-x-1/2 rounded-md`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress('up', e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress('up', e);
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: 'none' }}
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          {/* Left */}
          <button
            className={`${buttonClass('left')} absolute top-0 -left-16 rounded-md`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress('left', e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress('left', e);
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: 'none' }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Center (visual reference) */}
          <div className="w-14 h-14 bg-black/20 border-2 border-white/20 rounded-md" />

          {/* Right */}
          <button
            className={`${buttonClass('right')} absolute top-0 -right-16 rounded-md`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress('right', e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress('right', e);
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: 'none' }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Down */}
          <button
            className={`${buttonClass('down')} absolute -bottom-16 left-1/2 transform -translate-x-1/2 rounded-md`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonPress('down', e);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleButtonPress('down', e);
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: 'none' }}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Munch Button - right side of screen */}
      <div className="fixed right-4 bottom-20 z-50" style={{ touchAction: 'none' }}>
        <button
          className={`w-20 h-20 p-0 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-300 
                     text-white shadow-lg transition-all duration-150 text-base font-bold rounded-lg select-none
                     ${pressedButton === 'munch' ? 'bg-yellow-600 scale-95' : ''}`}
          onTouchStart={(e) => {
            e.preventDefault();
            handleMunchPress(e);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleMunchPress(e);
          }}
          onContextMenu={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
        >
          MUNCH
        </button>
      </div>
    </>
  );
}