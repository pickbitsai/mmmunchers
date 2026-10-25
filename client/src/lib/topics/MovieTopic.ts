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
      { id: 'roles', name: 'Film Crew Roles' },
      { id: 'techniques', name: 'Film Techniques' },
      { id: 'genres', name: 'Movie Genres' },
      { id: 'decades', name: 'Movie Decades' },
      { id: 'formats', name: 'Film Formats' },
      { id: 'awards', name: 'Award Winners' }
    ];
  }

  private readonly roles = [
    'Director', 'Producer', 'Screenwriter', 'Cinematographer',
    'Editor', 'Production Designer', 'Costume Designer', 'Foley Artist',
    'Gaffer', 'Best Boy', 'Script Supervisor', 'Composer',
    'Sound Designer', 'Casting Director', 'Location Scout', 'Storyboard Artist'
  ];

  private readonly techniques = [
    'Close-Up', 'Dolly Zoom', 'Jump Cut', 'Match Cut',
    'Tracking Shot', 'Rack Focus', 'Montage', 'Cross-Cut',
    'Long Take', 'Point-of-View Shot', 'Dutch Angle', 'Fade Out',
    'Slow Motion', 'Time-Lapse', 'Overhead Shot', 'Handheld Shot'
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

  private readonly formats = [
    'Feature', 'Short', 'Documentary', 'Anthology',
    'Miniseries', 'Animation', 'Silent Film', 'Experimental Film',
    'Newsreel', 'Serial', 'Mockumentary', 'Docudrama',
    'Stop Motion', 'Live Action', 'Episodic Film', 'Educational Film'
  ];

  private readonly awards = [
    'Oscar Winner', 'Golden Globe Winner', 'Cannes Winner', 'BAFTA Winner',
    'Critics Choice', 'Screen Actors Guild', 'Directors Guild', 'Sundance Winner'
  ];

  private readonly allMovieItems = [
    ...this.roles,
    ...this.techniques,
    ...this.genres,
    ...this.decades,
    ...this.formats,
    ...this.awards
  ];

  getName(): string {
    return 'Movie Trivia';
  }

  generateChallenge(level: number): Challenge {
    const challenges = [
      {
        description: 'Find all the FILM CREW ROLES',
        checkAnswer: (value: string) => this.roles.includes(value)
      },
      {
        description: 'Find all the FILM TECHNIQUES',
        checkAnswer: (value: string) => this.techniques.includes(value)
      },
      {
        description: 'Find all the MOVIE GENRES',
        checkAnswer: (value: string) => this.genres.includes(value)
      },
      {
        description: 'Find all the FILM FORMATS',
        checkAnswer: (value: string) => this.formats.includes(value)
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
    if (this.selectedCategory === 'roles') {
      return {
        description: 'Find all the FILM CREW ROLES',
        checkAnswer: (value: string) => this.roles.includes(value)
      };
    } else if (this.selectedCategory === 'techniques') {
      return {
        description: 'Find all the FILM TECHNIQUES',
        checkAnswer: (value: string) => this.techniques.includes(value)
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
    } else if (this.selectedCategory === 'formats') {
      return {
        description: 'Find all the FILM FORMATS',
        checkAnswer: (value: string) => this.formats.includes(value)
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
    if (challenge.description.includes('CREW ROLES')) {
      correctPool = this.roles;
    } else if (challenge.description.includes('TECHNIQUES')) {
      correctPool = this.techniques;
    } else if (challenge.description.includes('GENRES')) {
      correctPool = this.genres;
    } else if (challenge.description.includes('TIME PERIODS')) {
      correctPool = this.decades;
    } else if (challenge.description.includes('FORMATS')) {
      correctPool = this.formats;
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
