import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";
import { aiService } from "../services/aiService";

export class CustomTopic extends TopicProvider {
  private userTopic: string;
  private generatedContent: string[] = [];
  private currentSubtopic: string = 'all';
  private contentCache: Map<string, string[]> = new Map();
  private currentLevel: number = 1;
  private currentChallengeData: any = null;
  
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
    
    // Combine all generated items
    const allItems = [
      ...topicContent.items,
      ...topicContent.facts.map(fact => `Fact: ${fact}`),
      ...topicContent.categories.map(cat => `Category: ${cat}`)
    ];
    
    // Cache the results
    this.contentCache.set(cacheKey, allItems);
    return allItems;
  }
  
  private async mockAIGenerate(): Promise<string[]> {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate mock content based on subtopic
    const baseItems = this.userTopic.toLowerCase().split(' ');
    const items: string[] = [];
    
    switch (this.currentSubtopic) {
      case 'facts':
        items.push(`${this.userTopic} fact 1`);
        items.push(`${this.userTopic} fact 2`);
        items.push(`${this.userTopic} fact 3`);
        items.push(`Amazing ${this.userTopic}`);
        items.push(`True about ${this.userTopic}`);
        break;
      case 'trivia':
        items.push(`${this.userTopic} trivia 1`);
        items.push(`${this.userTopic} trivia 2`);
        items.push(`Question: ${this.userTopic}`);
        items.push(`Did you know: ${this.userTopic}`);
        break;
      case 'related':
        items.push(`Related to ${this.userTopic}`);
        items.push(`Similar to ${this.userTopic}`);
        items.push(`Part of ${this.userTopic}`);
        items.push(`${this.userTopic} connection`);
        break;
      default:
        // Mix of everything
        items.push(...baseItems);
        items.push(`${this.userTopic} item`);
        items.push(`About ${this.userTopic}`);
        items.push(`${this.userTopic} example`);
        items.push(`Learn ${this.userTopic}`);
    }
    
    // Add more variety
    for (let i = 0; i < 20; i++) {
      items.push(`${this.userTopic} ${i + 1}`);
    }
    
    return items;
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
      checkAnswer: (value: string) => challenge.correctAnswers.includes(value)
    };
  }
  
  async generateGrid(width: number, height: number, challenge: Challenge): Promise<GridCell[][]> {
    const grid = this.createEmptyGrid(width, height);
    
    // Use the stored challenge data from generateChallenge
    if (!this.currentChallengeData) {
      console.error('No challenge data available for grid generation');
      return grid;
    }
    
    const challengeData = this.currentChallengeData;
    
    // Calculate total cells - we want to fill ALL of them
    const totalCells = width * height;
    
    // Get all available answers
    let allAnswers = [
      ...challengeData.correctAnswers,
      ...challengeData.incorrectAnswers
    ];
    
    // If we don't have enough answers, generate more distractors
    while (allAnswers.length < totalCells) {
      // Add variations or duplicates with slight modifications
      const additionalDistractors = this.generateAdditionalDistractors(
        this.userTopic,
        totalCells - allAnswers.length,
        challengeData.correctAnswers
      );
      allAnswers = [...allAnswers, ...additionalDistractors];
    }
    
    // Ensure we have exactly the right number of items
    allAnswers = allAnswers.slice(0, totalCells);
    
    const shuffledAnswers = this.shuffleArray(allAnswers);
    
    // Place answers randomly on the grid
    const positions: Array<{x: number, y: number}> = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        positions.push({x, y});
      }
    }
    
    const shuffledPositions = this.shuffleArray(positions);
    
    for (let i = 0; i < shuffledAnswers.length && i < shuffledPositions.length; i++) {
      const pos = shuffledPositions[i];
      const answer = shuffledAnswers[i];
      const isCorrect = challengeData.correctAnswers.includes(answer);
      
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
    
    // Generate contextually relevant distractors based on the topic
    let additionalPool: string[] = [];
    
    if (topicLower.includes('space') || topicLower.includes('astro')) {
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
    } else if (topicLower.includes('movie') || topicLower.includes('film')) {
      additionalPool = [
        'Action', 'Drama', 'Comedy', 'Horror', 'Thriller', 'Romance',
        'Sci-Fi', 'Fantasy', 'Animation', 'Documentary', 'Musical', 'Western',
        'Director', 'Producer', 'Actor', 'Actress', 'Screenplay', 'Cinema',
        'Box office', 'Premiere', 'Sequel', 'Prequel', 'Remake', 'Adaptation',
        'Oscar', 'Emmy', 'Golden Globe', 'Cannes', 'Sundance', 'Festival'
      ];
    } else {
      // Generic distractors for any topic
      additionalPool = [
        `${topic} variant`, `${topic} type`, `${topic} model`, `${topic} version`,
        `${topic} style`, `${topic} form`, `${topic} method`, `${topic} approach`,
        `Alternative ${topic}`, `Classic ${topic}`, `Modern ${topic}`, `Traditional ${topic}`,
        `Popular ${topic}`, `Rare ${topic}`, `Common ${topic}`, `Unique ${topic}`,
        `Basic ${topic}`, `Advanced ${topic}`, `Simple ${topic}`, `Complex ${topic}`,
        `Original ${topic}`, `Modified ${topic}`, `Enhanced ${topic}`, `Standard ${topic}`
      ];
    }
    
    // Shuffle the pool and take what we need
    const shuffled = additionalPool.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      if (!correctAnswers.includes(shuffled[i])) {
        distractors.push(shuffled[i]);
      }
    }
    
    // If we still need more, create numbered variants
    while (distractors.length < count) {
      const variant = `${topic} option ${distractors.length + 1}`;
      distractors.push(variant);
    }
    
    return distractors;
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}