import { TopicProvider, GridCell } from './TopicProvider';
import { Challenge } from '../stores/useGameState';

export class MovieTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'actors', name: 'Famous Actors' },
      { id: 'directors', name: 'Directors' },
      { id: 'genres', name: 'Movie Genres' },
      { id: 'decades', name: 'Movie Decades' },
      { id: 'franchises', name: 'Movie Franchises' },
      { id: 'awards', name: 'Award Winners' }
    ];
  }

  private readonly actors = [
    'Tom Hanks', 'Meryl Streep', 'Leonardo DiCaprio', 'Jennifer Lawrence',
    'Brad Pitt', 'Angelina Jolie', 'Will Smith', 'Sandra Bullock',
    'Robert Downey Jr', 'Scarlett Johansson', 'Chris Evans', 'Emma Stone',
    'Ryan Gosling', 'Natalie Portman', 'Matt Damon', 'Julia Roberts',
    'Morgan Freeman', 'Denzel Washington', 'Hugh Jackman', 'Anne Hathaway',
    'Christian Bale', 'Amy Adams', 'Ryan Reynolds', 'Emma Watson',
    'Tom Cruise', 'Nicole Kidman', 'Johnny Depp', 'Charlize Theron'
  ];

  private readonly directors = [
    'Steven Spielberg', 'Martin Scorsese', 'Christopher Nolan', 'Quentin Tarantino',
    'Alfred Hitchcock', 'Stanley Kubrick', 'James Cameron', 'Ridley Scott',
    'Tim Burton', 'David Fincher', 'Coen Brothers', 'Peter Jackson',
    'Guillermo del Toro', 'Denis Villeneuve', 'Jordan Peele', 'Greta Gerwig',
    'Rian Johnson', 'Edgar Wright', 'Wes Anderson', 'Spike Lee'
  ];

  private readonly genres = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi',
    'Fantasy', 'Thriller', 'Mystery', 'Adventure', 'Animation',
    'Documentary', 'Musical', 'Western', 'Crime', 'Biography'
  ];

  private readonly decades = [
    '1970s Movies', '1980s Movies', '1990s Movies', '2000s Movies',
    '2010s Movies', '2020s Movies', 'Classic Films', 'Modern Cinema'
  ];

  private readonly franchises = [
    'Marvel Cinematic Universe', 'Star Wars', 'Harry Potter', 'Fast & Furious',
    'Mission Impossible', 'James Bond', 'Jurassic Park', 'Terminator',
    'Star Trek', 'Lord of the Rings', 'Pirates of Caribbean', 'X-Men',
    'Transformers', 'Indiana Jones', 'Batman Movies', 'Spider-Man'
  ];

  private readonly awards = [
    'Oscar Winner', 'Golden Globe Winner', 'Cannes Winner', 'BAFTA Winner',
    'Critics Choice', 'Screen Actors Guild', 'Directors Guild', 'Sundance Winner'
  ];

  private readonly allMovieItems = [
    ...this.actors,
    ...this.directors,
    ...this.genres,
    ...this.decades,
    ...this.franchises,
    ...this.awards
  ];

  getName(): string {
    return 'Movie Trivia';
  }

  generateChallenge(level: number): Challenge {
    const challenges = [
      // Actor challenges
      {
        description: 'Find all the FAMOUS ACTORS',
        checkAnswer: (value: string) => this.actors.includes(value)
      },
      {
        description: 'Find all the MOVIE DIRECTORS',
        checkAnswer: (value: string) => this.directors.includes(value)
      },
      {
        description: 'Find all the MOVIE GENRES',
        checkAnswer: (value: string) => this.genres.includes(value)
      },
      {
        description: 'Find all the MOVIE FRANCHISES',
        checkAnswer: (value: string) => this.franchises.includes(value)
      },
      {
        description: 'Find all the AWARD CATEGORIES',
        checkAnswer: (value: string) => this.awards.includes(value)
      },
      {
        description: 'Find all the MOVIE TIME PERIODS',
        checkAnswer: (value: string) => this.decades.includes(value)
      }
    ];

    // Category-specific challenges
    if (this.selectedCategory === 'actors') {
      return {
        description: 'Find all the FAMOUS ACTORS',
        checkAnswer: (value: string) => this.actors.includes(value)
      };
    } else if (this.selectedCategory === 'directors') {
      return {
        description: 'Find all the MOVIE DIRECTORS',
        checkAnswer: (value: string) => this.directors.includes(value)
      };
    } else if (this.selectedCategory === 'genres') {
      return {
        description: 'Find all the MOVIE GENRES',
        checkAnswer: (value: string) => this.genres.includes(value)
      };
    } else if (this.selectedCategory === 'decades') {
      return {
        description: 'Find all the MOVIE TIME PERIODS',
        checkAnswer: (value: string) => this.decades.includes(value)
      };
    } else if (this.selectedCategory === 'franchises') {
      return {
        description: 'Find all the MOVIE FRANCHISES',
        checkAnswer: (value: string) => this.franchises.includes(value)
      };
    } else if (this.selectedCategory === 'awards') {
      return {
        description: 'Find all the AWARD CATEGORIES',
        checkAnswer: (value: string) => this.awards.includes(value)
      };
    }

    // Random mix
    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
    const grid: GridCell[][] = [];
    
    // Initialize empty grid
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = {
          value: '',
          isCorrect: false,
          isMunched: false,
          isEmpty: true
        };
      }
    }

    // Get correct items for this challenge
    const correctItems = this.getCorrectMovieItems(challenge, 8);
    
    // Get random incorrect items
    const incorrectItems = this.allMovieItems
      .filter(item => !correctItems.includes(item))
      .sort(() => Math.random() - 0.5)
      .slice(0, (width * height) - correctItems.length);

    // Combine and shuffle
    const allItems = [...correctItems, ...incorrectItems].sort(() => Math.random() - 0.5);

    // Fill grid
    let itemIndex = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (itemIndex < allItems.length) {
          const item = allItems[itemIndex];
          grid[y][x] = {
            value: item,
            isCorrect: challenge.checkAnswer(item),
            isMunched: false,
            isEmpty: false
          };
          itemIndex++;
        }
      }
    }

    return grid;
  }

  private getCorrectMovieItems(challenge: Challenge, count: number): string[] {
    let correctPool: string[] = [];
    
    // Determine which pool to use based on challenge
    if (challenge.description.includes('ACTORS')) {
      correctPool = this.actors;
    } else if (challenge.description.includes('DIRECTORS')) {
      correctPool = this.directors;
    } else if (challenge.description.includes('GENRES')) {
      correctPool = this.genres;
    } else if (challenge.description.includes('TIME PERIODS')) {
      correctPool = this.decades;
    } else if (challenge.description.includes('FRANCHISES')) {
      correctPool = this.franchises;
    } else if (challenge.description.includes('AWARD')) {
      correctPool = this.awards;
    } else {
      correctPool = this.allMovieItems.filter(item => challenge.checkAnswer(item));
    }
    
    return correctPool
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(count, correctPool.length));
  }
}