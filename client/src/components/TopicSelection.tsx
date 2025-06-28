import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { MobileSelect } from "./ui/mobile-select";
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
      color: 'bg-blue-500 hover:bg-blue-600',
      available: true
    },
    {
      id: 'words',
      name: 'Word Games', 
      description: 'Find nouns, verbs, adjectives, and word patterns!',
      icon: BookOpen,
      color: 'bg-green-500 hover:bg-green-600',
      available: true
    },
    {
      id: 'marvel',
      name: 'Marvel Universe',
      description: 'Heroes, villains, teams, and superpowers!',
      icon: Zap,
      color: 'bg-red-500 hover:bg-red-600',
      available: true
    },
    {
      id: 'movies',
      name: 'Movie Trivia',
      description: 'Test your knowledge of films, actors, and directors!',
      icon: HelpCircle,
      color: 'bg-purple-500 hover:bg-purple-600',
      available: true
    },
    {
      id: 'custom',
      name: 'Create Custom Board',
      description: 'Generate a board about any topic you choose!',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
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
    if (customTopic.trim()) {
      // Store the custom topic
      localStorage.setItem('customTopic', customTopic);
      selectTopic('custom');
      setShowCustomModal(false);
    }
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
          { id: 'heroes', name: 'Superheroes' },
          { id: 'villains', name: 'Villains' },
          { id: 'teams', name: 'Teams' },
          { id: 'powers', name: 'Superpowers' },
          { id: 'locations', name: 'Locations' }
        ];
      case 'movies':
        return [
          { id: 'random', name: 'Random Mix' },
          { id: 'actors', name: 'Famous Actors' },
          { id: 'directors', name: 'Directors' },
          { id: 'genres', name: 'Movie Genres' },
          { id: 'decades', name: 'Movie Decades' },
          { id: 'franchises', name: 'Movie Franchises' },
          { id: 'awards', name: 'Award Winners' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 topic-selection-container">
      <div className="flex items-center justify-center min-h-full p-4" style={{ paddingTop: 'max(env(safe-area-inset-top), 8rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)' }}>
        <div className="container max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">Number Munchers</h1>
            <p className="text-lg text-gray-300">Educational Adventure Game</p>
          </div>

          <Card className="bg-black/40 border-gray-600 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-center text-white">Choose Your Topic</CardTitle>
              <div className="flex justify-center mt-4">
                <div className="inline-flex items-center bg-black/40 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-1 text-xs ${
                      renderMode === '2d' 
                        ? 'bg-white/20 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => renderMode !== '2d' && toggleRenderMode()}
                  >
                    <Gamepad2 className="w-4 h-4 mr-1" />
                    2D Mode
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-1 text-xs ${
                      renderMode === '3d' 
                        ? 'bg-white/20 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => renderMode !== '3d' && toggleRenderMode()}
                  >
                    <Box className="w-4 h-4 mr-1" />
                    3D Mode
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topics.map((topic) => {
                  const IconComponent = topic.icon;
                  
                  return (
                    <Card 
                      key={topic.id} 
                      className={`border-2 transition-all duration-200 ${
                        topic.available 
                          ? 'border-gray-600 hover:border-gray-400 bg-black/60' 
                          : 'border-gray-800 bg-black/20 opacity-50'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="text-center mb-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                            topic.available ? topic.color : 'bg-gray-600'
                          }`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          
                          <h3 className="text-lg font-bold text-white mb-2">
                            {topic.name}
                          </h3>
                          
                          <p className="text-gray-300 text-xs mb-3">
                            {topic.description}
                          </p>
                        </div>
                        
                        {topic.available ? (
                          <div className="space-y-3">
                            {!topic.isCustom && (
                              <div className="relative">
                                <MobileSelect
                                  value={selectedCategories[topic.id] || 'random'}
                                  onValueChange={(value) => {
                                    setSelectedCategories(prev => ({...prev, [topic.id]: value}));
                                  }}
                                  options={getTopicCategories(topic.id)}
                                  placeholder="Random Mix"
                                  triggerClassName="w-full bg-black/40 text-white border-gray-600 hover:bg-black/60"
                                  contentClassName="bg-gray-800 text-white border-gray-600"
                                />
                              </div>
                            )}
                            
                            <Button 
                              className={`w-full ${topic.color} text-white border-none`}
                              onClick={() => handleTopicSelect(topic.id)}
                            >
                              {topic.isCustom ? 'Create Board' : 'Start Playing'}
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            disabled 
                            className="w-full bg-gray-600 text-gray-400 cursor-not-allowed"
                          >
                            Coming Soon
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Custom Topic Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white text-center">Create Custom Board</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    What topic would you like to learn about?
                  </label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g., Dinosaurs, Space, Ancient Egypt..."
                    className="w-full px-3 py-2 bg-black/40 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomTopicCreate();
                      }
                    }}
                  />
                </div>
                
                <div className="text-xs text-gray-400">
                  <p className="mb-2">✨ Powered by OpenAI GPT-3.5 for intelligent content!</p>
                  <p>📚 Generates facts, trivia, and related items</p>
                  <p>🎮 Difficulty adapts to your level</p>
                  <p>♾️ Infinite levels with fresh AI-generated content</p>
                  <p className="mt-2 text-yellow-400">💡 Try topics like: Ancient Egypt, Space Exploration, Jazz Music, Quantum Physics</p>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-gray-800 text-white border-gray-600 hover:bg-gray-700"
                    onClick={() => {
                      setShowCustomModal(false);
                      setCustomTopic('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none"
                    onClick={handleCustomTopicCreate}
                    disabled={!customTopic.trim()}
                  >
                    Create Board
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
