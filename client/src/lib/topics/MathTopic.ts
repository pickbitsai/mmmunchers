import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class MathTopic extends TopicProvider {
  private selectedCategory: string = 'random';
  
  getName(): string {
    return "Mathematics";
  }
  
  setCategory(category: string): void {
    this.selectedCategory = category;
  }
  
  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'multiples', name: 'Multiples' },
      { id: 'factors', name: 'Factors' },
      { id: 'primes', name: 'Prime Numbers' },
      { id: 'squares', name: 'Perfect Squares' },
      { id: 'even_odd', name: 'Even/Odd' },
      { id: 'greater_less', name: 'Greater/Less Than' }
    ];
  }
  
  generateChallenge(level: number): Challenge {
    const allChallenges = {
      multiples: [
        {
          description: "Munch multiples of 3",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num % 3 === 0 && num > 0;
          }
        },
        {
          description: "Munch multiples of 5",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num % 5 === 0 && num > 0;
          }
        },
        {
          description: "Munch multiples of 7",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num % 7 === 0 && num > 0;
          }
        }
      ],
      factors: [
        {
          description: "Munch factors of 24",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num > 0 && 24 % num === 0;
          }
        },
        {
          description: "Munch factors of 36",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num > 0 && 36 % num === 0;
          }
        }
      ],
      even_odd: [
        {
          description: "Munch even numbers",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num % 2 === 0 && num > 0;
          }
        },
        {
          description: "Munch odd numbers",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num % 2 === 1 && num > 0;
          }
        }
      ],
      greater_less: [
        {
          description: "Munch numbers > 50",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num > 50;
          }
        },
        {
          description: "Munch numbers < 25",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            return !isNaN(num) && num < 25 && num > 0;
          }
        }
      ],
      primes: [
        {
          description: "Munch prime numbers",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 2) return false;
            for (let i = 2; i <= Math.sqrt(num); i++) {
              if (num % i === 0) return false;
            }
            return true;
          }
        }
      ],
      squares: [
        {
          description: "Munch perfect squares",
          checkAnswer: (value: string) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 1) return false;
            const sqrt = Math.sqrt(num);
            return sqrt === Math.floor(sqrt);
          }
        }
      ]
    };
    
    let challenges: Challenge[];
    if (this.selectedCategory === 'random') {
      challenges = Object.values(allChallenges).flat();
    } else {
      challenges = allChallenges[this.selectedCategory as keyof typeof allChallenges] || allChallenges.multiples;
    }
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  }
  
  generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
    const grid = this.createEmptyGrid(width, height);
    const totalCells = width * height;
    const cellsToFill = totalCells; // Fill 100% of cells
    
    // Generate numbers to place in grid
    const numbers: number[] = [];
    let correctCount = 0;
    const targetCorrectCount = Math.floor(cellsToFill * 0.3); // 30% should be correct
    
    // Generate correct answers first
    for (let i = 0; i < targetCorrectCount; i++) {
      let num = this.generateCorrectNumber(challenge);
      if (num !== null) {
        numbers.push(num);
        correctCount++;
      }
    }
    
    // Fill remaining with incorrect numbers
    let attempts = 0;
    while (numbers.length < cellsToFill && attempts < 1000) {
      const num = this.getRandomInt(1, 100);
      if (!challenge.checkAnswer(num.toString()) && !numbers.includes(num)) {
        numbers.push(num);
      }
      attempts++;
    }
    
    // If still not enough numbers, add some that may duplicate but ensure grid is full
    while (numbers.length < cellsToFill) {
      const num = this.getRandomInt(101, 200); // Use numbers outside normal range
      numbers.push(num);
    }
    
    // Shuffle and place numbers
    const shuffledNumbers = this.shuffleArray(numbers);
    const positions = this.getRandomPositions(width, height, cellsToFill);
    
    for (let i = 0; i < shuffledNumbers.length && i < positions.length; i++) {
      const { x, y } = positions[i];
      const value = shuffledNumbers[i].toString();
      
      grid[y][x] = {
        value,
        isCorrect: challenge.checkAnswer(value),
        isMunched: false,
        isEmpty: false
      };
    }
    
    return grid;
  }
  
  private generateCorrectNumber(challenge: Challenge): number | null {
    // Try to generate a correct number based on the challenge type
    for (let attempts = 0; attempts < 50; attempts++) {
      let num: number;
      
      // Generate numbers based on common patterns
      if (challenge.description.includes("multiples of 3")) {
        num = (this.getRandomInt(1, 33)) * 3;
      } else if (challenge.description.includes("multiples of 7")) {
        num = (this.getRandomInt(1, 14)) * 7;
      } else if (challenge.description.includes("even")) {
        num = this.getRandomInt(1, 50) * 2;
      } else if (challenge.description.includes("> 50")) {
        num = this.getRandomInt(51, 100);
      } else if (challenge.description.includes("prime")) {
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
        num = primes[Math.floor(Math.random() * primes.length)];
      } else if (challenge.description.includes("perfect squares")) {
        const root = this.getRandomInt(1, 10);
        num = root * root;
      } else {
        num = this.getRandomInt(1, 100);
      }
      
      if (challenge.checkAnswer(num.toString())) {
        return num;
      }
    }
    
    return null;
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
