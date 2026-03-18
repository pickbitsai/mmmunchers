import { Button } from "./ui/button";
import { useGameState } from "../lib/stores/useGameState";
import { Gamepad2, Box, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../lib/stores/useAudio";

export default function MainMenu() {
  const { goToModeSelection, renderMode, toggleRenderMode } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1e 100%)',
        fontFamily: 'Rajdhani, sans-serif'
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center">
        {/* Title */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-wider"
          style={{
            background: 'linear-gradient(45deg, #00f0ff 0%, #ff00aa 50%, #ffcc00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 60px rgba(0, 240, 255, 0.5)'
          }}
        >
          mmmunchers
        </h1>
        <p className="text-cyan-300/70 text-sm sm:text-base tracking-widest uppercase mb-12">
          Educational 3D Learning Game
        </p>

        {/* Play Button */}
        <Button
          className="px-12 py-6 text-xl sm:text-2xl font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white
            transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/40
            active:scale-95 mb-8"
          onClick={goToModeSelection}
        >
          PLAY
        </Button>

        {/* Settings Row */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* Render Mode Toggle */}
          <div
            className="inline-flex items-center p-1 rounded-lg"
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
                renderMode === '2d'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
              onClick={() => renderMode !== '2d' && toggleRenderMode()}
            >
              <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              2D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
                renderMode === '3d'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
              onClick={() => renderMode !== '3d' && toggleRenderMode()}
            >
              <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              3D
            </Button>
          </div>

          {/* Audio Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-2 text-gray-400 hover:text-cyan-300 transition-all"
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
            }}
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
