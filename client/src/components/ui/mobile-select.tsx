import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  name: string;
}

interface MobileSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function MobileSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  triggerClassName,
  contentClassName
}: MobileSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    options.find(option => option.id === value) || null
  );
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number; shouldDropUp: boolean }>({
    top: 0,
    left: 0,
    width: 0,
    shouldDropUp: false
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateDropdownPosition = () => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = Math.min(240, options.length * 52); // max-h-60 = 240px, each item ~52px
    
    // Check if dropdown would extend beyond viewport bottom
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldDropUp = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    
    // Calculate position
    const top = shouldDropUp 
      ? rect.top - dropdownHeight - 4 
      : rect.bottom + 4;
    
    // Ensure dropdown doesn't go beyond viewport edges
    const left = Math.max(8, Math.min(rect.left, viewportWidth - rect.width - 8));
    
    setDropdownPosition({
      top,
      left,
      width: rect.width,
      shouldDropUp
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isOpen) {
      calculateDropdownPosition();
    }
    
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: Option, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOption(option);
    onValueChange(option.id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-12 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName
        )}
        onClick={handleToggle}
        onTouchEnd={handleToggle}
        style={{ 
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <span className={cn(
          "truncate",
          !selectedOption && "text-muted-foreground"
        )}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 opacity-50 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: 2147483646 }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown content */}
          <div 
            className={cn(
              "fixed max-h-60 overflow-auto rounded-md border shadow-2xl transition-all duration-200",
              contentClassName || "bg-gray-900 text-white border-gray-700",
              dropdownPosition.shouldDropUp ? "animate-in slide-in-from-bottom-2" : "animate-in slide-in-from-top-2"
            )}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              left: dropdownPosition.left,
              top: dropdownPosition.top,
              width: dropdownPosition.width,
              zIndex: 2147483647,
              maxHeight: Math.min(240, window.innerHeight - dropdownPosition.top - 16)
            }}
          >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-3 pl-3 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                option.id === value && "bg-accent text-accent-foreground"
              )}
              onClick={(e) => handleOptionSelect(option, e)}
              onTouchEnd={(e) => handleOptionSelect(option, e)}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <span className="truncate">{option.name}</span>
              {option.id === value && (
                <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </button>
          ))}
          </div>
        </>
      )}
    </div>
  );
}