import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface OnscreenControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
}

export default function OnscreenControls({ onMove }: OnscreenControlsProps) {
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const handleButtonPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPressedButton(direction);
    onMove(direction);
    
    // Visual feedback
    setTimeout(() => setPressedButton(null), 150);
  };

  const buttonClass = (direction: string) => `
    w-16 h-16 p-0 bg-black/60 hover:bg-black/80 border-2 border-white/30 
    text-white shadow-lg backdrop-blur-sm transition-all duration-150
    ${pressedButton === direction ? 'bg-blue-500 scale-95' : ''}
  `;

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {/* D-pad style controls */}
      <div className="relative">
        {/* Up */}
        <Button
          className={`${buttonClass('up')} absolute -top-20 left-1/2 transform -translate-x-1/2`}
          onTouchStart={() => handleButtonPress('up')}
          onMouseDown={() => handleButtonPress('up')}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronUp className="w-8 h-8" />
        </Button>

        {/* Left */}
        <Button
          className={`${buttonClass('left')} absolute top-0 -left-20`}
          onTouchStart={() => handleButtonPress('left')}
          onMouseDown={() => handleButtonPress('left')}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>

        {/* Center (visual reference) */}
        <div className="w-16 h-16 bg-black/20 border-2 border-white/20 rounded-md" />

        {/* Right */}
        <Button
          className={`${buttonClass('right')} absolute top-0 -right-20`}
          onTouchStart={() => handleButtonPress('right')}
          onMouseDown={() => handleButtonPress('right')}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>

        {/* Down */}
        <Button
          className={`${buttonClass('down')} absolute -bottom-20 left-1/2 transform -translate-x-1/2`}
          onTouchStart={() => handleButtonPress('down')}
          onMouseDown={() => handleButtonPress('down')}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ChevronDown className="w-8 h-8" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          Move to munch answers
        </div>
      </div>
    </div>
  );
}