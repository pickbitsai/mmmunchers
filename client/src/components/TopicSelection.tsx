import { Button } from "./ui/button";
import { useGameState } from "../lib/stores/useGameState";
import {
  Calculator, BookOpen, Zap, Film, FlaskConical, Landmark,
  Globe, PawPrint, Bone, Music, Waves, ArrowLeft
} from "lucide-react";
import { useState } from "react";

const topics = [
  {
    id: 'math',
    name: 'Mathematics',
    description: 'Multiples, factors, primes, and more',
    icon: Calculator,
    color: 'from-cyan-500 to-blue-600',
    glowColor: 'shadow-cyan-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'multiples', name: 'Multiples' },
      { id: 'factors', name: 'Factors' },
      { id: 'primes', name: 'Prime Numbers' },
      { id: 'squares', name: 'Perfect Squares' },
      { id: 'even_odd', name: 'Even/Odd' },
      { id: 'greater_less', name: 'Greater/Less Than' }
    ]
  },
  {
    id: 'words',
    name: 'Word Games',
    description: 'Nouns, verbs, adjectives, patterns',
    icon: BookOpen,
    color: 'from-green-500 to-emerald-600',
    glowColor: 'shadow-green-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'nouns', name: 'Nouns' },
      { id: 'verbs', name: 'Verbs' },
      { id: 'adjectives', name: 'Adjectives' },
      { id: 'word_length', name: 'Word Length' },
      { id: 'word_endings', name: 'Word Endings' },
      { id: 'vowel_patterns', name: 'Vowel Patterns' }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Elements, physics, biology, chemistry',
    icon: FlaskConical,
    color: 'from-violet-500 to-purple-600',
    glowColor: 'shadow-violet-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'elements', name: 'Elements' },
      { id: 'planets', name: 'Planets & Space' },
      { id: 'biology', name: 'Biology' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'scientists', name: 'Famous Scientists' }
    ]
  },
  {
    id: 'history',
    name: 'History',
    description: 'Civilizations, leaders, inventions',
    icon: Landmark,
    color: 'from-amber-500 to-yellow-600',
    glowColor: 'shadow-amber-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'ancient', name: 'Ancient Civilizations' },
      { id: 'leaders', name: 'World Leaders' },
      { id: 'events', name: 'Major Events' },
      { id: 'inventions', name: 'Inventions' },
      { id: 'egypt', name: 'Ancient Egypt' },
      { id: 'wars', name: 'Wars & Conflicts' }
    ]
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'Countries, capitals, landmarks',
    icon: Globe,
    color: 'from-teal-500 to-cyan-600',
    glowColor: 'shadow-teal-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'countries', name: 'Countries' },
      { id: 'capitals', name: 'Capital Cities' },
      { id: 'continents', name: 'Continents & Oceans' },
      { id: 'landmarks', name: 'Famous Landmarks' },
      { id: 'rivers', name: 'Rivers & Mountains' }
    ]
  },
  {
    id: 'animals',
    name: 'Animals',
    description: 'Mammals, birds, ocean life, insects',
    icon: PawPrint,
    color: 'from-lime-500 to-green-600',
    glowColor: 'shadow-lime-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'mammals', name: 'Mammals' },
      { id: 'birds', name: 'Birds' },
      { id: 'reptiles', name: 'Reptiles & Amphibians' },
      { id: 'ocean', name: 'Ocean Life' },
      { id: 'insects', name: 'Insects & Bugs' },
      { id: 'predators', name: 'Predators' }
    ]
  },
  {
    id: 'dinosaurs',
    name: 'Dinosaurs',
    description: 'T-Rex, fossils, prehistoric eras',
    icon: Bone,
    color: 'from-stone-500 to-orange-700',
    glowColor: 'shadow-stone-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'carnivores', name: 'Carnivores' },
      { id: 'herbivores', name: 'Herbivores' },
      { id: 'flying', name: 'Flying & Marine' },
      { id: 'periods', name: 'Time Periods' },
      { id: 'features', name: 'Dino Features' }
    ]
  },
  {
    id: 'marvel',
    name: 'Marvel Universe',
    description: 'Heroes, villains, teams, powers',
    icon: Zap,
    color: 'from-red-500 to-pink-600',
    glowColor: 'shadow-red-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'heroes', name: 'Superheroes' },
      { id: 'villains', name: 'Villains' },
      { id: 'teams', name: 'Teams' },
      { id: 'powers', name: 'Superpowers' },
      { id: 'locations', name: 'Locations' }
    ]
  },
  {
    id: 'movies',
    name: 'Movie Trivia',
    description: 'Actors, directors, genres, franchises',
    icon: Film,
    color: 'from-purple-500 to-indigo-600',
    glowColor: 'shadow-purple-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'actors', name: 'Famous Actors' },
      { id: 'directors', name: 'Directors' },
      { id: 'genres', name: 'Movie Genres' },
      { id: 'decades', name: 'Movie Decades' },
      { id: 'franchises', name: 'Movie Franchises' },
      { id: 'awards', name: 'Award Winners' }
    ]
  },
  {
    id: 'music',
    name: 'Music',
    description: 'Instruments, genres, theory, artists',
    icon: Music,
    color: 'from-pink-500 to-rose-600',
    glowColor: 'shadow-pink-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'instruments', name: 'Instruments' },
      { id: 'genres', name: 'Genres' },
      { id: 'theory', name: 'Music Theory' },
      { id: 'artists', name: 'Famous Musicians' },
      { id: 'jazz', name: 'Jazz' }
    ]
  },
  {
    id: 'surfing',
    name: 'Surfing',
    description: 'Waves, boards, techniques, culture',
    icon: Waves,
    color: 'from-sky-500 to-blue-600',
    glowColor: 'shadow-sky-500/50',
    categories: [
      { id: 'random', name: 'Random Mix' },
      { id: 'equipment', name: 'Equipment' },
      { id: 'techniques', name: 'Techniques' },
      { id: 'waves', name: 'Waves & Conditions' },
      { id: 'spots', name: 'Famous Surf Spots' },
      { id: 'culture', name: 'Surf Culture' }
    ]
  }
];

export default function TopicSelection() {
  const { selectTopic, gameMode, goToModeSelection } = useGameState();
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});

  const modeLabels: Record<string, string> = {
    classic: 'Classic',
    time_attack: 'Time Attack',
    trog_attack: 'Trog Attack',
    zen: 'Zen',
    streak: 'Streak'
  };

  const handleTopicSelect = (topicId: string) => {
    const selectedCategory = selectedCategories[topicId] || 'random';
    localStorage.setItem(`category_${topicId}`, selectedCategory);
    selectTopic(topicId);
  };

  return (
    <div
      className="fixed inset-0 overflow-auto topic-selection-container"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1e 100%)',
        fontFamily: 'Rajdhani, sans-serif'
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-full h-full opacity-20">
          {[...Array(40)].map((_, i) => (
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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-cyan-300 mr-4"
              onClick={goToModeSelection}
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
                Choose Your Topic
              </h1>
              <p className="text-cyan-300/60 text-sm tracking-wide">Pick a subject to study</p>
            </div>
          </div>

          {/* Mode badge */}
          <div
            className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-cyan-300"
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
            }}
          >
            {modeLabels[gameMode] || 'Classic'} Mode
          </div>
        </div>

        {/* Topic cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {topics.map((topic) => {
            const IconComponent = topic.icon;

            return (
              <div key={topic.id} className="relative group">
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-20
                    rounded-xl blur-xl transition-opacity duration-500`}
                />

                {/* Card */}
                <div
                  className="relative p-4 rounded-xl transition-all duration-300 transform group-hover:translate-y-[-2px] h-full flex flex-col"
                  style={{
                    background: 'rgba(18, 18, 37, 0.8)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${topic.color}
                        flex items-center justify-center shadow-lg ${topic.glowColor}
                        group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 shrink-0`}
                    >
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white tracking-wide truncate">{topic.name}</h3>
                      <p className="text-gray-400 text-xs truncate">{topic.description}</p>
                    </div>
                  </div>

                  {/* Category + Button */}
                  <div className="space-y-2 mt-auto pt-2">
                    <select
                      value={selectedCategories[topic.id] || 'random'}
                      onChange={(e) => {
                        setSelectedCategories(prev => ({ ...prev, [topic.id]: e.target.value }));
                      }}
                      className="w-full h-9 bg-black/40 text-cyan-300 border border-cyan-900/50 hover:border-cyan-700/50 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      {topic.categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-gray-900 text-white">
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <Button
                      className={`w-full bg-gradient-to-r ${topic.color} text-white font-bold
                        py-2 text-sm rounded-lg transform transition-all duration-200
                        hover:scale-105 hover:shadow-lg ${topic.glowColor}`}
                      onClick={() => handleTopicSelect(topic.id)}
                    >
                      START
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
