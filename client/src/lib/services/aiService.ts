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
  correctItems?: string[];
  incorrectItems?: string[];
}

class AIService {
  private apiKey?: string;
  private apiEndpoint: string;
  
  constructor() {
    // OpenAI API configuration - removed from client side for security
    this.apiKey = undefined; // API key should be on server side only
    this.apiEndpoint = '/api/ai-generate'; // Use server proxy endpoint
    
    // Minimal logging for security
    console.log('AI Service initialized - using server proxy for secure AI requests');
  }
  
  async generateTopicContent(
    topic: string, 
    subtopic: string, 
    level: number
  ): Promise<AITopicContent> {
    // First, try to get from cache
    try {
      const response = await fetch(`/api/topic-content/${encodeURIComponent(topic)}?subtopic=${subtopic}`);
      if (response.ok) {
        const cached = await response.json();
        if (cached && cached.items) {
          console.log('Using cached content for:', topic);
          return {
            items: cached.items,
            categories: cached.categories,
            facts: cached.facts,
            correctItems: cached.correctItems,
            incorrectItems: cached.incorrectItems
          };
        }
      }
    } catch (error) {
      console.error('Cache lookup failed:', error);
    }
    
    // Try secure server-side AI generation first
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          subtopic,
          level,
          prompt: this.buildPrompt(topic, subtopic, level)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content) {
          // Save AI-generated content to cache
          this.saveToCacheInBackground(topic, subtopic, data.content, 'openai');
          return data.content;
        }
      }
    } catch (error) {
      console.warn('Server AI generation unavailable, using mock content');
    }
    
    // Fallback to mock generation
    const mockContent = await this.generateMockContent(topic, subtopic, level);
    
    // Save mock content to cache
    this.saveToCacheInBackground(topic, subtopic, mockContent, 'mock');
    
    return mockContent;
  }
  
  private async saveToCacheInBackground(
    topic: string,
    subtopic: string,
    content: AITopicContent,
    generatedBy: string
  ): Promise<void> {
    try {
      await fetch('/api/topic-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          subtopic,
          items: content.items,
          categories: content.categories,
          facts: content.facts,
          correctItems: content.correctItems,
          incorrectItems: content.incorrectItems,
          generatedBy
        })
      });
    } catch (error) {
      console.error('Failed to save to cache:', error);
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
    
    // Check if this is an "everything about" challenge
    const isEverythingChallenge = description.includes('everything about') || 
                                 description.includes('all items related to') ||
                                 description.includes('all') && description.includes('examples');
    
    let correctAnswers: string[];
    let incorrectAnswers: string[];
    
    // Get the topic content to access the separated correct/incorrect items
    const topicContent = await this.generateTopicContent(topic, 'related', level);
    
    // Use the separated items from OpenAI if available, otherwise fall back to classification
    let correct: string[], incorrect: string[];
    if (topicContent.correctItems && topicContent.incorrectItems) {
      correct = topicContent.correctItems;
      incorrect = topicContent.incorrectItems;
      if (import.meta.env.DEV) {
        console.log(`Using OpenAI separated items: ${correct.length} correct, ${incorrect.length} incorrect`);
      }
    } else {
      // Fallback to the old classification method
      const separated = this.separateCorrectFromIncorrect(topic, items);
      correct = separated.correct;
      incorrect = separated.incorrect;
      if (import.meta.env.DEV) {
        console.log(`Using classified items: ${correct.length} correct, ${incorrect.length} incorrect`);
      }
    }
    
    if (isEverythingChallenge) {
      // For "everything about" challenges, use ALL correct items
      correctAnswers = [...correct];
      incorrectAnswers = [...incorrect];
      if (import.meta.env.DEV) {
        console.log(`Everything challenge: Using ${correctAnswers.length} correct items and ${incorrectAnswers.length} incorrect items`);
      }
    } else {
      // For specific challenges, use a subset of correct items
      const totalCells = 48; // Average grid size
      const minCorrect = Math.min(2 + Math.floor(level / 4), Math.floor(totalCells * 0.2), correct.length);
      const maxCorrect = Math.min(minCorrect + 3, Math.floor(totalCells * 0.35), correct.length);
      const numCorrect = Math.min(
        Math.floor(minCorrect + Math.random() * (maxCorrect - minCorrect + 1)),
        correct.length
      );
      
      // Select correct answers from the AI-generated correct items
      const shuffled = [...correct].sort(() => Math.random() - 0.5);
      correctAnswers = shuffled.slice(0, numCorrect);
      
      // Use remaining correct items and all incorrect items as distractors
      const remainingCorrect = correct.filter(item => !correctAnswers.includes(item));
      incorrectAnswers = [...remainingCorrect, ...incorrect];
      
      if (import.meta.env.DEV) {
        console.log(`Specific challenge: Using ${correctAnswers.length} correct items and ${incorrectAnswers.length} incorrect items`);
      }
    }
    
    // If we need more distractors, add smart ones
    const numIncorrect = Math.max(40, 63 - correctAnswers.length);
    if (incorrectAnswers.length < numIncorrect) {
      const additionalNeeded = numIncorrect - incorrectAnswers.length;
      const additionalDistractors = this.generateSmartDistractors(
        topic,
        [],
        additionalNeeded,
        level
      );
      incorrectAnswers.push(...additionalDistractors);
    }
    
    return {
      description,
      correctAnswers,
      incorrectAnswers,
      hints: level > 10 ? this.generateHints(topic, correctAnswers) : undefined
    };
  }
  
  private separateCorrectFromIncorrect(topic: string, items: string[]): { correct: string[], incorrect: string[] } {
    // Smart separation using topic relevance analysis
    const correct: string[] = [];
    const incorrect: string[] = [];
    const topicLower = topic.toLowerCase();
    
    // Create topic-specific relevant terms
    const topicWords = topicLower.split(/\s+/);
    
    // Universal distractors that are clearly unrelated to most topics
    const universalDistractors = [
      'monkey', 'pizza', 'rainbow', 'guitar', 'elephant', 'jungle', 'butterfly', 
      'castle', 'superhero', 'unicorn', 'robot', 'book', 'moon', 'football', 
      'ice cream', 'planet', 'mountain', 'snow', 'skiing', 'basketball', 
      'piano', 'cooking', 'desert', 'space', 'car', 'television', 'computer', 
      'phone', 'house', 'school', 'office', 'pencil', 'paper', 'chair', 'table'
    ];
    
    items.forEach(item => {
      const itemLower = item.toLowerCase();
      
      // Check if it's a universal distractor
      const isUniversalDistractor = universalDistractors.some(distractor => 
        itemLower.includes(distractor) || distractor.includes(itemLower)
      );
      
      if (isUniversalDistractor) {
        incorrect.push(item);
      } else {
        // Check if the item is likely related to the topic
        const hasTopicConnection = topicWords.some(topicWord => 
          itemLower.includes(topicWord) || topicWord.includes(itemLower) ||
          this.isSemanticallySimilar(itemLower, topicWord)
        );
        
        if (hasTopicConnection) {
          correct.push(item);
        } else {
          // For ambiguous cases, use topic-specific knowledge
          if (this.isItemRelevantToTopic(itemLower, topicLower)) {
            correct.push(item);
          } else {
            incorrect.push(item);
          }
        }
      }
    });
    
    // Debug logging only in development
    if (import.meta.env.DEV) {
      console.log(`Topic: ${topic} - Separated ${correct.length} correct and ${incorrect.length} incorrect items`);
    }
    
    return { correct, incorrect };
  }

  private isSemanticallySimilar(item: string, topic: string): boolean {
    // Simple semantic similarity checks
    const itemWords = item.split(/\s+/);
    const topicWords = topic.split(/\s+/);
    
    return itemWords.some(itemWord => 
      topicWords.some(topicWord => 
        Math.abs(itemWord.length - topicWord.length) <= 2 &&
        (itemWord.includes(topicWord) || topicWord.includes(itemWord))
      )
    );
  }

  private isItemRelevantToTopic(item: string, topic: string): boolean {
    // Topic-specific relevance checks
    const topicMappings: { [key: string]: string[] } = {
      'electricity': ['battery', 'wire', 'light', 'switch', 'circuit', 'plug', 'outlet', 'socket', 'bulb', 'power', 'energy', 'electrician', 'current', 'voltage', 'shock', 'appliance', 'generator', 'transformer', 'fuse', 'resistor', 'conductor', 'insulator', 'amplifier', 'motor'],
      'music': ['guitar', 'piano', 'violin', 'drums', 'trumpet', 'saxophone', 'note', 'chord', 'rhythm', 'melody', 'harmony', 'song', 'beat', 'tempo', 'scale', 'bass', 'treble', 'jazz', 'rock', 'pop', 'classical', 'concert', 'band', 'orchestra', 'singer', 'composer', 'musician'],
      'cooking': ['knife', 'pot', 'stove', 'spoon', 'plate', 'food', 'recipe', 'chop', 'bake', 'mix', 'grill', 'peel', 'steam', 'boil', 'fry', 'whisk', 'simmer', 'season', 'taste', 'serve', 'eat', 'dish', 'pan', 'oven'],
      'lego': ['brick', 'build', 'minifig', 'set', 'color', 'play', 'creation', 'piece', 'theme', 'instruction', 'baseplate', 'creative', 'imagination', 'construct', 'model', 'toy', 'plastic', 'stack'],
      'surfing': ['ocean', 'wave', 'board', 'wetsuit', 'beach', 'surf', 'tide', 'sand', 'paddle', 'ride', 'barrel', 'tube', 'break', 'curl', 'foam', 'swell', 'fin', 'leash', 'wax', 'reef', 'shore'],
      'shoes': ['laces', 'sole', 'heel', 'boot', 'sandal', 'slipper', 'sneaker', 'insole', 'toe', 'shoelace', 'footwear', 'cleats', 'platform', 'oxford', 'clog', 'moccasin', 'pump', 'flip-flop', 'athletic', 'loafer', 'wedge', 'stiletto', 'brogue', 'espadrille', 'walking', 'running', 'dress', 'casual', 'leather', 'fabric', 'rubber', 'foot', 'ankle', 'lace', 'buckle', 'strap', 'size', 'fit', 'comfort', 'style'],
      'eggs': ['shell', 'yolk', 'white', 'chick', 'nest', 'hen', 'omelette', 'omelet', 'boiled', 'scrambled', 'frying', 'poached', 'protein', 'breakfast', 'farm', 'carton', 'easter', 'cholesterol', 'omega-3', 'crack', 'sunny-side', 'cackle', 'incubate', 'feather', 'brood', 'chicken', 'albumen', 'cook', 'beat', 'whisk', 'fresh', 'organic', 'dozen', 'laying', 'hatch', 'bird', 'rooster', 'coop', 'feed', 'calcium']
    };
    
    // Check if topic has specific mappings
    for (const [topicKey, relevantItems] of Object.entries(topicMappings)) {
      if (topic.includes(topicKey)) {
        return relevantItems.some(relevant => 
          item.includes(relevant) || relevant.includes(item)
        );
      }
    }
    
    return false;
  }
  
  private getTopicKeywords(normalizedTopic: string): string[] {
    const keywords: string[] = [];
    
    if (normalizedTopic.includes('surf')) {
      keywords.push('ocean', 'wave', 'board', 'wetsuit', 'beach', 'surf', 'tide', 'sand', 'paddle', 'ride', 'barrel', 'tube', 'break', 'curl', 'foam', 'swell', 'fin', 'leash', 'wax', 'reef', 'shore', 'lineup', 'set', 'duck', 'pop', 'carve', 'cutback', 'floater', 'longboard', 'shortboard');
    } else if (normalizedTopic.includes('space') || normalizedTopic.includes('astro')) {
      keywords.push('mars', 'venus', 'jupiter', 'saturn', 'mercury', 'neptune', 'uranus', 'earth', 'moon', 'sun', 'asteroid', 'comet', 'galaxy', 'star', 'nebula', 'planet', 'orbit', 'gravity', 'rocket', 'astronaut', 'satellite', 'telescope', 'constellation', 'meteor', 'eclipse', 'cosmos', 'universe', 'solar', 'lunar');
    } else if (normalizedTopic.includes('music')) {
      keywords.push('guitar', 'piano', 'violin', 'drums', 'trumpet', 'saxophone', 'note', 'chord', 'rhythm', 'melody', 'harmony', 'song', 'beat', 'tempo', 'scale', 'bass', 'treble', 'jazz', 'rock', 'pop', 'classical', 'concert', 'band', 'orchestra', 'singer', 'composer', 'musician');
    } else if (normalizedTopic.includes('cook')) {
      keywords.push('recipe', 'ingredient', 'kitchen', 'pot', 'pan', 'oven', 'stove', 'bake', 'boil', 'fry', 'grill', 'steam', 'chop', 'dice', 'slice', 'mix', 'stir', 'sauce', 'spice', 'herb', 'salt', 'pepper', 'oil', 'butter', 'flour', 'sugar', 'chef', 'food', 'meal', 'dish');
    } else if (normalizedTopic.includes('animal')) {
      keywords.push('dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'rabbit', 'mouse', 'elephant', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'monkey', 'zebra', 'giraffe', 'hippo', 'rhino', 'leopard', 'cheetah', 'snake', 'lizard', 'frog');
    } else if (normalizedTopic.includes('fallout')) {
      keywords.push('fallout', 'vault', 'nuclear', 'wasteland', 'radiation', 'pip-boy', 'supermutant', 'laser', 'power', 'armor', 'caps', 'nuka', 'cola', 'brotherhood', 'steel', 'raiders', 'ghoul', 'robot', 'dogmeat', 'brahmin', 'radroach', 'deathclaw', 'enclave', 'ncr', 'legion', 'institute', 'minutemen', 'railroad', 'apocalypse', 'atomic', 'bomb', 'shelter', 'bunker', 'scrap', 'junk', 'stimpak', 'radaway', 'fusion', 'core', 'plasma', 'rifle', 'missile', 'launcher', 'combat', 'shotgun', 'assault', 'rifle', 'fatman', 'mini', 'nuke', 'terminal', 'hacking', 'lockpick', 'security', 'computer', 'pre-war', 'post-war', 'apocalyptic', 'wasteland', 'survivor', 'vault-tec', 'robco', 'nuka-quantum', 'mentats', 'buffout', 'rad-x', 'jet', 'psycho', 'addictol', 'bobby', 'pin', 'bottlecap', 'scavenger', 'trader', 'caravan', 'brahmin', 'pack', 'settlement', 'workshop', 'crafting', 'modding', 'weapon', 'modification', 'armor', 'upgrade', 'perk', 'special', 'strength', 'perception', 'endurance', 'charisma', 'intelligence', 'agility', 'luck');
    } else {
      // For generic topics, try to extract keywords from the topic itself
      const topicWords = normalizedTopic.split(/\s+/);
      keywords.push(...topicWords);
    }
    
    return keywords;
  }
  
  private isItemCorrectForTopic(itemLower: string, normalizedTopic: string, topicKeywords: string[]): boolean {
    // Check if the item contains any of the topic keywords
    const hasKeyword = topicKeywords.some(keyword => 
      itemLower.includes(keyword) || keyword.includes(itemLower)
    );
    
    // Check if the item is obviously unrelated (common distractors)
    const commonDistractors = [
      'mountain', 'snow', 'skiing', 'basketball', 'piano', 'cooking', 'desert',
      'space', 'robot', 'books', 'car', 'television', 'computer', 'phone',
      'house', 'school', 'office', 'pencil', 'paper', 'chair', 'table',
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink',
      'apple', 'banana', 'orange', 'grape', 'strawberry', 'pear', 'peach',
      'football', 'broccoli', 'guitar', 'flower', 'dragon', 'pizza', 'moon'
    ];
    
    const isObviousDistractor = commonDistractors.some(distractor => 
      itemLower.includes(distractor)
    );
    
    // If it's an obvious distractor and doesn't have topic keywords, it's incorrect
    if (isObviousDistractor && !hasKeyword) {
      return false;
    }
    
    // If it has topic keywords, it's likely correct
    if (hasKeyword) {
      return true;
    }
    
    // For ambiguous cases, be more conservative - only mark as correct if it clearly relates
    // Check if the item could reasonably be related to the topic
    const topicWords = normalizedTopic.split(/\s+/);
    const itemWords = itemLower.split(/\s+/);
    
    // If any word in the item matches any word in the topic, it might be related
    const hasWordMatch = topicWords.some(topicWord => 
      itemWords.some(itemWord => 
        topicWord.includes(itemWord) || itemWord.includes(topicWord)
      )
    );
    
    // Only return true if there's a clear connection
    return hasWordMatch;
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
  "correctItems": [array of 20-25 items that ARE related to ${topic}],
  "incorrectItems": [array of 15-20 items that are NOT related to ${topic}],
  "categories": [array of 5-8 category names, each 1-2 words],
  "facts": [array of 10-15 facts about ${topic}, each under 15 characters]
}

CRITICAL Requirements:
- correctItems: 20-25 items that ARE directly related to ${topic} (correct answers)
- incorrectItems: 15-20 items that are NOT related to ${topic} but are plausible distractors (incorrect answers)
- Make distractors challenging but clearly wrong when you think about it
- ALL items MUST be 1-2 words maximum (prefer single words)
- NO phrases longer than 2 words
- Categories: 1-2 words only
- Facts: Maximum 15 characters each
- Use abbreviations if needed
- Single nouns preferred
- Age-appropriate content

Example for "Surfing":
correctItems: ["Ocean", "Wave", "Board", "Wetsuit", "Beach", "Paddle", "Barrel", "Tide", "Reef", "Curl"]
incorrectItems: ["Mountain", "Snow", "Skiing", "Basketball", "Piano", "Cooking", "Desert", "Space", "Robot", "Books"]`;
  }
  
  private parseOpenAIResponse(response: any): AITopicContent {
    // Parse the OpenAI response
    try {
      if (response.choices && response.choices[0] && response.choices[0].message) {
        const content = JSON.parse(response.choices[0].message.content);
        
        // Validate and clean the response
        const correctItems = Array.isArray(content.correctItems) 
          ? content.correctItems.filter((item: any) => typeof item === 'string' && item.length > 0)
          : [];
          
        const incorrectItems = Array.isArray(content.incorrectItems) 
          ? content.incorrectItems.filter((item: any) => typeof item === 'string' && item.length > 0)
          : [];
          
        const categories = Array.isArray(content.categories)
          ? content.categories.filter((cat: any) => typeof cat === 'string' && cat.length > 0)
          : [];
          
        const facts = Array.isArray(content.facts)
          ? content.facts.filter((fact: any) => typeof fact === 'string' && fact.length > 0)
          : [];
        
        // Store the raw parsed content for use in challenge generation
        const parsedContent = {
          correctItems,
          incorrectItems,
          categories,
          facts
        };
        
        // Combine correct and incorrect items for backward compatibility
        const allItems = [...correctItems, ...incorrectItems];
        
        return {
          items: allItems.slice(0, 40), // Limit to 40 items total
          categories: categories.slice(0, 10), // Limit to 10 categories
          facts: facts.slice(0, 15), // Limit to 15 facts
          correctItems: correctItems,
          incorrectItems: incorrectItems
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
    
    // Handle common typos and variations
    const normalizedTopic = this.normalizeTopic(topicLower);
    
    // Universal content generation approach - works for ANY topic
    console.log(`Generating content for topic: "${topic}" (normalized: "${normalizedTopic}")`);
    
    // Try specific topic handlers first
    let foundSpecificContent = false;
    
    // Egypt/Ancient civilization content
    if (normalizedTopic.includes('egypt') || topicLower.includes('pyramid') || topicLower.includes('pharaoh')) {
      foundSpecificContent = true;
      items.push(
        'Pyramids', 'Sphinx', 'Pharaoh', 'Mummy', 'Hieroglyphics', 'Nile River', 'Tutankhamun',
        'Cleopatra', 'Ramses II', 'Cairo', 'Memphis', 'Thebes', 'Valley of Kings', 'Rosetta Stone',
        'Papyrus', 'Sarcophagus', 'Canopic jars', 'Ankh', 'Scarab', 'Obelisk', 'Temple',
        'Anubis', 'Ra', 'Isis', 'Osiris', 'Horus', 'Ancient Kingdom', 'Middle Kingdom', 'New Kingdom'
      );
      categories.push('Monuments', 'Pharaohs', 'Gods', 'Artifacts', 'Cities', 'Dynasties');
      facts.push(
        'Pyramids built 4500 years ago', 'Nile floods annually', 'Hieroglyphs are pictures',
        'Mummies preserved bodies', 'Pharaohs were god-kings', 'Sphinx guards pyramids'
      );
    }
    // Space-related mock content
    else if (normalizedTopic.includes('space') || normalizedTopic.includes('astro') || normalizedTopic.includes('planet')) {
      foundSpecificContent = true;
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
    // Dinosaur-related mock content
    else if (normalizedTopic.includes('dinosaur') || normalizedTopic.includes('dino') || normalizedTopic.includes('prehistoric')) {
      foundSpecificContent = true;
      items.push(
        'T-Rex', 'Triceratops', 'Stegosaurus', 'Brachiosaurus', 'Velociraptor', 'Pterodactyl',
        'Ankylosaurus', 'Diplodocus', 'Allosaurus', 'Spinosaurus', 'Pachycephalosaurus', 'Parasaurolophus',
        'Iguanodon', 'Archaeopteryx', 'Compsognathus', 'Deinonychus', 'Baryonyx', 'Carnotaurus',
        'Giganotosaurus', 'Therizinosaurus', 'Mosasaurus', 'Plesiosaur', 'Utahraptor', 'Ceratosaurus',
        'Kentrosaurus', 'Styracosaurus', 'Edmontosaurus', 'Maiasaura', 'Oviraptor', 'Gallimimus',
        'Amargasaurus', 'Irritator', 'Acrocanthosaurus', 'Carcharodontosaurus', 'Mapusaurus', 'Rugops'
      );
      categories.push('Carnivores', 'Herbivores', 'Flying Reptiles', 'Marine Reptiles', 'Time Periods', 'Fossils');
      facts.push(
        'T-Rex tiny arms', 'Ruled 165M yrs', 'Birds from dinos',
        'Asteroid end', 'Raptors=feathers', 'Stego plates',
        '3 horns=Trike', '40ft tall', 'Terrible lizard',
        'Found 1824', 'Some warm blood', '4 inch smallest'
      );
    }
    // Animal-related mock content
    else if (normalizedTopic.includes('animal') || normalizedTopic.includes('zoo') || normalizedTopic.includes('wildlife')) {
      foundSpecificContent = true;
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
    // Music-related mock content
    else if (normalizedTopic.includes('music') || normalizedTopic.includes('jazz') || normalizedTopic.includes('rock') || normalizedTopic.includes('classical')) {
      foundSpecificContent = true;
      if (normalizedTopic.includes('jazz')) {
        items.push(
          'Louis Armstrong', 'Duke Ellington', 'Miles Davis', 'John Coltrane', 'Charlie Parker',
          'Dizzy Gillespie', 'Billie Holiday', 'Ella Fitzgerald', 'Count Basie', 'Thelonious Monk',
          'Saxophone', 'Trumpet', 'Piano', 'Double bass', 'Drums', 'Clarinet',
          'Bebop', 'Swing', 'Cool jazz', 'Free jazz', 'Fusion', 'Blues',
          'Improvisation', 'Syncopation', 'Blue notes', 'Scat singing', 'Jazz club', 'Jam session'
        );
        categories.push('Jazz Musicians', 'Instruments', 'Jazz Styles', 'Techniques', 'Venues');
        facts.push(
          'Jazz originated in New Orleans', 'Bebop emerged in 1940s', 'Blue notes define jazz',
          'Improvisation is key', 'Swing era was 1930s-40s', 'Jazz influenced rock'
        );
      } else {
        items.push(
          'Guitar', 'Piano', 'Drums', 'Bass', 'Violin', 'Flute', 'Trumpet', 'Saxophone',
          'Melody', 'Harmony', 'Rhythm', 'Tempo', 'Beat', 'Chord', 'Scale', 'Note',
          'Concert', 'Album', 'Song', 'Band', 'Orchestra', 'Solo', 'Duet', 'Ensemble'
        );
        categories.push('Instruments', 'Music Theory', 'Performances', 'Ensembles', 'Elements');
        facts.push(
          'Music is universal', 'Rhythm drives music', 'Harmony creates depth',
          'Melody tells story', 'Tempo sets pace', 'Dynamics add emotion'
        );
      }
    }
    // History-related mock content
    else if (normalizedTopic.includes('history') || normalizedTopic.includes('ancient') || normalizedTopic.includes('war')) {
      foundSpecificContent = true;
      items.push(
        'Ancient Egypt', 'Roman Empire', 'Greek City-States', 'Medieval Period', 'Renaissance',
        'Industrial Revolution', 'World War I', 'World War II', 'Cold War', 'Space Race',
        'Napoleon', 'Caesar', 'Cleopatra', 'Alexander', 'Churchill', 'Lincoln',
        'Democracy', 'Monarchy', 'Republic', 'Empire', 'Revolution', 'Treaty'
      );
      categories.push('Time Periods', 'Leaders', 'Civilizations', 'Events', 'Governments');
      facts.push(
        'Rome fell in 476 AD', 'WWI ended in 1918', 'Moon landing 1969',
        'Berlin Wall fell 1989', 'Renaissance began 1300s', 'USA founded 1776'
      );
    }
    // Science-related mock content
    else if (normalizedTopic.includes('science') || normalizedTopic.includes('physics') || normalizedTopic.includes('chemistry') || normalizedTopic.includes('biology')) {
      foundSpecificContent = true;
      items.push(
        'Atom', 'Molecule', 'Cell', 'DNA', 'Evolution', 'Gravity', 'Energy', 'Matter',
        'Force', 'Motion', 'Light', 'Heat', 'Electricity', 'Magnetism', 'Chemical', 'Reaction',
        'Einstein', 'Newton', 'Darwin', 'Curie', 'Galileo', 'Hawking',
        'Theory', 'Hypothesis', 'Experiment', 'Observation', 'Data', 'Conclusion'
      );
      categories.push('Concepts', 'Scientists', 'Methods', 'Forces', 'Particles');
      facts.push(
        'E=mc²', 'Gravity is universal', 'Cells are life units',
        'DNA stores information', 'Energy is conserved', 'Light has dual nature'
      );
    }
    // Surfing-related mock content
    else if (normalizedTopic.includes('surf') || normalizedTopic.includes('wave') || normalizedTopic.includes('ocean')) {
      foundSpecificContent = true;
      // Mix of correct and incorrect answers
      items.push(
        // Correct surfing items
        'Ocean', 'Wave', 'Board', 'Wetsuit', 'Beach', 'Surf', 'Tide', 'Sand',
        'Paddle', 'Ride', 'Barrel', 'Tube', 'Break', 'Curl', 'Foam', 'Swell',
        'Longboard', 'Shortboard', 'Fin', 'Leash', 'Wax', 'Reef', 'Shore',
        'Lineup', 'Set', 'Duck dive', 'Pop up', 'Carve', 'Cutback', 'Floater',
        // Incorrect distractors
        'Mountain', 'Snow', 'Skiing', 'Basketball', 'Piano', 'Cooking', 'Desert',
        'Space', 'Robot', 'Books', 'Car', 'Television', 'Computer', 'Phone'
      );
      categories.push('Equipment', 'Techniques', 'Waves', 'Locations', 'Conditions');
      facts.push(
        'Waves carry energy', 'Tides change daily', 'Wax grips board',
        'Fins steer board', 'Leash saves board', 'Reefs shape waves'
      );
    }
    // Universal fallback system for ANY topic
    if (!foundSpecificContent) {
      console.log(`No specific content found for "${topic}", generating universal content...`);
      
      // Generate comprehensive universal content using intelligent algorithms
      const universalContent = this.generateUniversalContent(topic, subtopic, level);
      items.push(...universalContent.items);
      categories.push(...universalContent.categories);
      facts.push(...universalContent.facts);
    }
    
    // Add level-specific advanced content
    if (level > 10 && items.length < 30) {
      items.push(`Advanced ${topic}`, `Complex ${topic}`, `Expert ${topic}`);
      facts.push(`Expert ${topic} fact`);
    }
    
    // For mock content, separate correct from incorrect items intelligently
    const correctItems = items.filter((item, index) => {
      const itemLower = item.toLowerCase();
      const topicLower = topic.toLowerCase();
      
      // First half of items are generally topic-related (correct)
      if (index < items.length / 2) return true;
      
      // Check if item contains topic keywords
      return topicLower.split(' ').some(word => 
        word.length > 2 && itemLower.includes(word)
      );
    }).slice(0, 15);
    
    const incorrectItems = items.filter(item => !correctItems.includes(item)).slice(0, 15);
    
    // Add some universal distractors for incorrect items
    const universalDistractors = [
      'Pizza', 'Rainbow', 'Guitar', 'Elephant', 'Castle', 'Robot', 'Moon', 'Football',
      'Ice cream', 'Dragon', 'Butterfly', 'Superhero', 'Unicorn', 'Basketball', 'Computer'
    ];
    
    incorrectItems.push(...universalDistractors.slice(0, Math.max(0, 20 - incorrectItems.length)));
    
    return { 
      items: [...correctItems, ...incorrectItems].slice(0, 30), 
      categories: categories.slice(0, 8), 
      facts: facts.slice(0, 15),
      correctItems: correctItems,
      incorrectItems: incorrectItems.slice(0, 20)
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
    const normalizedTopic = this.normalizeTopic(topicLower);
    
    // Use ALL remaining AI items first (they're related but not correct)
    distractors.push(...remainingItems);
    
    // Topic-specific wrong answers
    let topicDistracters: string[] = [];
    
    if (normalizedTopic.includes('egypt')) {
      topicDistracters = [
        'Aztec pyramid', 'Mayan temple', 'Roman forum', 'Greek agora',
        'Viking longship', 'Samurai armor', 'Medieval castle', 'Renaissance art',
        'Merlin', 'King Arthur', 'Robin Hood', 'Hercules', 'Perseus', 'Achilles',
        'Excalibur', 'Holy Grail', 'Pandora box', 'Trojan horse'
      ];
    } else if (normalizedTopic.includes('space') || normalizedTopic.includes('astro')) {
      topicDistracters = [
        'Flat Earth', 'Geocentric model', 'Aether', 'Phlogiston',
        'Crystal spheres', 'Firmament', 'Turtles all the way', 'Sky dome',
        'Cheese moon', 'Canals on Mars', 'Planet X', 'Nibiru',
        'Hollow Earth', 'Space whales', 'Star gates', 'Sky cities'
      ];
    } else if (normalizedTopic.includes('dinosaur') || normalizedTopic.includes('dino')) {
      topicDistracters = [
        'Dragon', 'Godzilla', 'Barney', 'Yoshi', 'Dino Flintstone', 'Land Before Time',
        'Jurassic Park', 'King Kong', 'Mothra', 'Rodan', 'Mechagodzilla', 'Kaiju',
        'Pokemon', 'Charizard', 'Aerodactyl', 'Time machine', 'Cave painting', 'Stone age',
        'Ice age', 'Woolly rhino', 'Giant sloth', 'Terror bird', 'Megashark', 'Titanboa',
        'Mammoth', 'Saber-tooth', 'Caveman', 'Neanderthal', 'Fossil fuel', 'Coal',
        'Oil', 'Gas', 'Amber', 'Tar pit', 'Meteor', 'Asteroid', 'Comet', 'Volcano',
        'Earthquake', 'Tsunami', 'Glacier', 'Pangaea', 'Gondwana', 'Laurasia'
      ];
    } else if (normalizedTopic.includes('animal')) {
      topicDistracters = [
        'Dragon', 'Unicorn', 'Phoenix', 'Griffin', 'Pegasus', 'Chimera',
        'Minotaur', 'Centaur', 'Kraken', 'Yeti', 'Bigfoot', 'Loch Ness',
        'Chupacabra', 'Jackalope', 'Drop bear', 'Snipe', 'Dodo clone', 'Megalodon'
      ];
    } else if (normalizedTopic.includes('jazz') || normalizedTopic.includes('music')) {
      topicDistracters = [
        'Kazoo', 'Vuvuzela', 'Spoons', 'Washboard', 'Jug', 'Cowbell', 'Whistle',
        'Noise', 'Static', 'Silence', 'Mumbling', 'Screaming', 'Shouting', 'Crying',
        'Beeping', 'Buzzing', 'Humming', 'Clicking', 'Tapping', 'Scratching', 'Popping',
        'Disco', 'Polka', 'Yodeling', 'Rap', 'Opera', 'Punk', 'Metal', 'Techno'
      ];
    } else {
      // Generate contextual distractors that are plausible but wrong
      topicDistracters = [
        'Unknown item', 'Mystery object', 'Classified info', 'Redacted data',
        'Missing file', 'Corrupted entry', 'Access denied', 'Restricted access',
        'Coming soon', 'Under review', 'Beta version', 'Prototype item',
        'Placeholder', 'Template', 'Example', 'Sample data'
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
    
    // If we STILL need more, recycle the topic-specific distractors
    let recycleIndex = 0;
    while (distractors.length < count && recycleIndex < topicDistracters.length) {
      const variant = topicDistracters[recycleIndex];
      if (!distractors.includes(variant)) {
        distractors.push(variant);
      }
      recycleIndex++;
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
    const topicLower = topic.toLowerCase();
    const normalizedTopic = this.normalizeTopic(topicLower);
    
    // Generate topic-specific realistic distractors
    let topicSpecificDistracters: string[] = [];
    
    if (normalizedTopic.includes('dinosaur') || normalizedTopic.includes('dino')) {
      topicSpecificDistracters = [
        'Dragon', 'Godzilla', 'Barney', 'Yoshi', 'Dino Flintstone', 'King Kong',
        'Mothra', 'Rodan', 'Kaiju', 'Pokemon', 'Charizard', 'Aerodactyl',
        'Mammoth', 'Saber-tooth', 'Caveman', 'Neanderthal', 'Stone age', 'Ice age',
        'Woolly rhino', 'Giant sloth', 'Terror bird', 'Megashark', 'Titanboa',
        'Fossil fuel', 'Coal', 'Oil', 'Gas', 'Amber', 'Tar pit', 'Meteor',
        'Asteroid', 'Comet', 'Volcano', 'Earthquake', 'Tsunami', 'Glacier',
        'Pangaea', 'Gondwana', 'Laurasia', 'Prehistoric', 'Ancient', 'Evolution',
        'Extinction', 'Paleontology', 'Archaeology', 'Geology', 'Biology'
      ];
    } else if (normalizedTopic.includes('space') || normalizedTopic.includes('astro')) {
      topicSpecificDistracters = [
        'Flat Earth', 'Geocentric', 'Aether', 'Phlogiston', 'Crystal spheres',
        'Firmament', 'Sky dome', 'Cheese moon', 'Canals on Mars', 'Planet X',
        'Nibiru', 'Hollow Earth', 'Space whales', 'Star gates', 'UFO', 'Alien',
        'Martian', 'Venusian', 'Jupiterian', 'Saturnian', 'Mercurian',
        'Neptunian', 'Uranian', 'Earthling', 'Moonman', 'Asteroid belt',
        'Oort cloud', 'Kuiper belt', 'Dark matter', 'Dark energy'
      ];
    } else if (normalizedTopic.includes('animal') || normalizedTopic.includes('zoo')) {
      topicSpecificDistracters = [
        'Dragon', 'Unicorn', 'Phoenix', 'Griffin', 'Pegasus', 'Chimera',
        'Minotaur', 'Centaur', 'Kraken', 'Yeti', 'Bigfoot', 'Loch Ness',
        'Chupacabra', 'Jackalope', 'Drop bear', 'Snipe', 'Dodo', 'Megalodon',
        'Sasquatch', 'Wendigo', 'Thunderbird', 'Banshee', 'Gargoyle', 'Sphinx',
        'Hydra', 'Cerberus', 'Manticore', 'Wyvern', 'Basilisk', 'Cyclops'
      ];
    } else {
      // Generic cross-category distractors
      topicSpecificDistracters = [
        'Jupiter', 'Saturn', 'Mars', 'Venus', 'Mercury', 'Neptune', 'Uranus',
        'Lion', 'Tiger', 'Bear', 'Elephant', 'Giraffe', 'Zebra', 'Monkey',
        'Paris', 'London', 'Tokyo', 'New York', 'Berlin', 'Rome', 'Madrid',
        'Mozart', 'Einstein', 'Newton', 'Darwin', 'Shakespeare', 'Picasso',
        'Pizza', 'Burger', 'Sushi', 'Pasta', 'Tacos', 'Salad', 'Soup',
        'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink',
        'Football', 'Basketball', 'Tennis', 'Soccer', 'Baseball', 'Golf',
        'Guitar', 'Piano', 'Violin', 'Drums', 'Trumpet', 'Saxophone'
      ];
    }
    
    // Add topic-specific distractors first
    for (const distractor of topicSpecificDistracters) {
      if (distractors.length >= count) break;
      if (!correctAnswers.includes(distractor) && !distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }
    
    // If we still need more, add some generic ones
    const genericDistracters = [
      'Unknown', 'Mystery', 'Secret', 'Hidden', 'Lost', 'Found', 'Ancient',
      'Modern', 'Classic', 'New', 'Old', 'Rare', 'Common', 'Special',
      'Unique', 'Regular', 'Normal', 'Strange', 'Weird', 'Odd', 'Unusual'
    ];
    
    for (const distractor of genericDistracters) {
      if (distractors.length >= count) break;
      if (!correctAnswers.includes(distractor) && !distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }
    
    // Shuffle to make it less predictable
    return distractors.sort(() => Math.random() - 0.5).slice(0, count);
  }
  
  private generateHints(topic: string, correctAnswers: string[]): string[] {
    return [
      `Look for items containing "${topic}"`,
      `${correctAnswers.length} correct answers to find`,
      `Think about what relates to ${topic}`,
      `Some answers may be tricky!`
    ];
  }
  
  private generateUniversalContent(
    topic: string,
    subtopic: string,
    level: number
  ): AITopicContent {
    const items: string[] = [];
    const categories: string[] = [];
    const facts: string[] = [];
    
    // Clean and process the topic
    const cleanTopic = topic.trim().toLowerCase();
    const topicWords = cleanTopic.split(/\s+/).filter(word => word.length > 0);
    const mainTopic = topicWords[0] || cleanTopic;
    
    if (import.meta.env.DEV) {
      console.log(`Generating universal content for: "${topic}" (words: ${topicWords.join(', ')})`);
    }
    
    // Generate topic-specific items using intelligent word analysis
    const topicVariations = this.generateTopicVariations(cleanTopic, topicWords);
    items.push(...topicVariations);
    
    // Generate contextual items based on topic patterns
    const contextualItems = this.generateContextualItems(cleanTopic, topicWords, level);
    items.push(...contextualItems);
    
    // Generate related academic/educational items
    const academicItems = this.generateAcademicItems(cleanTopic, topicWords);
    items.push(...academicItems);
    
    // Generate categories
    categories.push(
      'Types', 'Examples', 'Basics', 'Advanced', 'Modern', 'Traditional',
      'Popular', 'Historical'
    );
    
    // Generate facts
    facts.push(
      `${topic} is educational`, `Study ${topic}`, `Learn ${topic}`,
      `${topic} knowledge`, `${topic} facts`, `${topic} examples`
    );
    
    return {
      items: items.slice(0, 30),
      categories: categories.slice(0, 8),
      facts: facts.slice(0, 15)
    };
  }
  
  private generateTopicVariations(topic: string, words: string[]): string[] {
    const variations: string[] = [];
    
    // Add the main topic and its variations
    variations.push(topic);
    if (topic.endsWith('s')) {
      variations.push(topic.slice(0, -1)); // Remove 's' if plural
    } else {
      variations.push(topic + 's'); // Add 's' if singular
    }
    
    // Add individual words if multi-word topic
    words.forEach(word => {
      if (word.length > 2) {
        variations.push(word);
        variations.push(word.charAt(0).toUpperCase() + word.slice(1));
      }
    });
    
    // Add common prefixes and suffixes
    const prefixes = ['Super', 'Mini', 'Mega', 'Ultra', 'Pro', 'Basic', 'Modern'];
    const suffixes = ['Style', 'Type', 'Kind', 'Form', 'Method', 'Way'];
    
    prefixes.forEach(prefix => {
      variations.push(`${prefix} ${topic}`);
    });
    
    suffixes.forEach(suffix => {
      variations.push(`${topic} ${suffix}`);
    });
    
    return variations.slice(0, 15);
  }
  
  private generateContextualItems(topic: string, words: string[], level: number): string[] {
    const contextual: string[] = [];
    
    // Educational levels
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];
    levels.forEach(levelName => {
      contextual.push(`${levelName} ${topic}`);
    });
    
    // Academic terms
    const academic = ['Study', 'Research', 'Analysis', 'Theory', 'Practice', 'Example'];
    academic.forEach(term => {
      contextual.push(`${topic} ${term}`);
    });
    
    // Time-based variations
    const times = ['Classic', 'Modern', 'Ancient', 'Future', 'Current', 'Traditional'];
    times.forEach(time => {
      contextual.push(`${time} ${topic}`);
    });
    
    // Quality descriptors
    const qualities = ['Best', 'Top', 'Great', 'Famous', 'Popular', 'Important'];
    qualities.forEach(quality => {
      contextual.push(`${quality} ${topic}`);
    });
    
    return contextual.slice(0, 20);
  }
  
  private generateAcademicItems(topic: string, words: string[]): string[] {
    const academic: string[] = [];
    
    // Generic academic terms that work with any topic
    const academicTerms = [
      'Facts', 'Information', 'Knowledge', 'Data', 'Evidence', 'Examples',
      'Principles', 'Concepts', 'Ideas', 'Methods', 'Techniques', 'Approaches',
      'History', 'Origin', 'Development', 'Evolution', 'Progress', 'Future'
    ];
    
    academicTerms.forEach(term => {
      academic.push(`${topic} ${term}`);
    });
    
    // Subject-specific academic terms
    const subjects = [
      'Science', 'Art', 'Culture', 'Society', 'Technology', 'Nature',
      'Education', 'Research', 'Innovation', 'Discovery'
    ];
    
    subjects.forEach(subject => {
      academic.push(`${topic} in ${subject}`);
    });
    
    return academic.slice(0, 15);
  }

  private normalizeTopic(topic: string): string {
    // Common typo corrections and variations
    const corrections: { [key: string]: string } = {
      'egeypt': 'egypt',
      'egpyt': 'egypt',
      'egyp': 'egypt',
      'egipt': 'egypt',
      'ejypt': 'egypt',
      'dinasour': 'dinosaur',
      'dinasaur': 'dinosaur',
      'dinosaurt': 'dinosaur',
      'dinosour': 'dinosaur',
      'dino': 'dinosaur',
      'sapce': 'space',
      'spce': 'space',
      'spoace': 'space',
      'msic': 'music',
      'mucis': 'music',
      'misuc': 'music',
      'jaz': 'jazz',
      'jazs': 'jazz',
      'jasz': 'jazz',
      'animl': 'animal',
      'anmal': 'animal',
      'animla': 'animal',
      'hsitory': 'history',
      'histry': 'history',
      'histroy': 'history',
      'scince': 'science',
      'sceince': 'science',
      'scienc': 'science'
    };
    
    // Check for exact match first
    if (corrections[topic]) {
      return corrections[topic];
    }
    
    // Check if topic contains any of the typos
    for (const [typo, correct] of Object.entries(corrections)) {
      if (topic.includes(typo)) {
        return topic.replace(typo, correct);
      }
    }
    
    return topic;
  }
}

// Export singleton instance
export const aiService = new AIService();