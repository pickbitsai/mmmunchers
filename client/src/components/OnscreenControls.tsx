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
    if (event) {
      event.preventDefault();
      event.stopPropagation();
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

  const buttonClass = (direction: string) => `
    w-14 h-14 p-0 bg-black/60 hover:bg-black/80 border-2 border-white/30 
    text-white shadow-lg backdrop-blur-sm transition-all duration-150
    ${pressedButton === direction ? 'bg-blue-500 scale-95' : ''}
  `;

  return (
    <>
      {/* D-pad directional controls - centered below grid */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
        <div className="relative">
          {/* Up */}
          <Button
            className={`${buttonClass('up')} absolute -top-16 left-1/2 transform -translate-x-1/2`}
            onTouchStart={(e) => handleButtonPress('up', e)}
            onMouseDown={(e) => handleButtonPress('up', e)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronUp className="w-6 h-6" />
          </Button>

          {/* Left */}
          <Button
            className={`${buttonClass('left')} absolute top-0 -left-16`}
            onTouchStart={(e) => handleButtonPress('left', e)}
            onMouseDown={(e) => handleButtonPress('left', e)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Center (visual reference) */}
          <div className="w-14 h-14 bg-black/20 border-2 border-white/20 rounded-md" />

          {/* Right */}
          <Button
            className={`${buttonClass('right')} absolute top-0 -right-16`}
            onTouchStart={(e) => handleButtonPress('right', e)}
            onMouseDown={(e) => handleButtonPress('right', e)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Down */}
          <Button
            className={`${buttonClass('down')} absolute -bottom-16 left-1/2 transform -translate-x-1/2`}
            onTouchStart={(e) => handleButtonPress('down', e)}
            onMouseDown={(e) => handleButtonPress('down', e)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Munch Button - right side of screen */}
      <div className="fixed right-4 bottom-20 z-50">
        <Button
          className="w-20 h-20 p-0 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-300 
                     text-white shadow-lg transition-all duration-150 text-base font-bold rounded-lg"
          onTouchStart={() => {
            setPressedButton('munch');
            onMunch();
            setTimeout(() => setPressedButton(null), 150);
          }}
          onMouseDown={() => {
            setPressedButton('munch');
            onMunch();
            setTimeout(() => setPressedButton(null), 150);
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          MUNCH
        </Button>
      </div>
    </>
  );
}