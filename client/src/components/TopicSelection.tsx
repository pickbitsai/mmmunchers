import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useGameState } from "../lib/stores/useGameState";
import { Calculator, BookOpen, Star, HelpCircle } from "lucide-react";

export default function TopicSelection() {
  const { selectTopic } = useGameState();

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
      id: 'trivia',
      name: 'Trivia & Facts',
      description: 'Test your knowledge across various subjects!',
      icon: HelpCircle,
      color: 'bg-purple-500 hover:bg-purple-600',
      available: false
    },
    {
      id: 'pop_culture',
      name: 'Pop Culture',
      description: 'Movies, music, celebrities, and trending topics!',
      icon: Star,
      color: 'bg-pink-500 hover:bg-pink-600',
      available: false
    }
  ];

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
                        ? 'border-gray-600 hover:border-gray-400 cursor-pointer bg-black/60' 
                        : 'border-gray-800 bg-black/20 opacity-50'
                    }`}
                    onClick={() => topic.available && selectTopic(topic.id)}
                  >
                    <CardContent className="p-4 text-center">
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
                      
                      {topic.available ? (
                        <Button 
                          className={`w-full ${topic.color} text-white border-none`}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectTopic(topic.id);
                          }}
                        >
                          Start Playing
                        </Button>
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

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Use arrow keys or WASD to move around the grid and munch the correct answers!
          </p>
        </div>
      </div>
    </div>
  );
}
