// AI Service for generating custom game content
// This service can be connected to various AI providers (OpenAI, Anthropic, etc.)

export interface AIGeneratedContent {
  description: string;
  correctAnswers: string[];
  incorrectAnswers: string[];
  hints?: string[];
}

export interface AITopicContent {
  items: string[];
  categories: string[];
  facts: string[];
}

class AIService {
  private apiKey?: string;
  private apiEndpoint: string;
  
  constructor() {
    // OpenAI API configuration
    this.apiKey = import.meta.env.VITE_AI_API_KEY;
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
  }
  
  async generateTopicContent(
    topic: string, 
    subtopic: string, 
    level: number
  ): Promise<AITopicContent> {
    // If no API is configured, use advanced mock generation
    if (!this.apiKey || !this.apiEndpoint) {
      return this.generateMockContent(topic, subtopic, level);
    }
    
    // OpenAI API call
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an educational content generator for a learning game. Generate diverse, accurate, and age-appropriate content. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: this.buildPrompt(topic, subtopic, level)
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }
      
      const data = await response.json();
      return this.parseOpenAIResponse(data);
    } catch (error) {
      console.error('AI generation failed, using mock content:', error);
      return this.generateMockContent(topic, subtopic, level);
    }
  }
  
  async generateChallenge(
    topic: string,
    items: string[],
    level: number
  ): Promise<AIGeneratedContent> {
    // Generate dynamic challenges based on level
    const difficulty = Math.min(level / 10, 1); // 0 to 1 scale
    
    const challengeTemplates = [
      `Find all items related to ${topic}`,
      `Select everything about ${topic}`,
      `Munch the ${topic} facts`,
      `Identify true statements about ${topic}`,
      `Find all ${topic} examples`,
      `Select items that belong to ${topic}`,
      `Choose correct ${topic} information`
    ];
    
    // More specific challenges at higher levels
    if (level > 5) {
      challengeTemplates.push(
        `Find items that start with the same letter as ${topic}`,
        `Select items from the same category as ${topic}`,
        `Identify items created in the same era as ${topic}`,
        `Find items with similar properties to ${topic}`
      );
    }
    
    const description = challengeTemplates[
      Math.floor(Math.random() * challengeTemplates.length)
    ];
    
    // Determine number of correct answers based on level
    const minCorrect = 3 + Math.floor(level / 3);
    const maxCorrect = Math.min(minCorrect + 5, items.length);
    const numCorrect = Math.floor(
      minCorrect + Math.random() * (maxCorrect - minCorrect)
    );
    
    // Select correct answers
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const correctAnswers = shuffled.slice(0, numCorrect);
    
    // Generate distractors
    const numIncorrect = Math.max(10, 20 - numCorrect);
    const incorrectAnswers = this.generateDistractors(
      topic, 
      numIncorrect, 
      level,
      correctAnswers
    );
    
    return {
      description,
      correctAnswers,
      incorrectAnswers,
      hints: level > 10 ? this.generateHints(topic, correctAnswers) : undefined
    };
  }
  
  private buildPrompt(topic: string, subtopic: string, level: number): string {
    const difficulty = level <= 5 ? "elementary" : level <= 10 ? "middle school" : "high school";
    
    let subtopicPrompt = '';
    switch (subtopic) {
      case 'facts':
        subtopicPrompt = 'Focus on interesting facts and true statements.';
        break;
      case 'trivia':
        subtopicPrompt = 'Focus on trivia questions and fun knowledge.';
        break;
      case 'related':
        subtopicPrompt = 'Focus on things related to or associated with the topic.';
        break;
      default:
        subtopicPrompt = 'Include a variety of items, facts, and related concepts.';
    }
    
    return `Generate educational content about "${topic}" for a ${difficulty} level learning game.
${subtopicPrompt}

Create a JSON object with EXACTLY this structure:
{
  "items": [array of 25-30 short items/phrases related to ${topic}, each 1-4 words],
  "categories": [array of 5-8 category names that group these items],
  "facts": [array of 10-15 interesting facts about ${topic}, each under 50 characters]
}

Requirements:
- Keep all entries short and concise for game display
- Make content educational and accurate
- Vary difficulty based on level ${level}
- No duplicate entries
- Age-appropriate content`;
  }
  
  private parseOpenAIResponse(response: any): AITopicContent {
    // Parse the OpenAI response
    try {
      if (response.choices && response.choices[0] && response.choices[0].message) {
        const content = JSON.parse(response.choices[0].message.content);
        
        // Validate and clean the response
        const items = Array.isArray(content.items) 
          ? content.items.filter((item: any) => typeof item === 'string' && item.length > 0)
          : [];
          
        const categories = Array.isArray(content.categories)
          ? content.categories.filter((cat: any) => typeof cat === 'string' && cat.length > 0)
          : [];
          
        const facts = Array.isArray(content.facts)
          ? content.facts.filter((fact: any) => typeof fact === 'string' && fact.length > 0)
          : [];
        
        return {
          items: items.slice(0, 30), // Limit to 30 items
          categories: categories.slice(0, 10), // Limit to 10 categories
          facts: facts.slice(0, 15) // Limit to 15 facts
        };
      }
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
    }
    
    // Fallback to empty content
    return { items: [], categories: [], facts: [] };
  }
  
  private generateMockContent(
    topic: string, 
    subtopic: string, 
    level: number
  ): AITopicContent {
    const items: string[] = [];
    const categories: string[] = [];
    const facts: string[] = [];
    
    // Generate categories
    const categoryTypes = ['Types', 'Groups', 'Classes', 'Varieties', 'Kinds'];
    for (let i = 0; i < 5; i++) {
      categories.push(`${topic} ${categoryTypes[i]}`);
    }
    
    // Generate items based on subtopic
    const itemCount = 20 + Math.floor(level / 2);
    for (let i = 0; i < itemCount; i++) {
      switch (subtopic) {
        case 'facts':
          items.push(`${topic} fact #${i + 1}`);
          items.push(`True about ${topic}: Detail ${i + 1}`);
          break;
        case 'trivia':
          items.push(`${topic} trivia ${i + 1}`);
          items.push(`Question ${i + 1} about ${topic}`);
          break;
        case 'related':
          items.push(`Related to ${topic} #${i + 1}`);
          items.push(`${topic} connection ${i + 1}`);
          break;
        default:
          items.push(`${topic} item ${i + 1}`);
          items.push(`${topic} example ${i + 1}`);
      }
    }
    
    // Generate facts
    const factCount = 10 + Math.floor(level / 5);
    for (let i = 0; i < factCount; i++) {
      facts.push(`Interesting fact about ${topic} #${i + 1}`);
    }
    
    // Add level-specific advanced content
    if (level > 10) {
      items.push(`Advanced ${topic} concept`);
      items.push(`Complex ${topic} theory`);
      facts.push(`Expert-level ${topic} knowledge`);
    }
    
    return { items, categories, facts };
  }
  
  private generateDistractors(
    topic: string,
    count: number,
    level: number,
    correctAnswers: string[]
  ): string[] {
    const distractors: string[] = [];
    
    // Generate more realistic distractors based on common wrong answers
    const distractorCategories = [
      // Similar but different topics
      ['Planets', 'Stars', 'Galaxies', 'Comets', 'Asteroids'],
      ['Animals', 'Plants', 'Minerals', 'Elements', 'Compounds'],
      ['Countries', 'Cities', 'Rivers', 'Mountains', 'Oceans'],
      ['Artists', 'Musicians', 'Writers', 'Scientists', 'Athletes'],
      ['Foods', 'Drinks', 'Desserts', 'Spices', 'Dishes'],
      ['Colors', 'Shapes', 'Numbers', 'Letters', 'Symbols'],
      ['Movies', 'Books', 'Songs', 'Games', 'Shows'],
      ['Sports', 'Hobbies', 'Crafts', 'Skills', 'Activities']
    ];
    
    // Pick a random category that's likely different from the topic
    const randomCategory = distractorCategories[Math.floor(Math.random() * distractorCategories.length)];
    
    // Common wrong answer patterns
    const wrongPatterns = [
      'Not ' + topic,
      'Unlike ' + topic,
      'False about ' + topic,
      'Myth about ' + topic,
      'Misconception',
      'Incorrect',
      'Wrong answer',
      'Unrelated'
    ];
    
    // Generate distractors
    for (let i = 0; i < count; i++) {
      if (i < randomCategory.length && level > 5) {
        // Use items from different categories for harder levels
        distractors.push(randomCategory[i]);
      } else if (i < wrongPatterns.length) {
        // Use wrong patterns
        distractors.push(wrongPatterns[i]);
      } else {
        // Generate numbered distractors
        const baseDistractor = wrongPatterns[i % wrongPatterns.length];
        distractors.push(`${baseDistractor} ${Math.floor(i / wrongPatterns.length) + 1}`);
      }
    }
    
    // Shuffle to make it less predictable
    return distractors.sort(() => Math.random() - 0.5);
  }
  
  private generateHints(topic: string, correctAnswers: string[]): string[] {
    return [
      `Look for items containing "${topic}"`,
      `${correctAnswers.length} correct answers to find`,
      `Think about what relates to ${topic}`,
      `Some answers may be tricky!`
    ];
  }
}

// Export singleton instance
export const aiService = new AIService();