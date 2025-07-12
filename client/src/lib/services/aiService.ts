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
    
    // Debug logging
    console.log('AI Service initialized:', {
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0,
      apiKeyPreview: this.apiKey ? `${this.apiKey.substring(0, 7)}...` : 'not set',
      allEnvKeys: Object.keys(import.meta.env),
      allEnvValues: import.meta.env,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD
    });
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
            facts: cached.facts
          };
        }
      }
    } catch (error) {
      console.error('Cache lookup failed:', error);
    }
    
    // If no API is configured, use advanced mock generation
    if (!this.apiKey || !this.apiEndpoint || this.apiKey === 'undefined') {
      console.log('No API key configured, using mock content for:', topic);
      const mockContent = await this.generateMockContent(topic, subtopic, level);
      
      // Save mock content to cache
      this.saveToCacheInBackground(topic, subtopic, mockContent, 'mock');
      
      return mockContent;
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
      const aiContent = this.parseOpenAIResponse(data);
      
      // Save AI-generated content to cache
      this.saveToCacheInBackground(topic, subtopic, aiContent, 'openai');
      
      return aiContent;
    } catch (error) {
      console.error('AI generation failed, using mock content:', error);
      const mockContent = await this.generateMockContent(topic, subtopic, level);
      
      // Save mock content to cache
      this.saveToCacheInBackground(topic, subtopic, mockContent, 'mock');
      
      return mockContent;
    }
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
    
    // Determine number of correct answers based on level and grid size
    // For smaller grids, we need fewer correct answers
    const totalCells = 48; // Average grid size
    const minCorrect = Math.min(2 + Math.floor(level / 4), Math.floor(totalCells * 0.2), items.length);
    const maxCorrect = Math.min(minCorrect + 3, Math.floor(totalCells * 0.35), items.length);
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
  "items": [array of 25-30 VERY SHORT items/phrases related to ${topic}, each 1-2 words MAX],
  "categories": [array of 5-8 category names, each 1-2 words],
  "facts": [array of 10-15 facts about ${topic}, each under 15 characters]
}

CRITICAL Requirements:
- ALL items MUST be 1-2 words maximum (prefer single words)
- NO phrases longer than 2 words
- Categories: 1-2 words only
- Facts: Maximum 15 characters each
- Use abbreviations if needed
- Single nouns preferred
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
    
    // Handle common typos and variations
    const normalizedTopic = this.normalizeTopic(topicLower);
    
    // Egypt/Ancient civilization content
    if (normalizedTopic.includes('egypt') || topicLower.includes('pyramid') || topicLower.includes('pharaoh')) {
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
      items.push(
        'T-Rex', 'Triceratops', 'Stegosaurus', 'Brachiosaurus', 'Velociraptor', 'Pterodactyl',
        'Ankylosaurus', 'Diplodocus', 'Allosaurus', 'Spinosaurus', 'Pachycephalosaurus', 'Parasaurolophus',
        'Iguanodon', 'Archaeopteryx', 'Compsognathus', 'Deinonychus', 'Baryonyx', 'Carnotaurus',
        'Giganotosaurus', 'Therizinosaurus', 'Mosasaurus', 'Plesiosaur', 'Mammoth', 'Saber-tooth',
        'Triassic', 'Jurassic', 'Cretaceous', 'Fossil', 'Extinction', 'Paleontology'
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
    // Default generic content - try to be more creative
    else {
      // Try to extract keywords from the topic
      const words = topic.toLowerCase().split(' ');
      
      // Generate more natural items based on the topic
      const templates = [
        'Classic', 'Modern', 'Traditional', 'Contemporary', 'Popular',
        'Famous', 'Notable', 'Essential', 'Important', 'Key',
        'Primary', 'Major', 'Leading', 'Top', 'Best',
        'Original', 'Authentic', 'Genuine', 'Real', 'True'
      ];
      
      // Create shorter items
      items.push(topic, `${topic}s`, 'Basic', 'Advanced', 'Expert', 'Beginner');
      
      // Add more short items
      const shortItems = topic.split(' ');
      if (shortItems.length > 1) {
        items.push(...shortItems);
      }
      items.push('Type A', 'Type B', 'Type C', 'Method 1', 'Method 2', 'Level 1', 'Level 2');
      
      // Categories based on topic
      categories.push('Types', 'Styles', 'Forms', 'Methods', 'Levels');
      
      // Facts about the topic
      facts.push(
        'Fascinating', 'Rich history', 'Many types', 'Evolving', 'Global study'
      );
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
        'Dragon', 'Godzilla', 'Barney', 'Yoshi', 'Dino from Flintstones', 'Land Before Time',
        'Jurassic Park', 'King Kong', 'Mothra', 'Rodan', 'Mechagodzilla', 'Kaiju',
        'Pokemon', 'Charizard', 'Aerodactyl clone', 'Time machine', 'Cave painting', 'Stone age',
        'Ice age', 'Woolly rhino', 'Giant sloth', 'Terror bird', 'Megashark', 'Titanboa'
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