import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useGameState } from "../lib/stores/useGameState";
import { Calculator, BookOpen, Zap, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function TopicSelection() {
  const { selectTopic, topicProvider } = useGameState();
  const [selectedCategories, setSelectedCategories] = useState<{[key: string]: string}>({
    math: 'random',
    words: 'random', 
    marvel: 'random'
  });

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
      id: 'trivia',
      name: 'Trivia & Facts',
      description: 'Test your knowledge across various subjects!',
      icon: HelpCircle,
      color: 'bg-purple-500 hover:bg-purple-600',
      available: false
    }
  ];

  const handleTopicSelect = (topicId: string) => {
    // Store the selected category for this topic
    const selectedCategory = selectedCategories[topicId] || 'random';
    
    // Store category preference for when topic provider is created
    localStorage.setItem(`category_${topicId}`, selectedCategory);
    
    selectTopic(topicId);
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
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 pt-20 pb-20">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Number Munchers</h1>
          <p className="text-lg text-gray-300">Educational Adventure Game</p>
        </div>

        <Card className="bg-black/40 border-gray-600 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-white">Choose Your Topic</CardTitle>
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
                          <div className="relative">
                            <Select 
                              value={selectedCategories[topic.id] || 'random'}
                              onValueChange={(value) => {
                                console.log(`Selected category for ${topic.id}:`, value);
                                setSelectedCategories(prev => ({...prev, [topic.id]: value}));
                              }}
                            >
                              <SelectTrigger className="w-full bg-black/40 text-white border-gray-600 hover:bg-black/60">
                                <SelectValue placeholder="Random Mix" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 text-white border-gray-600">
                                {getTopicCategories(topic.id).map((category) => (
                                  <SelectItem 
                                    key={category.id} 
                                    value={category.id} 
                                    className="hover:bg-gray-700 focus:bg-gray-700 text-white cursor-pointer"
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button 
                            className={`w-full ${topic.color} text-white border-none`}
                            onClick={() => handleTopicSelect(topic.id)}
                          >
                            Start Playing
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
  );
}
