import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";
import { aiService, AIGeneratedContent } from "../services/aiService";

export class CustomTopic extends TopicProvider {
  private userTopic: string;
  private generatedContent: string[] = [];
  private currentSubtopic: string = 'all';
  private contentCache: Map<string, string[]> = new Map();
  private currentLevel: number = 1;
  private currentChallengeData: AIGeneratedContent | null = null;
  
  constructor(userTopic: string) {
    super();
    this.userTopic = userTopic;
  }
  
  getName(): string {
    return `Custom: ${this.userTopic}`;
  }
  
  getIcon(): string {
    return "✨"; // Magic/custom icon
  }
  
  getDescription(): string {
    return `Custom board about ${this.userTopic}`;
  }
  
  getColor(): string {
    return "bg-gradient-to-r from-purple-500 to-pink-500";
  }
  
  getSubtopics(): { id: string; name: string; description: string }[] {
    return [
      { id: 'all', name: 'Everything', description: `All aspects of ${this.userTopic}` },
      { id: 'facts', name: 'Facts', description: `Facts about ${this.userTopic}` },
      { id: 'trivia', name: 'Trivia', description: `Trivia questions about ${this.userTopic}` },
      { id: 'related', name: 'Related Items', description: `Things related to ${this.userTopic}` }
    ];
  }
  
  setSubtopic(subtopicId: string): void {
    this.currentSubtopic = subtopicId;
  }
  
  async generateContent(): Promise<string[]> {
    // Check cache first
    const cacheKey = `${this.userTopic}-${this.currentSubtopic}-${this.currentLevel}`;
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey)!;
    }
    
    // Use AI service to generate content
    const topicContent = await aiService.generateTopicContent(
      this.userTopic,
      this.currentSubtopic,
      this.currentLevel
    );
    
    // Combine all generated items (no prefixes to save space)
    const allItems = [
      ...topicContent.items,
      ...topicContent.facts,
      ...topicContent.categories
    ];
    
    // Cache the results
    this.contentCache.set(cacheKey, allItems);
    return allItems;
  }
  
  async generateChallenge(level: number): Promise<Challenge> {
    // Update current level for content generation
    this.currentLevel = level;
    
    // Generate content for this level
    this.generatedContent = await this.generateContent();
    
    // Use AI service to generate a challenge
    const challenge = await aiService.generateChallenge(
      this.userTopic,
      this.generatedContent,
      level
    );
    
    // Store the challenge data for use in generateGrid
    this.currentChallengeData = challenge;

    return {
      description: challenge.description,
      checkAnswer: (value: string) => {
        // Normalize both the input value and correct answers for comparison
        const normalizedValue = value.trim().toLowerCase();
        const isCorrect = challenge.correctAnswers.some(answer => 
          answer.trim().toLowerCase() === normalizedValue
        );
        
        return isCorrect;
      }
    };
  }
  
  async generateGrid(width: number, height: number, challenge: Challenge): Promise<GridCell[][]> {
    const grid = this.createEmptyGrid(width, height);
    
    // Use the stored challenge data from generateChallenge
    if (!this.currentChallengeData) {
      return grid;
    }
    
    const challengeData = this.currentChallengeData;

    // Calculate total cells - we want to fill ALL of them
    const totalCells = width * height;
    
    // Get all available answers from AI-generated content
    let allAnswers = [
      ...(challengeData.correctAnswers || []),
      ...(challengeData.incorrectAnswers || [])
    ];
    
    // If we don't have enough answers, generate more distractors
    while (allAnswers.length < totalCells) {
      const additionalDistractors = this.generateAdditionalDistractors(
        this.userTopic,
        totalCells - allAnswers.length,
        challengeData.correctAnswers || []
      );
      allAnswers = [...allAnswers, ...additionalDistractors];
    }
    
    // Ensure we have exactly the right number of items
    allAnswers = allAnswers.slice(0, totalCells);
    
    const shuffledAnswers = this.shuffleArray(allAnswers);
    
    // Create position array and shuffle it
    const positions: Array<{x: number, y: number}> = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        positions.push({x, y});
      }
    }
    const shuffledPositions = this.shuffleArray(positions);
    
    // Place answers on grid with proper correct/incorrect marking
    for (let i = 0; i < shuffledAnswers.length && i < shuffledPositions.length; i++) {
      const pos = shuffledPositions[i];
      const answer = shuffledAnswers[i];
      
      // Determine if answer is correct by checking against AI-provided correct answers
      const normalizedAnswer = answer.trim().toLowerCase();
      const isCorrect = (challengeData.correctAnswers || []).some((correctAnswer: string) => 
        correctAnswer.trim().toLowerCase() === normalizedAnswer
      );
      
      grid[pos.y][pos.x] = {
        value: answer,
        isCorrect,
        isMunched: false,
        isEmpty: false
      };
    }
    
    return grid;
  }
  
  private generateAdditionalDistractors(
    topic: string,
    count: number,
    correctAnswers: string[]
  ): string[] {
    const distractors: string[] = [];
    const topicLower = topic.toLowerCase();
    
    // Normalize topic to handle typos
    const normalizedTopic = this.normalizeTopic(topicLower);
    
    // Generate contextually relevant distractors based on the topic
    let additionalPool: string[] = [];
    
    if (normalizedTopic.includes('egypt')) {
      additionalPool = [
        'Babylon', 'Mesopotamia', 'Atlantis', 'Troy', 'Pompeii', 'Machu Picchu',
        'Zeus', 'Odin', 'Thor', 'Apollo', 'Athena', 'Jupiter',
        'Colosseum', 'Parthenon', 'Great Wall', 'Taj Mahal', 'Eiffel Tower',
        'Vikings', 'Samurai', 'Knights', 'Spartans', 'Romans', 'Greeks',
        'Stonehenge', 'Easter Island', 'Petra', 'Angkor Wat', 'Chichen Itza'
      ];
    } else if (normalizedTopic.includes('space') || normalizedTopic.includes('astro')) {
      additionalPool = [
        'Quasar', 'Pulsar', 'Supernova', 'Red giant', 'White dwarf',
        'Neutron star', 'Solar wind', 'Aurora', 'Cosmic rays', 'Dark energy',
        'Exoplanet', 'Binary star', 'Spiral galaxy', 'Elliptical galaxy',
        'Space debris', 'Lunar eclipse', 'Solar flare', 'Asteroid belt',
        'Kuiper belt', 'Oort cloud', 'Space probe', 'Ion drive', 'Warp drive',
        'Light year', 'Parsec', 'Red shift', 'Blue shift', 'Big Bang'
      ];
    } else if (topicLower.includes('animal') || topicLower.includes('zoo')) {
      additionalPool = [
        'Cheetah', 'Leopard', 'Jaguar', 'Cougar', 'Lynx', 'Bobcat',
        'Gazelle', 'Antelope', 'Wildebeest', 'Hyena', 'Jackal', 'Coyote',
        'Otter', 'Beaver', 'Muskrat', 'Badger', 'Raccoon', 'Opossum',
        'Platypus', 'Echidna', 'Wombat', 'Tasmanian devil', 'Dingo',
        'Lemur', 'Gorilla', 'Chimpanzee', 'Orangutan', 'Gibbon', 'Baboon'
      ];
    } else if (normalizedTopic.includes('dinosaur') || normalizedTopic.includes('dino') || normalizedTopic.includes('prehistoric')) {
      additionalPool = [
        'Brontosaurus', 'Apatosaurus', 'Gallimimus', 'Protoceratops', 'Styracosaurus',
        'Dilophosaurus', 'Ceratosaurus', 'Megalosaurus', 'Oviraptor', 'Ornithomimus',
        'Quetzalcoatlus', 'Dimorphodon', 'Rhamphorhynchus', 'Ichthyosaurus', 'Kronosaurus',
        'Dimetrodon', 'Edaphosaurus', 'Coelophysis', 'Herrerasaurus', 'Plateosaurus',
        'Mesozoic Era', 'Pangaea', 'Gondwana', 'Laurasia', 'Mass extinction',
        'Meteor impact', 'Volcanic eruption', 'Climate change', 'Sea level rise',
        'Fossilization', 'Paleontologist', 'Excavation', 'Carbon dating', 'Sedimentary rock'
      ];
    } else if (topicLower.includes('movie') || topicLower.includes('film')) {
      additionalPool = [
        'Action', 'Drama', 'Comedy', 'Horror', 'Thriller', 'Romance',
        'Sci-Fi', 'Fantasy', 'Animation', 'Documentary', 'Musical', 'Western',
        'Director', 'Producer', 'Actor', 'Actress', 'Screenplay', 'Cinema',
        'Box office', 'Premiere', 'Sequel', 'Prequel', 'Remake', 'Adaptation',
        'Oscar', 'Emmy', 'Golden Globe', 'Cannes', 'Sundance', 'Festival'
      ];
    } else if (topicLower.includes('jazz') || topicLower.includes('music')) {
      additionalPool = [
        'Banjo', 'Harp', 'Organ', 'Cello', 'Oboe', 'Tuba', 'Xylophone', 'Bassoon',
        'Clarinet', 'Piccolo', 'Viola', 'Mandolin', 'Accordion', 'Bagpipes', 'Ukulele',
        'Forte', 'Adagio', 'Staccato', 'Legato', 'Crescendo', 'Diminuendo', 'Allegro',
        'Sonata', 'Waltz', 'Polka', 'Tango', 'Samba', 'Rumba', 'Foxtrot', 'Swing',
        'Opera', 'Ballet', 'Musical', 'Recital', 'Symphony', 'Concerto', 'Quartet'
      ];
    } else {
      // Generic distractors for any topic - use short words
      const shortTopic = topic.split(' ')[0]; // Use only first word
      additionalPool = [
        'Variant', 'Type', 'Model', 'Version', 'Style', 'Form', 'Method', 'Approach',
        'Alternative', 'Classic', 'Modern', 'Traditional', 'Popular', 'Rare', 'Common', 'Unique',
        'Basic', 'Advanced', 'Simple', 'Complex', 'Original', 'Modified', 'Enhanced', 'Standard',
        `${shortTopic}A`, `${shortTopic}B`, `${shortTopic}C`, `${shortTopic}1`, `${shortTopic}2`, `${shortTopic}3`
      ];
    }
    
    // Shuffle the pool and take what we need
    const shuffled = additionalPool.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      if (!correctAnswers.includes(shuffled[i])) {
        distractors.push(shuffled[i]);
      }
    }
    
    // If we still need more, just repeat from the topic-specific pool
    // Don't create generic "Fake" or "Mock" labels - these look unprofessional
    let poolIndex = 0;
    while (distractors.length < count && poolIndex < additionalPool.length) {
      const variant = additionalPool[poolIndex];
      if (!distractors.includes(variant) && !correctAnswers.includes(variant)) {
        distractors.push(variant);
      }
      poolIndex++;
      
      // If we've gone through the pool, start over with slight modifications
      if (poolIndex >= additionalPool.length) {
        poolIndex = 0;
        // Add a simple modifier to make it different
        const modifiedItem = additionalPool[poolIndex % additionalPool.length];
        if (!distractors.includes(modifiedItem)) {
          distractors.push(modifiedItem);
        }
      }
    }
    
    return distractors;
  }
  
  private normalizeTopic(topic: string): string {
    return aiService.normalizeTopic(topic);
  }
}