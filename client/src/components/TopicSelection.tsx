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
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">Number Munchers</h1>
          <p className="text-xl text-gray-300">Educational Adventure Game</p>
        </div>

        <Card className="bg-black/40 border-gray-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Choose Your Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                        topic.available ? topic.color : 'bg-gray-600'
                      }`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">
                        {topic.name}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-4">
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
