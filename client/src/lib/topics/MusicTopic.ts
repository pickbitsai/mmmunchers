import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class MusicTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'instruments', name: 'Instruments' },
      { id: 'genres', name: 'Genres' },
      { id: 'theory', name: 'Music Theory' },
      { id: 'artists', name: 'Famous Musicians' },
      { id: 'jazz', name: 'Jazz' }
    ];
  }

  private readonly instruments = [
    'Guitar', 'Piano', 'Drums', 'Bass', 'Violin', 'Cello',
    'Flute', 'Trumpet', 'Saxophone', 'Trombone', 'Clarinet', 'Oboe',
    'Harp', 'Banjo', 'Ukulele', 'Harmonica', 'Accordion', 'Organ',
    'Xylophone', 'Tambourine', 'Mandolin', 'Tuba', 'French Horn', 'Bagpipes'
  ];

  private readonly genres = [
    'Rock', 'Pop', 'Jazz', 'Blues', 'Classical', 'Country',
    'Hip Hop', 'R&B', 'Reggae', 'Punk', 'Metal', 'Folk',
    'Electronic', 'Soul', 'Funk', 'Gospel', 'Latin', 'Indie',
    'Alternative', 'Grunge', 'Techno', 'House', 'Disco', 'Ska'
  ];

  private readonly theory = [
    'Melody', 'Harmony', 'Rhythm', 'Tempo', 'Beat', 'Chord',
    'Scale', 'Note', 'Key', 'Pitch', 'Octave', 'Rest',
    'Bar', 'Time Signature', 'Treble Clef', 'Bass Clef', 'Sharp', 'Flat',
    'Major', 'Minor', 'Crescendo', 'Forte', 'Piano (soft)', 'Staccato'
  ];

  private readonly artists = [
    'Beatles', 'Elvis', 'Mozart', 'Beethoven', 'Bach', 'Hendrix',
    'Bob Marley', 'David Bowie', 'Queen', 'Prince', 'Stevie Wonder', 'Aretha Franklin',
    'Bob Dylan', 'Led Zeppelin', 'Pink Floyd', 'Rolling Stones', 'Nirvana', 'Beyonce',
    'Michael Jackson', 'Whitney Houston', 'Elton John', 'Madonna', 'Adele', 'Taylor Swift'
  ];

  private readonly jazz = [
    'Louis Armstrong', 'Duke Ellington', 'Miles Davis', 'John Coltrane',
    'Charlie Parker', 'Dizzy Gillespie', 'Billie Holiday', 'Ella Fitzgerald',
    'Count Basie', 'Thelonious Monk', 'Bebop', 'Swing', 'Cool Jazz',
    'Free Jazz', 'Fusion', 'Improvisation', 'Syncopation', 'Blue Notes',
    'Scat Singing', 'Jazz Club', 'Jam Session', 'Big Band'
  ];

  private readonly allItems = [
    ...this.instruments, ...this.genres, ...this.theory,
    ...this.artists, ...this.jazz
  ];

  getName(): string {
    return "Music";
  }

  generateChallenge(level: number): Challenge {
    const allChallenges: Record<string, Challenge[]> = {
      instruments: [
        {
          description: "Munch MUSICAL INSTRUMENTS",
          checkAnswer: (value: string) => this.instruments.includes(value)
        },
        {
          description: "Munch STRING instruments",
          checkAnswer: (value: string) => {
            const strings = ['Guitar', 'Violin', 'Cello', 'Bass', 'Harp', 'Banjo', 'Ukulele', 'Mandolin'];
            return strings.includes(value);
          }
        },
        {
          description: "Munch BRASS instruments",
          checkAnswer: (value: string) => {
            const brass = ['Trumpet', 'Trombone', 'Tuba', 'French Horn', 'Saxophone'];
            return brass.includes(value);
          }
        }
      ],
      genres: [
        {
          description: "Munch MUSIC GENRES",
          checkAnswer: (value: string) => this.genres.includes(value)
        },
        {
          description: "Munch ROCK-related genres",
          checkAnswer: (value: string) => {
            const rock = ['Rock', 'Punk', 'Metal', 'Grunge', 'Alternative', 'Indie'];
            return rock.includes(value);
          }
        },
        {
          description: "Munch ELECTRONIC genres",
          checkAnswer: (value: string) => {
            const electronic = ['Electronic', 'Techno', 'House', 'Disco'];
            return electronic.includes(value);
          }
        }
      ],
      theory: [
        {
          description: "Munch MUSIC THEORY terms",
          checkAnswer: (value: string) => this.theory.includes(value)
        },
        {
          description: "Munch MUSICAL NOTATION",
          checkAnswer: (value: string) => {
            const notation = ['Note', 'Rest', 'Bar', 'Time Signature', 'Treble Clef', 'Bass Clef', 'Sharp', 'Flat', 'Key'];
            return notation.includes(value);
          }
        }
      ],
      artists: [
        {
          description: "Munch FAMOUS MUSICIANS",
          checkAnswer: (value: string) => this.artists.includes(value)
        },
        {
          description: "Munch CLASSICAL COMPOSERS",
          checkAnswer: (value: string) => {
            const classical = ['Mozart', 'Beethoven', 'Bach'];
            return classical.includes(value);
          }
        },
        {
          description: "Munch ROCK LEGENDS",
          checkAnswer: (value: string) => {
            const rock = ['Beatles', 'Elvis', 'Hendrix', 'Led Zeppelin', 'Pink Floyd', 'Rolling Stones', 'Nirvana', 'Queen', 'David Bowie'];
            return rock.includes(value);
          }
        }
      ],
      jazz: [
        {
          description: "Munch JAZZ items",
          checkAnswer: (value: string) => this.jazz.includes(value)
        },
        {
          description: "Munch JAZZ MUSICIANS",
          checkAnswer: (value: string) => {
            const jazzMusicians = ['Louis Armstrong', 'Duke Ellington', 'Miles Davis', 'John Coltrane', 'Charlie Parker', 'Dizzy Gillespie', 'Billie Holiday', 'Ella Fitzgerald', 'Count Basie', 'Thelonious Monk'];
            return jazzMusicians.includes(value);
          }
        }
      ]
    };

    let challenges: Challenge[];
    if (this.selectedCategory === 'random') {
      challenges = Object.values(allChallenges).flat();
    } else {
      challenges = allChallenges[this.selectedCategory] || Object.values(allChallenges).flat();
    }

    return challenges[Math.floor(Math.random() * challenges.length)];
  }

  generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
    const grid = this.createEmptyGrid(width, height);
    const totalCells = width * height;
    const targetCorrect = Math.floor(totalCells * 0.3);

    const correctItems = this.allItems.filter(item => challenge.checkAnswer(item));
    const shuffledCorrect = this.shuffleArray(correctItems).slice(0, targetCorrect);

    const incorrectItems = this.allItems.filter(item => !challenge.checkAnswer(item));
    const shuffledIncorrect = this.shuffleArray(incorrectItems).slice(0, totalCells - shuffledCorrect.length);

    const allItems = this.shuffleArray([...shuffledCorrect, ...shuffledIncorrect]);

    let idx = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (idx < allItems.length) {
          grid[y][x] = {
            value: allItems[idx],
            isCorrect: challenge.checkAnswer(allItems[idx]),
            isMunched: false,
            isEmpty: false
          };
          idx++;
        }
      }
    }

    return grid;
  }
}
