import { Button } from "./ui/button";
import { useGameState, GameMode } from "../lib/stores/useGameState";
import { Swords, Timer, Skull, Leaf, Flame, ArrowLeft } from "lucide-react";

const modes: Array<{
  id: GameMode;
  name: string;
  description: string;
  detail: string;
  icon: typeof Swords;
  color: string;
  glowColor: string;
}> = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original experience',
    detail: 'Munch correct answers, dodge enemies, beat the clock. Earn bonus lives each level.',
    icon: Swords,
    color: 'from-cyan-500 to-blue-600',
    glowColor: 'shadow-cyan-500/50'
  },
  {
    id: 'time_attack',
    name: 'Time Attack',
    description: 'Race the clock',
    detail: '30 seconds on the clock. +5s for correct, -3s for wrong. No enemies, pure speed.',
    icon: Timer,
    color: 'from-orange-500 to-red-600',
    glowColor: 'shadow-orange-500/50'
  },
  {
    id: 'trog_attack',
    name: 'Trog Attack',
    description: 'Survive the swarm',
    detail: 'Enemies come fast and thick. No timer, 5 lives. Can you outlast the horde?',
    icon: Skull,
    color: 'from-red-500 to-pink-700',
    glowColor: 'shadow-red-500/50'
  },
  {
    id: 'zen',
    name: 'Zen',
    description: 'Learn at your own pace',
    detail: 'No enemies, no timer, no pressure. Just you and the board. Perfect for practice.',
    icon: Leaf,
    color: 'from-green-500 to-emerald-600',
    glowColor: 'shadow-green-500/50'
  },
  {
    id: 'streak',
    name: 'Streak',
    description: 'How far can you go?',
    detail: 'Chain correct answers for a growing multiplier. One wrong answer ends it all.',
    icon: Flame,
    color: 'from-yellow-500 to-orange-600',
    glowColor: 'shadow-yellow-500/50'
  }
];

export default function ModeSelection() {
  const { setGameMode, goToMainMenu } = useGameState();

  return (
    <div
      className="fixed inset-0 overflow-auto"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1e 100%)',
        fontFamily: 'Rajdhani, sans-serif'
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full opacity-20">
          {[...Array(30)].map((_, i) => (
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

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-cyan-300 mr-4"
            onClick={goToMainMenu}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <div>
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider"
              style={{
                background: 'linear-gradient(45deg, #00f0ff, #ff00aa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Choose Your Mode
            </h1>
            <p className="text-cyan-300/60 text-sm tracking-wide">How do you want to play?</p>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {modes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <button
                key={mode.id}
                className="relative group text-left"
                onClick={() => setGameMode(mode.id)}
              >
                {/* Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-20
                    rounded-xl blur-xl transition-opacity duration-500`}
                />

                {/* Card */}
                <div
                  className="relative p-5 rounded-xl transition-all duration-300 transform group-hover:translate-y-[-2px] h-full flex flex-col"
                  style={{
                    background: 'rgba(18, 18, 37, 0.8)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${mode.color}
                        flex items-center justify-center shadow-lg ${mode.glowColor}
                        group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide">{mode.name}</h3>
                      <p className="text-xs text-cyan-300/60">{mode.description}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed flex-1">{mode.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
