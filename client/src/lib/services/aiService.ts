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
    }
  }
  
  async generateChallenge(
    topic: string,
    items: string[],
    level: number
  ): Promise<AIGeneratedContent> {
    // If we don't have enough items, use what we have
    if (items.length === 0) {
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
    } else {
      // Fallback to the old classification method
      const separated = this.separateCorrectFromIncorrect(topic, items);
      correct = separated.correct;
      incorrect = separated.incorrect;
    }
    
    if (isEverythingChallenge) {
      // For "everything about" challenges, use ALL correct items
      correctAnswers = [...correct];
      incorrectAnswers = [...incorrect];
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

  normalizeTopic(topic: string): string {
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