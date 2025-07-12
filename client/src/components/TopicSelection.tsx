import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useGameState } from "../lib/stores/useGameState";
import { Calculator, BookOpen, Zap, HelpCircle, Gamepad2, Box, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function TopicSelection() {
  const { selectTopic, topicProvider, renderMode, toggleRenderMode } = useGameState();
  const [selectedCategories, setSelectedCategories] = useState<{[key: string]: string}>({
    math: 'random',
    words: 'random', 
    marvel: 'random',
    movies: 'random'
  });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  useEffect(() => {
    // Enable scrolling when topic selection is active
    document.body.classList.add('topic-selection-active');
    return () => {
      document.body.classList.remove('topic-selection-active');
    };
  }, []);

  const topics = [
    {
      id: 'math',
      name: 'Mathematics',
      description: 'Practice arithmetic, multiples, factors, and more!',
      icon: Calculator,
      color: 'from-cyan-500 to-blue-600',
      glowColor: 'shadow-cyan-500/50',
      available: true
    },
    {
      id: 'words',
      name: 'Word Games', 
      description: 'Find nouns, verbs, adjectives, and word patterns!',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-600',
      glowColor: 'shadow-green-500/50',
      available: true
    },
    {
      id: 'marvel',
      name: 'Marvel Universe',
      description: 'Heroes, villains, teams, and superpowers!',
      icon: Zap,
      color: 'from-red-500 to-pink-600',
      glowColor: 'shadow-red-500/50',
      available: true
    },
    {
      id: 'movies',
      name: 'Movie Trivia',
      description: 'Test your knowledge of films, actors, and directors!',
      icon: HelpCircle,
      color: 'from-purple-500 to-indigo-600',
      glowColor: 'shadow-purple-500/50',
      available: true
    },
    {
      id: 'custom',
      name: 'Create Custom Board',
      description: 'Generate a board about any topic you choose!',
      icon: Sparkles,
      color: 'from-pink-500 to-violet-600',
      glowColor: 'shadow-pink-500/50',
      available: true,
      isCustom: true
    }
  ];

  const handleTopicSelect = (topicId: string) => {
    if (topicId === 'custom') {
      setShowCustomModal(true);
      return;
    }
    
    // Store the selected category for this topic
    const selectedCategory = selectedCategories[topicId] || 'random';
    
    // Store category preference for when topic provider is created
    localStorage.setItem(`category_${topicId}`, selectedCategory);
    
    selectTopic(topicId);
  };
  
  const handleCustomTopicCreate = () => {
    const cleanTopic = customTopic.trim();
    
    // Input validation
    if (!cleanTopic) {
      alert('Please enter a topic!');
      return;
    }
    
    // Length validation
    if (cleanTopic.length < 2) {
      alert('Topic must be at least 2 characters long!');
      return;
    }
    
    if (cleanTopic.length > 50) {
      alert('Topic must be less than 50 characters long!');
      return;
    }
    
    // Content validation - check for inappropriate content
    const forbiddenWords = ['fuck', 'shit', 'damn', 'hell', 'ass', 'bitch', 'crap', 'piss'];
    const lowerTopic = cleanTopic.toLowerCase();
    
    if (forbiddenWords.some(word => lowerTopic.includes(word))) {
      alert('Please choose an appropriate educational topic!');
      return;
    }
    
    // Check for single character topics
    if (cleanTopic.length === 1) {
      alert('Please enter a more specific topic!');
      return;
    }
    
    // Check for only numbers
    if (/^\d+$/.test(cleanTopic)) {
      alert('Please enter a topic with letters!');
      return;
    }
    
    // Check for special characters only
    if (!/[a-zA-Z]/.test(cleanTopic)) {
      alert('Please enter a topic with alphabetic characters!');
      return;
    }
    
    // Store the custom topic
    localStorage.setItem('customTopic', cleanTopic);
    selectTopic('custom');
    setShowCustomModal(false);
    setCustomTopic('');
  };

  const getTopicCategories = (topicId: string) => {
    switch (topicId) {
      case 'math':
        return [
          { id: 'random', name: 'Random Mix' },
          { id: 'multiples', name: 'Multiples' },
          { id: 'factors', name: 'Factors' },
          { id: 'primes', name: 'Prime Numbers' },
          { id: 'squares', name: 'Perfect Squares' },
          { id: 'even_odd', name: 'Even/Odd' },
          { id: 'greater_less', name: 'Greater/Less Than' }
        ];
      case 'words':
        return [
          { id: 'random', name: 'Random Mix' },
          { id: 'nouns', name: 'Nouns' },
          { id: 'verbs', name: 'Verbs' },
          { id: 'adjectives', name: 'Adjectives' },
          { id: 'word_length', name: 'Word Length' },
          { id: 'word_endings', name: 'Word Endings' },
          { id: 'vowel_patterns', name: 'Vowel Patterns' }
        ];
      case 'marvel':
        return [
          { id: 'random', name: 'Random Mix' },
          { id: 'heroes', name: 'Heroes' },
          { id: 'villains', name: 'Villains' },
          { id: 'powers', name: 'Super Powers' },
          { id: 'teams', name: 'Teams' },
          { id: 'movies', name: 'MCU Movies' }
        ];
      case 'movies':
        return [
          { id: 'random', name: 'Random Mix' },
          { id: 'actors', name: 'Actors' },
          { id: 'directors', name: 'Directors' },
          { id: 'genres', name: 'Genres' },
          { id: 'decades', name: 'Decades' },
          { id: 'franchises', name: 'Franchises' },
          { id: 'awards', name: 'Awards' }
        ];
      default:
        return [];
    }
  };

  return (
    <div 
      className="fixed inset-0 overflow-auto topic-selection-container"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1e 100%)',
        fontFamily: 'Rajdhani, sans-serif'
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 min-h-screen flex flex-col">
        <div className="text-center mb-6">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 tracking-wider"
            style={{
              background: 'linear-gradient(45deg, #00f0ff 0%, #ff00aa 50%, #ffcc00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 240, 255, 0.5)'
            }}
          >
            mmmunchers
          </h1>
          <p className="text-cyan-300 text-base sm:text-lg tracking-wide">Choose your learning adventure</p>
        </div>

        {/* Render mode toggle */}
        <div className="flex justify-center mb-6 sticky top-4 z-20">
          <div 
            className="inline-flex items-center p-1 rounded-lg shadow-lg"
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              backdropFilter: 'blur(10px)'
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
              <Gamepad2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              2D Mode
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
              <Box className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              3D Mode
            </Button>
          </div>
        </div>

        {/* Topic cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            
            return (
              <div
                key={topic.id}
                className={`relative group ${!topic.available && 'opacity-50'}`}
              >
                {/* Glow effect */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-20 
                    rounded-xl blur-xl transition-opacity duration-500 ${topic.available ? '' : 'hidden'}`}
                />
                
                {/* Card content */}
                <div 
                  className="relative p-6 rounded-xl transition-all duration-300 transform group-hover:translate-y-[-2px]"
                  style={{
                    background: 'rgba(18, 18, 37, 0.8)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: topic.available 
                      ? '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : 'none'
                  }}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div 
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${topic.color} 
                        flex items-center justify-center shadow-lg ${topic.glowColor}
                        ${topic.available ? 'group-hover:shadow-xl group-hover:scale-110' : ''} 
                        transition-all duration-300`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white text-center mb-2 tracking-wide">
                    {topic.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-400 text-sm text-center mb-4 leading-relaxed">
                    {topic.description}
                  </p>
                  
                  {/* Category selector and button */}
                  {topic.available ? (
                    <div className="space-y-3">
                      {!topic.isCustom && (
                        <select
                          value={selectedCategories[topic.id] || 'random'}
                          onChange={(e) => {
                            setSelectedCategories(prev => ({...prev, [topic.id]: e.target.value}));
                          }}
                          className="w-full h-12 bg-black/40 text-cyan-300 border border-cyan-900/50 hover:border-cyan-700/50 hover:bg-black/60 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          {getTopicCategories(topic.id).map((option) => (
                            <option key={option.id} value={option.id} className="bg-gray-900 text-white">
                              {option.name}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      <Button 
                        className={`w-full bg-gradient-to-r ${topic.color} text-white font-bold 
                          py-3 rounded-lg transform transition-all duration-200 
                          hover:scale-105 hover:shadow-lg ${topic.glowColor}`}
                        onClick={() => handleTopicSelect(topic.id)}
                      >
                        {topic.isCustom ? 'CREATE BOARD' : 'START GAME'}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      disabled 
                      className="w-full bg-gray-800 text-gray-500 cursor-not-allowed py-3 rounded-lg"
                    >
                      COMING SOON
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Topic Modal */}
      {showCustomModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowCustomModal(false)}
        >
          <div 
            className="relative max-w-md w-full p-8 rounded-2xl"
            style={{
              background: 'rgba(18, 18, 37, 0.95)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 80px rgba(0, 240, 255, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 
              className="text-3xl font-bold text-center mb-6"
              style={{
                background: 'linear-gradient(45deg, #00f0ff, #ff00aa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Create Custom Board
            </h2>
            
            <p className="text-gray-400 text-center mb-6">
              Enter any topic and our AI will generate a unique learning experience!
            </p>
            
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomTopicCreate()}
              placeholder="e.g., Dinosaurs, Space, Music..."
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-cyan-900/50 
                text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 
                focus:shadow-lg focus:shadow-cyan-500/20 transition-all duration-200"
              autoFocus
            />
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-lg transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomTopicCreate}
                disabled={!customTopic.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg 
                  transform transition-all duration-200 hover:scale-105 hover:shadow-lg 
                  shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Create Board
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              {import.meta.env.VITE_AI_API_KEY ? 'AI-powered' : 'Mock content'} generation
            </p>
          </div>
        </div>
      )}
    </div>
  );
}