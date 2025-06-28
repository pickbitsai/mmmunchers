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
    
    // Calculate total cells and how many should be filled
    const totalCells = width * height;
    const filledCells = Math.min(
      Math.floor(totalCells * 0.7), // Fill 70% of the grid
      challengeData.correctAnswers.length + challengeData.incorrectAnswers.length
    );
    
    // Combine and shuffle all answers
    const allAnswers = [
      ...challengeData.correctAnswers,
      ...challengeData.incorrectAnswers
    ].slice(0, filledCells);
    
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
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}