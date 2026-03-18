import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class GeographyTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'countries', name: 'Countries' },
      { id: 'capitals', name: 'Capital Cities' },
      { id: 'continents', name: 'Continents & Oceans' },
      { id: 'landmarks', name: 'Famous Landmarks' },
      { id: 'rivers', name: 'Rivers & Mountains' }
    ];
  }

  private readonly countries = [
    'USA', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'UK',
    'France', 'Germany', 'Italy', 'Spain', 'Japan', 'China',
    'India', 'Australia', 'Egypt', 'Nigeria', 'South Africa',
    'Russia', 'South Korea', 'Thailand', 'Greece', 'Turkey',
    'Sweden', 'Norway', 'Iceland', 'New Zealand', 'Peru', 'Chile'
  ];

  private readonly capitals = [
    'Washington DC', 'London', 'Paris', 'Berlin', 'Tokyo',
    'Beijing', 'Moscow', 'Canberra', 'Ottawa', 'Rome',
    'Madrid', 'New Delhi', 'Cairo', 'Buenos Aires', 'Brasilia',
    'Seoul', 'Bangkok', 'Athens', 'Ankara', 'Stockholm',
    'Oslo', 'Reykjavik', 'Wellington', 'Lima', 'Santiago'
  ];

  private readonly continents = [
    'Africa', 'Antarctica', 'Asia', 'Europe', 'North America',
    'South America', 'Oceania', 'Pacific Ocean', 'Atlantic Ocean',
    'Indian Ocean', 'Arctic Ocean', 'Southern Ocean',
    'Mediterranean Sea', 'Caribbean Sea', 'Red Sea', 'Black Sea'
  ];

  private readonly landmarks = [
    'Eiffel Tower', 'Great Wall', 'Pyramids of Giza', 'Taj Mahal',
    'Colosseum', 'Machu Picchu', 'Statue of Liberty', 'Big Ben',
    'Stonehenge', 'Petra', 'Christ Redeemer', 'Sydney Opera',
    'Golden Gate', 'Mount Rushmore', 'Leaning Tower', 'Parthenon',
    'Angkor Wat', 'Forbidden City', 'Tower of London', 'Acropolis'
  ];

  private readonly rivers = [
    'Nile', 'Amazon', 'Mississippi', 'Yangtze', 'Danube',
    'Rhine', 'Thames', 'Seine', 'Ganges', 'Mekong',
    'Mount Everest', 'K2', 'Kilimanjaro', 'Mont Blanc', 'Denali',
    'Andes', 'Himalayas', 'Alps', 'Rockies', 'Sahara Desert',
    'Gobi Desert', 'Amazon Rainforest', 'Great Barrier Reef', 'Grand Canyon'
  ];

  private readonly allItems = [
    ...this.countries, ...this.capitals, ...this.continents,
    ...this.landmarks, ...this.rivers
  ];

  getName(): string {
    return "Geography";
  }

  generateChallenge(level: number): Challenge {
    const allChallenges: Record<string, Challenge[]> = {
      countries: [
        {
          description: "Munch COUNTRIES",
          checkAnswer: (value: string) => this.countries.includes(value)
        },
        {
          description: "Munch EUROPEAN countries",
          checkAnswer: (value: string) => {
            const european = ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Greece', 'Turkey', 'Sweden', 'Norway', 'Iceland', 'Russia'];
            return european.includes(value);
          }
        },
        {
          description: "Munch ASIAN countries",
          checkAnswer: (value: string) => {
            const asian = ['Japan', 'China', 'India', 'South Korea', 'Thailand', 'Turkey'];
            return asian.includes(value);
          }
        }
      ],
      capitals: [
        {
          description: "Munch CAPITAL CITIES",
          checkAnswer: (value: string) => this.capitals.includes(value)
        },
        {
          description: "Munch EUROPEAN capitals",
          checkAnswer: (value: string) => {
            const euroCaps = ['London', 'Paris', 'Berlin', 'Rome', 'Madrid', 'Athens', 'Ankara', 'Stockholm', 'Oslo', 'Reykjavik', 'Moscow'];
            return euroCaps.includes(value);
          }
        }
      ],
      continents: [
        {
          description: "Munch CONTINENTS",
          checkAnswer: (value: string) => {
            const cont = ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
            return cont.includes(value);
          }
        },
        {
          description: "Munch OCEANS & SEAS",
          checkAnswer: (value: string) => {
            const water = ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean', 'Mediterranean Sea', 'Caribbean Sea', 'Red Sea', 'Black Sea'];
            return water.includes(value);
          }
        }
      ],
      landmarks: [
        {
          description: "Munch FAMOUS LANDMARKS",
          checkAnswer: (value: string) => this.landmarks.includes(value)
        },
        {
          description: "Munch ANCIENT WONDERS",
          checkAnswer: (value: string) => {
            const wonders = ['Pyramids of Giza', 'Colosseum', 'Machu Picchu', 'Petra', 'Stonehenge', 'Parthenon', 'Great Wall', 'Angkor Wat', 'Acropolis'];
            return wonders.includes(value);
          }
        }
      ],
      rivers: [
        {
          description: "Munch RIVERS",
          checkAnswer: (value: string) => {
            const rivers = ['Nile', 'Amazon', 'Mississippi', 'Yangtze', 'Danube', 'Rhine', 'Thames', 'Seine', 'Ganges', 'Mekong'];
            return rivers.includes(value);
          }
        },
        {
          description: "Munch MOUNTAINS",
          checkAnswer: (value: string) => {
            const mountains = ['Mount Everest', 'K2', 'Kilimanjaro', 'Mont Blanc', 'Denali', 'Andes', 'Himalayas', 'Alps', 'Rockies'];
            return mountains.includes(value);
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
