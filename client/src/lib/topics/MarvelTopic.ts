import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class MarvelTopic extends TopicProvider {
  private selectedCategory: string = 'random';
  
  setCategory(category: string): void {
    this.selectedCategory = category;
  }
  
  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'heroes', name: 'Superheroes' },
      { id: 'villains', name: 'Villains' },
      { id: 'teams', name: 'Teams' },
      { id: 'powers', name: 'Superpowers' },
      { id: 'locations', name: 'Locations' }
    ];
  }
  
  private readonly heroes = [
    "Spider-Man", "Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", 
    "Hawkeye", "Ant-Man", "Wasp", "Doctor Strange", "Wolverine", "Storm", 
    "Cyclops", "Jean Grey", "Beast", "Rogue", "Gambit", "Nightcrawler",
    "Daredevil", "Punisher", "Luke Cage", "Jessica Jones", "Iron Fist",
    "Captain Marvel", "Ms. Marvel", "Falcon", "Winter Soldier", "War Machine",
    "Vision", "Scarlet Witch", "Quicksilver", "Black Panther", "Star-Lord",
    "Gamora", "Rocket", "Groot", "Drax", "Mantis", "Nebula"
  ];
  
  private readonly villains = [
    "Thanos", "Loki", "Green Goblin", "Doctor Doom", "Red Skull", 
    "Ultron", "Magneto", "Mystique", "Sabretooth", "Apocalypse",
    "Kingpin", "Bullseye", "Wilson Fisk", "Venom", "Carnage",
    "Doctor Octopus", "Sandman", "Electro", "Rhino", "Lizard",
    "Galactus", "Silver Surfer", "Ronan", "Ego", "Hela",
    "Vulture", "Mysterio", "Kraven", "Shocker", "Scorpion"
  ];
  
  private readonly teams = [
    "Avengers", "X-Men", "Fantastic Four", "Guardians", "Defenders",
    "S.H.I.E.L.D.", "Hydra", "Inhumans", "Eternals", "Young Avengers",
    "X-Force", "New Mutants", "Alpha Flight", "Champions", "Thunderbolts"
  ];
  
  private readonly powers = [
    "Flight", "Strength", "Speed", "Invisibility", "Telepathy",
    "Telekinesis", "Healing", "Claws", "Web-slinging", "Lightning",
    "Fire", "Ice", "Metal", "Energy", "Magic", "Time", "Reality",
    "Mind", "Soul", "Power", "Space", "Phasing", "Shapeshifting"
  ];
  
  private readonly locations = [
    "Asgard", "Wakanda", "Atlantis", "Latveria", "Genosha",
    "New York", "Xavier School", "Stark Tower", "Baxter Building",
    "Sanctum", "SHIELD Base", "Hydra Base", "Savage Land",
    "Moon", "Space", "Quantum Realm", "Dark Dimension", "Knowhere"
  ];
  
  private readonly allMarvelItems = [
    ...this.heroes,
    ...this.villains,
    ...this.teams,
    ...this.powers,
    ...this.locations
  ];
  
  getName(): string {
    return "Marvel Universe";
  }
  
  generateChallenge(level: number): Challenge {
    const allChallenges = {
      heroes: [
        {
          description: "Munch SUPERHEROES",
          checkAnswer: (value: string) => {
            return this.heroes.includes(value);
          }
        },
        {
          description: "Munch X-Men heroes",
          checkAnswer: (value: string) => {
            const xmenHeroes = ["Wolverine", "Storm", "Cyclops", "Jean Grey", "Beast", "Rogue", "Gambit", "Nightcrawler"];
            return xmenHeroes.includes(value);
          }
        },
        {
          description: "Munch Avengers heroes",
          checkAnswer: (value: string) => {
            const avengersHeroes = ["Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Captain Marvel", "Falcon"];
            return avengersHeroes.includes(value);
          }
        }
      ],
      villains: [
        {
          description: "Munch VILLAINS",
          checkAnswer: (value: string) => {
            return this.villains.includes(value);
          }
        },
        {
          description: "Munch cosmic villains",
          checkAnswer: (value: string) => {
            const cosmicVillains = ["Thanos", "Galactus", "Silver Surfer", "Ronan", "Ego", "Hela"];
            return cosmicVillains.includes(value);
          }
        },
        {
          description: "Munch Spider-Man villains",
          checkAnswer: (value: string) => {
            const spideyVillains = ["Green Goblin", "Doctor Octopus", "Venom", "Sandman", "Electro", "Rhino", "Lizard", "Vulture", "Mysterio", "Kraven"];
            return spideyVillains.includes(value);
          }
        }
      ],
      teams: [
        {
          description: "Munch TEAMS",
          checkAnswer: (value: string) => {
            return this.teams.includes(value);
          }
        },
        {
          description: "Munch hero teams",
          checkAnswer: (value: string) => {
            const heroTeams = ["Avengers", "X-Men", "Fantastic Four", "Guardians", "Defenders"];
            return heroTeams.includes(value);
          }
        }
      ],
      powers: [
        {
          description: "Munch SUPERPOWERS",
          checkAnswer: (value: string) => {
            return this.powers.includes(value);
          }
        },
        {
          description: "Munch elemental powers",
          checkAnswer: (value: string) => {
            const elementalPowers = ["Fire", "Ice", "Lightning", "Energy", "Metal"];
            return elementalPowers.includes(value);
          }
        },
        {
          description: "Munch physical powers",
          checkAnswer: (value: string) => {
            const physicalPowers = ["Flight", "Strength", "Speed", "Invisibility", "Healing", "Claws"];
            return physicalPowers.includes(value);
          }
        }
      ],
      locations: [
        {
          description: "Munch LOCATIONS",
          checkAnswer: (value: string) => {
            return this.locations.includes(value);
          }
        },
        {
          description: "Munch cosmic locations",
          checkAnswer: (value: string) => {
            const cosmicLocations = ["Asgard", "Moon", "Space", "Quantum Realm", "Dark Dimension", "Knowhere"];
            return cosmicLocations.includes(value);
          }
        },
        {
          description: "Munch Earth locations",
          checkAnswer: (value: string) => {
            const earthLocations = ["Wakanda", "Atlantis", "Latveria", "New York", "Xavier School", "Stark Tower"];
            return earthLocations.includes(value);
          }
        }
      ]
    };
    
    let challenges: Challenge[];
    if (this.selectedCategory === 'random') {
      challenges = Object.values(allChallenges).flat();
    } else {
      challenges = allChallenges[this.selectedCategory as keyof typeof allChallenges] || allChallenges.heroes;
    }
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  }
  
  generateGrid(width: number, height: number, challenge: Challenge): GridCell[][] {
    const grid = this.createEmptyGrid(width, height);
    const totalCells = width * height;
    const cellsToFill = totalCells; // Fill 100% of cells
    
    // Generate Marvel items to place in grid
    const items: string[] = [];
    const targetCorrectCount = Math.floor(cellsToFill * 0.3);
    
    // Add correct items first
    const correctItems = this.getCorrectMarvelItems(challenge, targetCorrectCount);
    items.push(...correctItems);
    
    // Fill remaining with incorrect items
    while (items.length < cellsToFill) {
      const item = this.allMarvelItems[Math.floor(Math.random() * this.allMarvelItems.length)];
      
      if (!challenge.checkAnswer(item)) {
        items.push(item);
      }
    }
    
    // Shuffle and place items
    const shuffledItems = this.shuffleArray(items);
    const positions = this.getRandomPositions(width, height, cellsToFill);
    
    for (let i = 0; i < shuffledItems.length && i < positions.length; i++) {
      const { x, y } = positions[i];
      const value = shuffledItems[i];
      
      grid[y][x] = {
        value,
        isCorrect: challenge.checkAnswer(value),
        isMunched: false,
        isEmpty: false
      };
    }
    
    return grid;
  }
  
  private getCorrectMarvelItems(challenge: Challenge, count: number): string[] {
    const correctItems: string[] = [];
    
    // Find items that match the challenge
    for (const item of this.allMarvelItems) {
      if (challenge.checkAnswer(item) && correctItems.length < count) {
        correctItems.push(item);
      }
    }
    
    return correctItems.slice(0, count);
  }
  
  private getRandomPositions(width: number, height: number, count: number): Array<{x: number, y: number}> {
    const positions: Array<{x: number, y: number}> = [];
    const availablePositions: Array<{x: number, y: number}> = [];
    
    // Create list of all positions
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        availablePositions.push({ x, y });
      }
    }
    
    // Randomly select positions
    const shuffled = this.shuffleArray(availablePositions);
    return shuffled.slice(0, count);
  }
}