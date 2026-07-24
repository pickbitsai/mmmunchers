import { Button } from "./ui/button";
import { useGameState } from "../lib/stores/useGameState";
import { Gamepad2, Box, Volume2, VolumeX, BookOpen, Atom, Play } from "lucide-react";
import { useAudio } from "../lib/stores/useAudio";

export default function MainMenu() {
  const { goToModeSelection, renderMode, toggleRenderMode } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 30% 40%, #0d1b3a 0%, #060a18 55%, #03040a 100%)',
        fontFamily: 'Rajdhani, sans-serif',
      }}
    >
      {/* Tech grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 45%, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 45%, black 30%, transparent 90%)',
        }}
      />

      {/* Concentric sonar rings (echoes the key art) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border animate-pulse"
            style={{
              width: `${420 + i * 220}px`,
              height: `${420 + i * 220}px`,
              borderColor: 'rgba(56,189,248,0.12)',
              animationDelay: `${i * 0.8}s`,
              animationDuration: '4s',
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              background: i % 3 === 0 ? '#84cc16' : '#38bdf8',
              animationDelay: `${(i % 5) * 0.9}s`,
              animationDuration: `${3 + (i % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <span className="hidden sm:block h-px w-10 bg-gradient-to-r from-transparent to-cyan-400/60" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-cyan-300 text-sm sm:text-base font-semibold tracking-[0.35em] uppercase">
            Pickbits Arcade
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="hidden sm:block h-px w-10 bg-gradient-to-l from-transparent to-cyan-400/60" />
        </div>

        {/* Logo */}
        <h1
          className="select-none leading-none"
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(3.5rem, 13vw, 8.5rem)',
            letterSpacing: '0.02em',
            transform: 'scaleY(1.08)',
            background: 'linear-gradient(180deg, #bef264 0%, #84cc16 45%, #4d7c0f 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter:
              'drop-shadow(0 1px 0 #3f6212) drop-shadow(0 2px 0 #365314) drop-shadow(0 3px 0 #2a410f) drop-shadow(0 4px 0 #1f300b) drop-shadow(0 5px 0 #16230a) drop-shadow(0 7px 10px rgba(0,0,0,0.6)) drop-shadow(0 0 22px rgba(132,204,22,0.5))',
          }}
        >
          MMMUNCHERS
        </h1>

        {/* Tagline */}
        <p className="mt-6 text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>
          <span className="text-white">Learn the maze. </span>
          <span className="text-lime-400">Munch the answer.</span>
        </p>

        {/* Play button */}
        <Button
          className="group mt-10 px-14 py-7 text-2xl font-extrabold rounded-2xl text-[#0b1a02]
            bg-gradient-to-b from-lime-300 to-green-500 border-b-4 border-green-700
            transform transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-lime-500/40
            active:translate-y-0.5 active:border-b-2"
          style={{ fontFamily: 'Nunito, sans-serif' }}
          onClick={goToModeSelection}
        >
          <Play className="w-6 h-6 mr-2 fill-current" />
          PLAY
        </Button>

        {/* Feature chips */}
        <div className="mt-12 w-full max-w-xl">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <div className="grid grid-cols-3 items-center py-5">
            <Feature icon={<BookOpen className="w-6 h-6" />} color="#84cc16" label="Educational Arcade" />
            <div className="flex justify-center">
              <Feature
                icon={<Atom className="w-6 h-6" />}
                color="#a855f7"
                label="11 Topics"
                bordered
              />
            </div>
            <Feature icon={<Box className="w-6 h-6" />} color="#f59e0b" label="2D + 3D Modes" />
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        </div>

        {/* Settings row */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div
            className="inline-flex items-center p-1 rounded-lg"
            style={{
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.25)',
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                renderMode === '2d'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
              onClick={() => renderMode !== '2d' && toggleRenderMode()}
            >
              <Gamepad2 className="w-4 h-4 mr-1" />
              2D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                renderMode === '3d'
                  ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-cyan-300'
              }`}
              onClick={() => renderMode !== '3d' && toggleRenderMode()}
            >
              <Box className="w-4 h-4 mr-1" />
              3D
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-2 text-gray-400 hover:text-cyan-300 transition-all"
            style={{
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.25)',
            }}
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-10">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
          <span className="text-cyan-300/80 text-xs sm:text-sm font-semibold tracking-[0.35em] uppercase">
            A Pickbits.ai Game
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  color,
  label,
  bordered = false,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 px-2 ${
        bordered ? 'sm:border-x sm:border-cyan-400/20' : ''
      }`}
    >
      <div style={{ color, filter: `drop-shadow(0 0 8px ${color}66)` }}>{icon}</div>
      <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-gray-300">
        {label}
      </span>
    </div>
  );
}
