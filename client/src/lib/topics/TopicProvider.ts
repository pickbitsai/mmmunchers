import { Challenge } from "../stores/useGameState";

export interface GridCell {
  value: string;
  isCorrect: boolean;
  isMunched: boolean;
  isEmpty: boolean;
}

export abstract class TopicProvider {
  abstract getName(): string;
  abstract generateChallenge(level: number): Challenge | Promise<Challenge>;
  abstract generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] | Promise<GridCell[][]>;
  
  // Optional category methods
  setCategory?(category: string): void;
  getCategories?(): Array<{id: string, name: string}>;
  
  protected createEmptyGrid(width: number, height: number): GridCell[][] {
    return Array(height).fill(null).map(() =>
      Array(width).fill(null).map(() => ({
        value: "",
        isCorrect: false,
        isMunched: false,
        isEmpty: true
      }))
    );
  }
  
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  protected getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
