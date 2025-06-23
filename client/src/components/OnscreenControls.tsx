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
    w-16 h-16 p-0 bg-black/60 hover:bg-black/80 border-2 border-white/30 
    text-white shadow-lg backdrop-blur-sm transition-all duration-150
    ${pressedButton === direction ? 'bg-blue-500 scale-95' : ''}
  `;

  return (
    <div className="fixed bottom-8 left-12 z-50">
      {/* D-pad style controls */}
      <div className="relative">
        {/* Up */}
        <Button
          className={`${buttonClass('up')} absolute -top-20 left-1/2 transform -translate-x-1/2`}
          onTouchStart={(e) => handleButtonPress('up', e)}
          onMouseDown={(e) => handleButtonPress('up', e)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronUp className="w-8 h-8" />
        </Button>

        {/* Left */}
        <Button
          className={`${buttonClass('left')} absolute top-0 -left-20`}
          onTouchStart={(e) => handleButtonPress('left', e)}
          onMouseDown={(e) => handleButtonPress('left', e)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>

        {/* Center (visual reference) */}
        <div className="w-16 h-16 bg-black/20 border-2 border-white/20 rounded-md" />

        {/* Right */}
        <Button
          className={`${buttonClass('right')} absolute top-0 -right-20`}
          onTouchStart={(e) => handleButtonPress('right', e)}
          onMouseDown={(e) => handleButtonPress('right', e)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>

        {/* Down */}
        <Button
          className={`${buttonClass('down')} absolute -bottom-20 left-1/2 transform -translate-x-1/2`}
          onTouchStart={(e) => handleButtonPress('down', e)}
          onMouseDown={(e) => handleButtonPress('down', e)}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronDown className="w-8 h-8" />
        </Button>
      </div>

      {/* Munch Button */}
      <div className="absolute -right-32 top-1/2 transform -translate-y-1/2">
        <Button
          className="w-20 h-20 p-0 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-300 
                     text-white shadow-lg transition-all duration-150 text-lg font-bold"
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

      {/* Instructions */}
      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          Move around, then MUNCH answers
        </div>
      </div>
    </div>
  );
}