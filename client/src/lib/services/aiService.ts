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
    // If we don't have enough items, use what we have
    if (items.length === 0) {
      console.warn('No items available for challenge generation');
      return {
        description: `Find items about ${topic}`,
        correctAnswers: [`${topic} item`],
        incorrectAnswers: ['Wrong answer']
      };
    }
    
    // Generate dynamic challenges based on level
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
        `Find specific ${topic} items`,
        `Select advanced ${topic} concepts`,
        `Identify expert ${topic} knowledge`,
        `Find complex ${topic} examples`
      );
    }
    
    const description = challengeTemplates[
      Math.floor(Math.random() * challengeTemplates.length)
    ];
    
    // Determine number of correct answers based on level
    const minCorrect = Math.min(3 + Math.floor(level / 3), items.length);
    const maxCorrect = Math.min(minCorrect + 5, items.length);
    const numCorrect = Math.min(
      Math.floor(minCorrect + Math.random() * (maxCorrect - minCorrect + 1)),
      items.length
    );
    
    // Select correct answers from the AI-generated items
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const correctAnswers = shuffled.slice(0, numCorrect);
    
    // Generate distractors - use remaining items if available
    const remainingItems = shuffled.slice(numCorrect);
    // For a 9x7 grid (63 cells), we need plenty of distractors
    const numIncorrect = Math.max(40, 63 - numCorrect);
    
    let incorrectAnswers: string[] = [];
    
    // If we have AI-generated items left, modify them to be wrong
    if (remainingItems.length > 0 && this.apiKey) {
      incorrectAnswers = this.generateSmartDistractors(
        topic,
        remainingItems,
        numIncorrect,
        level
      );
    } else {
      // Fall back to generic distractors
      incorrectAnswers = this.generateDistractors(
        topic, 
        numIncorrect, 
        level,
        correctAnswers
      );
    }
    
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
    
    // Try to generate somewhat relevant mock content based on common topics
    const topicLower = topic.toLowerCase();
    
    // Space-related mock content
    if (topicLower.includes('space') || topicLower.includes('astro') || topicLower.includes('planet')) {
      items.push(
        'Mars', 'Venus', 'Jupiter', 'Saturn', 'Mercury', 'Neptune', 'Uranus', 'Earth',
        'Moon', 'Sun', 'Asteroid', 'Comet', 'Galaxy', 'Star', 'Nebula', 'Black hole',
        'Satellite', 'Orbit', 'Gravity', 'Rocket', 'Astronaut', 'Space station',
        'Telescope', 'Constellation', 'Meteor', 'Eclipse', 'Cosmos', 'Universe'
      );
      categories.push('Planets', 'Stars', 'Galaxies', 'Space Objects', 'Space Tech');
      facts.push(
        'Mars is red', 'Saturn has rings', 'Sun is a star',
        'Moon orbits Earth', 'Space is vast', 'Stars are hot'
      );
    }
    // Animal-related mock content
    else if (topicLower.includes('animal') || topicLower.includes('zoo') || topicLower.includes('wildlife')) {
      items.push(
        'Lion', 'Tiger', 'Bear', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Penguin',
        'Dolphin', 'Whale', 'Shark', 'Eagle', 'Parrot', 'Snake', 'Crocodile', 'Kangaroo',
        'Koala', 'Panda', 'Wolf', 'Fox', 'Deer', 'Rabbit', 'Squirrel', 'Owl'
      );
      categories.push('Mammals', 'Birds', 'Reptiles', 'Fish', 'Predators');
      facts.push(
        'Lions roar', 'Birds fly', 'Fish swim',
        'Snakes slither', 'Dolphins jump', 'Owls are nocturnal'
      );
    }
    // Default generic content
    else {
      // Generate categories
      const categoryTypes = ['Types', 'Groups', 'Classes', 'Examples', 'Varieties'];
      for (let i = 0; i < 5; i++) {
        categories.push(`${topic} ${categoryTypes[i]}`);
      }
      
      // Generate items based on subtopic
      const itemCount = 20 + Math.floor(level / 2);
      for (let i = 0; i < Math.min(itemCount, 15); i++) {
        switch (subtopic) {
          case 'facts':
            items.push(`${topic} fact ${i + 1}`);
            break;
          case 'trivia':
            items.push(`${topic} trivia ${i + 1}`);
            break;
          case 'related':
            items.push(`${topic} related ${i + 1}`);
            break;
          default:
            items.push(`${topic} item ${i + 1}`);
        }
      }
      
      // Generate facts
      const factCount = Math.min(10, 5 + Math.floor(level / 5));
      for (let i = 0; i < factCount; i++) {
        facts.push(`${topic} fact #${i + 1}`);
      }
    }
    
    // Add level-specific advanced content
    if (level > 10 && items.length < 30) {
      items.push(`Advanced ${topic}`, `Complex ${topic}`, `Expert ${topic}`);
      facts.push(`Expert ${topic} fact`);
    }
    
    return { 
      items: items.slice(0, 30), 
      categories: categories.slice(0, 8), 
      facts: facts.slice(0, 15) 
    };
  }
  
  private generateSmartDistractors(
    topic: string,
    remainingItems: string[],
    count: number,
    level: number
  ): string[] {
    const distractors: string[] = [];
    const topicLower = topic.toLowerCase();
    
    // Use ALL remaining AI items first (they're related but not correct)
    distractors.push(...remainingItems);
    
    // Topic-specific wrong answers
    let topicDistracters: string[] = [];
    
    if (topicLower.includes('space') || topicLower.includes('astro')) {
      topicDistracters = [
        'Flat Earth', 'Geocentric model', 'Aether', 'Phlogiston',
        'Crystal spheres', 'Firmament', 'Turtles all the way', 'Sky dome',
        'Cheese moon', 'Canals on Mars', 'Planet X', 'Nibiru',
        'Hollow Earth', 'Space whales', 'Star gates', 'Sky cities'
      ];
    } else if (topicLower.includes('animal')) {
      topicDistracters = [
        'Dragon', 'Unicorn', 'Phoenix', 'Griffin', 'Pegasus', 'Chimera',
        'Minotaur', 'Centaur', 'Kraken', 'Yeti', 'Bigfoot', 'Loch Ness',
        'Chupacabra', 'Jackalope', 'Drop bear', 'Snipe', 'Dodo clone', 'Megalodon'
      ];
    } else {
      // Generate topic variations that are wrong
      topicDistracters = [
        `Fake ${topic}`, `Anti-${topic}`, `Non-${topic}`, `Pseudo-${topic}`,
        `Mock ${topic}`, `Faux ${topic}`, `Quasi-${topic}`, `Semi-${topic}`,
        `Ultra ${topic}`, `Mega ${topic}`, `Super ${topic}`, `Hyper ${topic}`,
        `Proto-${topic}`, `Neo-${topic}`, `Post-${topic}`, `Pre-${topic}`
      ];
    }
    
    // Add topic-specific distractors
    for (const distractor of topicDistracters) {
      if (distractors.length >= count) break;
      if (!distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }
    
    // Generate more contextual distractors if needed
    const contextualDistracters = [
      'Unknown item', 'Mystery object', 'Classified info', 'Redacted',
      'Error 404', 'Missing data', 'Corrupted file', 'Access denied',
      'Top secret', 'Restricted', 'Confidential', 'Eyes only',
      'Coming soon', 'Under construction', 'Beta version', 'Prototype'
    ];
    
    // Add contextual distractors
    for (const distractor of contextualDistracters) {
      if (distractors.length >= count) break;
      if (!distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }
    
    // If we STILL need more, create numbered variants
    let variantCount = 1;
    while (distractors.length < count) {
      const variant = `Unknown ${topic} #${variantCount}`;
      if (!distractors.includes(variant)) {
        distractors.push(variant);
        variantCount++;
      }
    }
    
    return distractors.slice(0, count);
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