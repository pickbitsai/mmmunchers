import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { useGameState, GameMode } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import {
  Gamepad2, Box, Volume2, VolumeX, BookOpen, Atom, Play,
  Swords, Timer, Skull, Leaf, Flame, ChevronDown, Check,
  Calculator, Zap, Film, FlaskConical, Landmark, Globe,
  PawPrint, Bone, Music, Waves,
} from "lucide-react";

const modes: Array<{
  id: GameMode;
  name: string;
  description: string;
  icon: typeof Swords;
  color: string;
  glowColor: string;
}> = [
  { id: 'classic', name: 'Classic', description: 'Munch, dodge, survive', icon: Swords, color: 'from-cyan-500 to-blue-600', glowColor: 'shadow-cyan-500/50' },
  { id: 'time_attack', name: 'Time Attack', description: 'Race the clock', icon: Timer, color: 'from-orange-500 to-red-600', glowColor: 'shadow-orange-500/50' },
  { id: 'trog_attack', name: 'Trog Attack', description: 'Survive the swarm', icon: Skull, color: 'from-red-500 to-pink-700', glowColor: 'shadow-red-500/50' },
  { id: 'zen', name: 'Zen', description: 'No pressure, just practice', icon: Leaf, color: 'from-green-500 to-emerald-600', glowColor: 'shadow-green-500/50' },
  { id: 'streak', name: 'Streak', description: 'Chain correct answers', icon: Flame, color: 'from-yellow-500 to-orange-600', glowColor: 'shadow-yellow-500/50' },
];

const topics = [
  {
    id: 'math', name: 'Mathematics', icon: Calculator, color: 'from-cyan-500 to-blue-600', glowColor: 'shadow-cyan-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'multiples', name: 'Multiples' }, { id: 'factors', name: 'Factors' },
      { id: 'primes', name: 'Prime Numbers' }, { id: 'squares', name: 'Perfect Squares' }, { id: 'even_odd', name: 'Even/Odd' },
      { id: 'greater_less', name: 'Greater/Less Than' },
    ],
  },
  {
    id: 'words', name: 'Word Games', icon: BookOpen, color: 'from-green-500 to-emerald-600', glowColor: 'shadow-green-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'nouns', name: 'Nouns' }, { id: 'verbs', name: 'Verbs' },
      { id: 'adjectives', name: 'Adjectives' }, { id: 'word_length', name: 'Word Length' }, { id: 'word_endings', name: 'Word Endings' },
      { id: 'vowel_patterns', name: 'Vowel Patterns' },
    ],
  },
  {
    id: 'science', name: 'Science', icon: FlaskConical, color: 'from-violet-500 to-purple-600', glowColor: 'shadow-violet-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'elements', name: 'Elements' }, { id: 'planets', name: 'Planets & Space' },
      { id: 'biology', name: 'Biology' }, { id: 'physics', name: 'Physics' }, { id: 'chemistry', name: 'Chemistry' },
      { id: 'scientists', name: 'Famous Scientists' },
    ],
  },
  {
    id: 'history', name: 'History', icon: Landmark, color: 'from-amber-500 to-yellow-600', glowColor: 'shadow-amber-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'ancient', name: 'Ancient Civilizations' }, { id: 'leaders', name: 'World Leaders' },
      { id: 'events', name: 'Major Events' }, { id: 'inventions', name: 'Inventions' }, { id: 'egypt', name: 'Ancient Egypt' },
      { id: 'wars', name: 'Wars & Conflicts' },
    ],
  },
  {
    id: 'geography', name: 'Geography', icon: Globe, color: 'from-teal-500 to-cyan-600', glowColor: 'shadow-teal-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'countries', name: 'Countries' }, { id: 'capitals', name: 'Capital Cities' },
      { id: 'continents', name: 'Continents & Oceans' }, { id: 'landmarks', name: 'Famous Landmarks' }, { id: 'rivers', name: 'Rivers & Mountains' },
    ],
  },
  {
    id: 'animals', name: 'Animals', icon: PawPrint, color: 'from-lime-500 to-green-600', glowColor: 'shadow-lime-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'mammals', name: 'Mammals' }, { id: 'birds', name: 'Birds' },
      { id: 'reptiles', name: 'Reptiles & Amphibians' }, { id: 'ocean', name: 'Ocean Life' }, { id: 'insects', name: 'Insects & Bugs' },
      { id: 'predators', name: 'Predators' },
    ],
  },
  {
    id: 'dinosaurs', name: 'Dinosaurs', icon: Bone, color: 'from-stone-500 to-orange-700', glowColor: 'shadow-stone-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'carnivores', name: 'Carnivores' }, { id: 'herbivores', name: 'Herbivores' },
      { id: 'flying', name: 'Flying & Marine' }, { id: 'periods', name: 'Time Periods' }, { id: 'features', name: 'Dino Features' },
    ],
  },
  {
    id: 'marvel', name: 'Marvel Universe', icon: Zap, color: 'from-red-500 to-pink-600', glowColor: 'shadow-red-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'heroes', name: 'Superheroes' }, { id: 'villains', name: 'Villains' },
      { id: 'teams', name: 'Teams' }, { id: 'powers', name: 'Superpowers' }, { id: 'locations', name: 'Locations' },
    ],
  },
  {
    id: 'movies', name: 'Movie Trivia', icon: Film, color: 'from-purple-500 to-indigo-600', glowColor: 'shadow-purple-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'actors', name: 'Famous Actors' }, { id: 'directors', name: 'Directors' },
      { id: 'genres', name: 'Movie Genres' }, { id: 'decades', name: 'Movie Decades' }, { id: 'franchises', name: 'Movie Franchises' },
      { id: 'awards', name: 'Award Winners' },
    ],
  },
  {
    id: 'music', name: 'Music', icon: Music, color: 'from-pink-500 to-rose-600', glowColor: 'shadow-pink-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'instruments', name: 'Instruments' }, { id: 'genres', name: 'Genres' },
      { id: 'theory', name: 'Music Theory' }, { id: 'artists', name: 'Famous Musicians' }, { id: 'jazz', name: 'Jazz' },
    ],
  },
  {
    id: 'surfing', name: 'Surfing', icon: Waves, color: 'from-sky-500 to-blue-600', glowColor: 'shadow-sky-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' }, { id: 'equipment', name: 'Equipment' }, { id: 'techniques', name: 'Techniques' },
      { id: 'waves', name: 'Waves & Conditions' }, { id: 'spots', name: 'Famous Surf Spots' }, { id: 'culture', name: 'Surf Culture' },
    ],
  },
];

export default function MainMenu() {
  const { setGameMode, selectTopic, renderMode, toggleRenderMode } = useGameState();
  const { isMuted, toggleMute } = useAudio();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});
  const topicSectionRef = useRef<HTMLDivElement>(null);

  const selectedModeInfo = modes.find((m) => m.id === selectedMode) ?? null;

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    requestAnimationFrame(() => {
      topicSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleStartTopic = (topicId: string) => {
    if (!selectedMode) return;
    const category = selectedCategories[topicId] || 'random';
    localStorage.setItem(`category_${topicId}`, category);
    setGameMode(selectedMode);
    selectTopic(topicId);
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 30% 15%, #0d1b3a 0%, #060a18 55%, #03040a 100%)',
        fontFamily: 'Rajdhani, sans-serif',
      }}
    >
      {/* Tech grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 30%, transparent 90%)',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pb-16 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mt-10 mb-4">
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
            fontSize: 'clamp(2.75rem, 10vw, 6rem)',
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
        <p className="mt-4 text-lg sm:text-2xl md:text-3xl" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>
          <span className="text-white">Learn the maze. </span>
          <span className="text-lime-400">Munch the answer.</span>
        </p>

        {/* Settings row */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div
            className="inline-flex items-center p-1 rounded-lg"
            style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-2 text-xs sm:text-sm font-semibold transition-all ${
                renderMode === '2d' ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-cyan-300'
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
                renderMode === '3d' ? 'bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-cyan-300'
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
            style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Feature chips */}
        <div className="mt-6 w-full max-w-xl">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
          <div className="grid grid-cols-3 items-center py-4">
            <Feature icon={<BookOpen className="w-5 h-5" />} color="#84cc16" label="Educational Arcade" />
            <div className="flex justify-center">
              <Feature icon={<Atom className="w-5 h-5" />} color="#a855f7" label="11 Topics" bordered />
            </div>
            <Feature icon={<Box className="w-5 h-5" />} color="#f59e0b" label="2D + 3D Modes" />
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        </div>

        {/* Step 1: Mode */}
        <div className="w-full mt-10">
          <div className="flex items-center gap-3 mb-4">
            <StepBadge active={!selectedMode} done={!!selectedMode} number={1} />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide text-left">
              Choose Your Mode
            </h2>
            {selectedModeInfo && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-cyan-300/70 hover:text-cyan-300 text-xs"
                onClick={() => setSelectedMode(null)}
              >
                Change
              </Button>
            )}
          </div>

          {selectedModeInfo ? (
            <button
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background: 'rgba(18, 18, 37, 0.8)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
              }}
              onClick={() => setSelectedMode(null)}
            >
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${selectedModeInfo.color} flex items-center justify-center shrink-0`}>
                <selectedModeInfo.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-bold">{selectedModeInfo.name}</div>
                <div className="text-cyan-300/60 text-xs">{selectedModeInfo.description}</div>
              </div>
              <Check className="w-5 h-5 text-lime-400 ml-auto shrink-0" />
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {modes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <button
                    key={mode.id}
                    className="relative group text-left"
                    onClick={() => handleSelectMode(mode.id)}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-20 rounded-xl blur-xl transition-opacity duration-500`}
                    />
                    <div
                      className="relative p-3 rounded-xl transition-all duration-300 transform group-hover:-translate-y-0.5 flex flex-col items-center text-center gap-2"
                      style={{
                        background: 'rgba(18, 18, 37, 0.8)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${mode.color} flex items-center justify-center shadow-lg ${mode.glowColor} group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{mode.name}</h3>
                        <p className="text-[11px] text-cyan-300/60 leading-snug">{mode.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Topic (cascades in once a mode is chosen) */}
        <div
          ref={topicSectionRef}
          className="w-full mt-8 scroll-mt-6 transition-all duration-500"
          style={{
            opacity: selectedMode ? 1 : 0.35,
            pointerEvents: selectedMode ? 'auto' : 'none',
            filter: selectedMode ? 'none' : 'blur(1px) grayscale(0.4)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <StepBadge active={!!selectedMode} done={false} number={2} />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide text-left">
              Choose Your Topic
            </h2>
            <ChevronDown className={`w-5 h-5 text-cyan-400 ml-1 transition-transform ${selectedMode ? 'animate-bounce' : ''}`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {topics.map((topic) => {
              const IconComponent = topic.icon;
              return (
                <div key={topic.id} className="relative group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-20 rounded-xl blur-xl transition-opacity duration-500`}
                  />
                  <div
                    className="relative p-3 rounded-xl transition-all duration-300 transform group-hover:-translate-y-0.5 flex flex-col gap-2"
                    style={{
                      background: 'rgba(18, 18, 37, 0.8)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${topic.color} flex items-center justify-center shadow-lg ${topic.glowColor} group-hover:scale-110 transition-all duration-300 shrink-0`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-wide text-left truncate">{topic.name}</h3>
                    </div>

                    <select
                      value={selectedCategories[topic.id] || 'random'}
                      onChange={(e) => setSelectedCategories((prev) => ({ ...prev, [topic.id]: e.target.value }))}
                      className="w-full h-8 bg-black/40 text-cyan-300 border border-cyan-900/50 hover:border-cyan-700/50 rounded-md px-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      {topic.categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-gray-900 text-white">
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <Button
                      className={`w-full bg-gradient-to-r ${topic.color} text-white font-bold py-1.5 text-xs rounded-lg transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${topic.glowColor}`}
                      onClick={() => handleStartTopic(topic.id)}
                      disabled={!selectedMode}
                    >
                      <Play className="w-3 h-3 mr-1 fill-current" />
                      START
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-12">
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

function StepBadge({ active, done, number }: { active: boolean; done: boolean; number: number }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors"
      style={{
        background: done ? 'rgba(132,204,22,0.2)' : active ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${done ? '#84cc16' : active ? '#38bdf8' : 'rgba(255,255,255,0.15)'}`,
        color: done ? '#a3e635' : active ? '#7dd3fc' : 'rgba(255,255,255,0.4)',
      }}
    >
      {done ? <Check className="w-4 h-4" /> : number}
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
    <div className={`flex flex-col items-center gap-2 px-2 ${bordered ? 'sm:border-x sm:border-cyan-400/20' : ''}`}>
      <div style={{ color, filter: `drop-shadow(0 0 8px ${color}66)` }}>{icon}</div>
      <span className="text-[10px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-gray-300">
        {label}
      </span>
    </div>
  );
}
