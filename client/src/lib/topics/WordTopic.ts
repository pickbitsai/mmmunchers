import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class WordTopic extends TopicProvider {
  private selectedCategory: string = 'random';
  
  setCategory(category: string): void {
    this.selectedCategory = category;
  }
  
  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'nouns', name: 'Nouns' },
      { id: 'verbs', name: 'Verbs' },
      { id: 'adjectives', name: 'Adjectives' },
      { id: 'word_length', name: 'Word Length' },
      { id: 'word_endings', name: 'Word Endings' },
      { id: 'vowel_patterns', name: 'Vowel Patterns' }
    ];
  }
  
  private readonly nouns = [
    "cat", "dog", "house", "car", "tree", "book", "phone", "chair", "table", "water",
    "apple", "school", "friend", "family", "music", "game", "food", "flower", "bird", "fish"
  ];
  
  private readonly verbs = [
    "run", "jump", "sing", "dance", "read", "write", "play", "sleep", "eat", "drink",
    "walk", "talk", "laugh", "cry", "help", "work", "study", "cook", "drive", "swim"
  ];
  
  private readonly adjectives = [
    "big", "small", "happy", "sad", "fast", "slow", "hot", "cold", "new", "old",
    "good", "bad", "tall", "short", "red", "blue", "green", "yellow", "bright", "dark"
  ];
  
  private readonly otherWords = [
    "the", "and", "but", "or", "in", "on", "at", "by", "for", "with",
    "123", "456", "789", "abc", "xyz", "hello", "world", "test", "here", "there"
  ];
  
  getName(): string {
    return "Word Games";
  }
  
  generateChallenge(level: number): Challenge {
    const allChallenges = {
      nouns: [
        {
          description: "Munch NOUNS",
          checkAnswer: (value: string) => {
            return this.nouns.includes(value.toLowerCase());
          }
        }
      ],
      verbs: [
        {
          description: "Munch VERBS",
          checkAnswer: (value: string) => {
            return this.verbs.includes(value.toLowerCase());
          }
        }
      ],
      adjectives: [
        {
          description: "Munch ADJECTIVES",
          checkAnswer: (value: string) => {
            return this.adjectives.includes(value.toLowerCase());
          }
        }
      ],
      word_length: [
        {
          description: "Munch words with 4+ letters",
          checkAnswer: (value: string) => {
            return /^[a-zA-Z]+$/.test(value) && value.length >= 4;
          }
        },
        {
          description: "Munch short words (3 letters)",
          checkAnswer: (value: string) => {
            return /^[a-zA-Z]+$/.test(value) && value.length === 3;
          }
        },
        {
          description: "Munch long words (5+ letters)",
          checkAnswer: (value: string) => {
            return /^[a-zA-Z]+$/.test(value) && value.length >= 5;
          }
        }
      ],
      vowel_patterns: [
        {
          description: "Munch words starting with vowels",
          checkAnswer: (value: string) => {
            const vowels = ['a', 'e', 'i', 'o', 'u'];
            return /^[a-zA-Z]+$/.test(value) && vowels.includes(value.toLowerCase()[0]);
          }
        },
        {
          description: "Munch words ending with vowels",
          checkAnswer: (value: string) => {
            const vowels = ['a', 'e', 'i', 'o', 'u'];
            const lastChar = value.toLowerCase().slice(-1);
            return /^[a-zA-Z]+$/.test(value) && vowels.includes(lastChar);
          }
        }
      ],
      word_endings: [
        {
          description: "Munch words ending in 'ed'",
          checkAnswer: (value: string) => {
            return /^[a-zA-Z]+$/.test(value) && value.toLowerCase().endsWith('ed');
          }
        },
        {
          description: "Munch words ending in 'ing'",
          checkAnswer: (value: string) => {
            return /^[a-zA-Z]+$/.test(value) && value.toLowerCase().endsWith('ing');
          }
        },
        {
          description: "Munch words ending in 'ly'",
          checkAnswer: (value: string) => {
            return /^[a-zA-Z]+$/.test(value) && value.toLowerCase().endsWith('ly');
          }
        }
      ]
    };
    
    let challenges: Challenge[];
    if (this.selectedCategory === 'random') {
      challenges = Object.values(allChallenges).flat();
    } else {
      challenges = allChallenges[this.selectedCategory as keyof typeof allChallenges] || allChallenges.nouns;
    }
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  }
  
  generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
    const grid = this.createEmptyGrid(width, height);
    const totalCells = width * height;
    const cellsToFill = totalCells; // Fill 100% of cells
    
    // Generate words to place in grid
    const words: string[] = [];
    const targetCorrectCount = Math.floor(cellsToFill * 0.3);
    
    // Add correct words first
    const correctWords = this.getCorrectWords(challenge, targetCorrectCount);
    words.push(...correctWords);
    
    // Fill remaining with incorrect words
    while (words.length < cellsToFill) {
      const allWords = [...this.nouns, ...this.verbs, ...this.adjectives, ...this.otherWords];
      const word = allWords[Math.floor(Math.random() * allWords.length)];
      
      if (!challenge.checkAnswer(word)) {
        words.push(word);
      }
    }
    
    // Shuffle and place words
    const shuffledWords = this.shuffleArray(words);
    const positions = this.getRandomPositions(width, height, cellsToFill);
    
    for (let i = 0; i < shuffledWords.length && i < positions.length; i++) {
      const { x, y } = positions[i];
      const value = shuffledWords[i];
      
      grid[y][x] = {
        value,
        isCorrect: challenge.checkAnswer(value),
        isMunched: false,
        isEmpty: false
      };
    }
    
    return grid;
  }
  
  private getCorrectWords(challenge: Challenge, count: number): string[] {
    const correctWords: string[] = [];
    const allWords = [...this.nouns, ...this.verbs, ...this.adjectives];
    
    // Add some past tense verbs for 'ed' challenge
    if (challenge.description.includes("'ed'")) {
      const pastTenseVerbs = ["walked", "played", "jumped", "cooked", "helped", "worked", "danced", "laughed"];
      correctWords.push(...pastTenseVerbs.slice(0, Math.min(count, pastTenseVerbs.length)));
    }
    
    // Find words that match the challenge
    for (const word of allWords) {
      if (challenge.checkAnswer(word) && correctWords.length < count) {
        correctWords.push(word);
      }
    }
    
    return correctWords.slice(0, count);
  }
  
  private getRandomPositions(width: number, height: number, count: number): Array<{x: number, y: number}> {
    const positions: Array<{x: number, y: number}> = [];
    const allPositions: Array<{x: number, y: number}> = [];
    
    // Generate all possible positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        allPositions.push({ x, y });
      }
    }
    
    // Shuffle and take the first 'count' positions
    const shuffled = this.shuffleArray(allPositions);
    return shuffled.slice(0, count);
  }
}
