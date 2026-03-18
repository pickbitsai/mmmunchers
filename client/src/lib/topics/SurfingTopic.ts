import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class SurfingTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'equipment', name: 'Equipment' },
      { id: 'techniques', name: 'Techniques' },
      { id: 'waves', name: 'Waves & Conditions' },
      { id: 'spots', name: 'Famous Surf Spots' },
      { id: 'culture', name: 'Surf Culture' }
    ];
  }

  private readonly equipment = [
    'Longboard', 'Shortboard', 'Bodyboard', 'Wetsuit', 'Rash Guard',
    'Leash', 'Fin', 'Wax', 'Board Bag', 'Nose Guard', 'Tail Pad',
    'Booties', 'Gloves', 'Hood', 'Soft Top', 'Funboard', 'Fish Board',
    'Gun Board', 'Foamie', 'Epoxy Board'
  ];

  private readonly techniques = [
    'Paddle', 'Pop Up', 'Duck Dive', 'Turtle Roll', 'Carve',
    'Cutback', 'Floater', 'Snap', 'Aerial', 'Barrel Ride',
    'Bottom Turn', 'Top Turn', 'Roundhouse', 'Layback', 'Hang Ten',
    'Cross Step', 'Nose Ride', 'Drop In', 'Kick Out', 'Wipeout'
  ];

  private readonly waves = [
    'Barrel', 'Tube', 'Break', 'Curl', 'Swell', 'Foam',
    'Whitewash', 'Set Wave', 'Closeout', 'Peeling Wave', 'Point Break',
    'Beach Break', 'Reef Break', 'Shore Break', 'Rip Current',
    'Tide', 'Offshore Wind', 'Onshore Wind', 'Glassy', 'Choppy'
  ];

  private readonly spots = [
    'Pipeline', 'Mavericks', 'Teahupoo', 'Bells Beach', 'Jeffreys Bay',
    'Nazare', 'Waimea Bay', 'Trestles', 'Rincon', 'Uluwatu',
    'Cloudbreak', 'Padang Padang', 'Snapper Rocks', 'Hossegor',
    'Mundaka', 'Tavarua', 'North Shore', 'Gold Coast', 'Mentawai', 'Banzai'
  ];

  private readonly culture = [
    'Aloha', 'Stoked', 'Gnarly', 'Shaka', 'Dawn Patrol',
    'Grom', 'Kook', 'Lineup', 'Local', 'Soul Surfer',
    'Surf Trip', 'Board Shorts', 'Hang Loose', 'Surf Check',
    'Quiver', 'Ding Repair', 'Surf Wax', 'Surf Camp'
  ];

  private readonly allItems = [
    ...this.equipment, ...this.techniques, ...this.waves,
    ...this.spots, ...this.culture
  ];

  getName(): string {
    return "Surfing";
  }

  generateChallenge(level: number): Challenge {
    const allChallenges: Record<string, Challenge[]> = {
      equipment: [
        {
          description: "Munch SURFING EQUIPMENT",
          checkAnswer: (value: string) => this.equipment.includes(value)
        },
        {
          description: "Munch TYPES OF SURFBOARDS",
          checkAnswer: (value: string) => {
            const boards = ['Longboard', 'Shortboard', 'Bodyboard', 'Soft Top', 'Funboard', 'Fish Board', 'Gun Board', 'Foamie', 'Epoxy Board'];
            return boards.includes(value);
          }
        }
      ],
      techniques: [
        {
          description: "Munch SURF TECHNIQUES",
          checkAnswer: (value: string) => this.techniques.includes(value)
        },
        {
          description: "Munch SURF TRICKS",
          checkAnswer: (value: string) => {
            const tricks = ['Carve', 'Cutback', 'Floater', 'Snap', 'Aerial', 'Barrel Ride', 'Roundhouse', 'Layback', 'Hang Ten'];
            return tricks.includes(value);
          }
        }
      ],
      waves: [
        {
          description: "Munch WAVE types & conditions",
          checkAnswer: (value: string) => this.waves.includes(value)
        },
        {
          description: "Munch TYPES OF BREAKS",
          checkAnswer: (value: string) => {
            const breaks = ['Point Break', 'Beach Break', 'Reef Break', 'Shore Break'];
            return breaks.includes(value);
          }
        }
      ],
      spots: [
        {
          description: "Munch FAMOUS SURF SPOTS",
          checkAnswer: (value: string) => this.spots.includes(value)
        }
      ],
      culture: [
        {
          description: "Munch SURF CULTURE terms",
          checkAnswer: (value: string) => this.culture.includes(value)
        },
        {
          description: "Munch SURF SLANG",
          checkAnswer: (value: string) => {
            const slang = ['Stoked', 'Gnarly', 'Shaka', 'Grom', 'Kook', 'Hang Loose', 'Dawn Patrol', 'Soul Surfer'];
            return slang.includes(value);
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
