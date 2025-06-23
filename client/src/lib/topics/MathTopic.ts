import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class MathTopic extends TopicProvider {
  getName(): string {
    return "Mathematics";
  }
  
  generateChallenge(level: number): Challenge {
    const challenges = [
      // Basic arithmetic
      {
        description: "Munch multiples of 3",
        checkAnswer: (value: string) => {
          const num = parseInt(value);
          return !isNaN(num) && num % 3 === 0 && num > 0;
        }
      },
      {
        description: "Munch even numbers",
        checkAnswer: (value: string) => {
          const num = parseInt(value);
          return !isNaN(num) && num % 2 === 0 && num > 0;
        }
      },
      {
        description: "Munch numbers > 50",
        checkAnswer: (value: string) => {
          const num = parseInt(value);
          return !isNaN(num) && num > 50;
        }
      },
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
      },
      {
        description: "Munch perfect squares",
        checkAnswer: (value: string) => {
          const num = parseInt(value);
          if (isNaN(num) || num < 1) return false;
          const sqrt = Math.sqrt(num);
          return sqrt === Math.floor(sqrt);
        }
      },
      {
        description: "Munch multiples of 7",
        checkAnswer: (value: string) => {
          const num = parseInt(value);
          return !isNaN(num) && num % 7 === 0 && num > 0;
        }
      }
    ];
    
    // Higher levels get more complex challenges
    const maxChallengeIndex = Math.min(level - 1, challenges.length - 1);
    const challengeIndex = Math.floor(Math.random() * (maxChallengeIndex + 1));
    
    return challenges[challengeIndex];
  }
  
  generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
    const grid = this.createEmptyGrid(width, height);
    const totalCells = width * height;
    const cellsToFill = Math.floor(totalCells * 0.7); // Fill 70% of cells
    
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
    while (numbers.length < cellsToFill) {
      const num = this.getRandomInt(1, 100);
      if (!challenge.checkAnswer(num.toString())) {
        numbers.push(num);
      }
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
    
    // Generate all possible positions (avoid center where player starts)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!(x === Math.floor(width/2) && y === Math.floor(height/2))) {
          allPositions.push({ x, y });
        }
      }
    }
    
    // Shuffle and take the first 'count' positions
    const shuffled = this.shuffleArray(allPositions);
    return shuffled.slice(0, count);
  }
}
