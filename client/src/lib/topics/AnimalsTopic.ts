import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class AnimalsTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'mammals', name: 'Mammals' },
      { id: 'birds', name: 'Birds' },
      { id: 'reptiles', name: 'Reptiles & Amphibians' },
      { id: 'ocean', name: 'Ocean Life' },
      { id: 'insects', name: 'Insects & Bugs' },
      { id: 'predators', name: 'Predators' }
    ];
  }

  private readonly mammals = [
    'Lion', 'Tiger', 'Bear', 'Elephant', 'Giraffe', 'Zebra',
    'Monkey', 'Gorilla', 'Chimpanzee', 'Wolf', 'Fox', 'Deer',
    'Rabbit', 'Squirrel', 'Koala', 'Panda', 'Kangaroo', 'Bat',
    'Hippo', 'Rhino', 'Leopard', 'Cheetah', 'Jaguar', 'Otter',
    'Platypus', 'Hedgehog', 'Moose', 'Bison'
  ];

  private readonly birds = [
    'Eagle', 'Hawk', 'Falcon', 'Owl', 'Parrot', 'Penguin',
    'Flamingo', 'Swan', 'Pelican', 'Hummingbird', 'Crow', 'Raven',
    'Robin', 'Sparrow', 'Woodpecker', 'Toucan', 'Peacock', 'Ostrich',
    'Albatross', 'Kingfisher', 'Cardinal', 'Blue Jay', 'Condor', 'Stork'
  ];

  private readonly reptiles = [
    'Crocodile', 'Alligator', 'Snake', 'Lizard', 'Turtle', 'Tortoise',
    'Iguana', 'Chameleon', 'Gecko', 'Cobra', 'Python', 'Rattlesnake',
    'Komodo Dragon', 'Frog', 'Toad', 'Salamander', 'Newt', 'Axolotl'
  ];

  private readonly ocean = [
    'Dolphin', 'Whale', 'Shark', 'Octopus', 'Jellyfish', 'Seahorse',
    'Starfish', 'Stingray', 'Clownfish', 'Sea Turtle', 'Lobster', 'Crab',
    'Seal', 'Walrus', 'Orca', 'Narwhal', 'Manatee', 'Coral',
    'Swordfish', 'Manta Ray', 'Pufferfish', 'Anglerfish'
  ];

  private readonly insects = [
    'Butterfly', 'Bee', 'Ant', 'Spider', 'Beetle', 'Dragonfly',
    'Ladybug', 'Grasshopper', 'Cricket', 'Firefly', 'Moth', 'Wasp',
    'Caterpillar', 'Scorpion', 'Centipede', 'Mantis', 'Cockroach', 'Termite'
  ];

  private readonly predators = [
    'Lion', 'Tiger', 'Wolf', 'Eagle', 'Shark', 'Crocodile',
    'Cobra', 'Falcon', 'Hawk', 'Leopard', 'Cheetah', 'Jaguar',
    'Orca', 'Komodo Dragon', 'Python', 'Bear', 'Wolverine', 'Hyena'
  ];

  private readonly allItems = [
    ...this.mammals, ...this.birds, ...this.reptiles,
    ...this.ocean, ...this.insects
  ];

  getName(): string {
    return "Animals";
  }

  generateChallenge(level: number): Challenge {
    const allChallenges: Record<string, Challenge[]> = {
      mammals: [
        {
          description: "Munch MAMMALS",
          checkAnswer: (value: string) => this.mammals.includes(value)
        },
        {
          description: "Munch BIG CATS",
          checkAnswer: (value: string) => {
            const cats = ['Lion', 'Tiger', 'Leopard', 'Cheetah', 'Jaguar'];
            return cats.includes(value);
          }
        },
        {
          description: "Munch PRIMATES",
          checkAnswer: (value: string) => {
            const primates = ['Monkey', 'Gorilla', 'Chimpanzee'];
            return primates.includes(value);
          }
        }
      ],
      birds: [
        {
          description: "Munch BIRDS",
          checkAnswer: (value: string) => this.birds.includes(value)
        },
        {
          description: "Munch BIRDS OF PREY",
          checkAnswer: (value: string) => {
            const prey = ['Eagle', 'Hawk', 'Falcon', 'Owl', 'Condor'];
            return prey.includes(value);
          }
        }
      ],
      reptiles: [
        {
          description: "Munch REPTILES & AMPHIBIANS",
          checkAnswer: (value: string) => this.reptiles.includes(value)
        },
        {
          description: "Munch SNAKES",
          checkAnswer: (value: string) => {
            const snakes = ['Snake', 'Cobra', 'Python', 'Rattlesnake'];
            return snakes.includes(value);
          }
        }
      ],
      ocean: [
        {
          description: "Munch OCEAN CREATURES",
          checkAnswer: (value: string) => this.ocean.includes(value)
        },
        {
          description: "Munch MARINE MAMMALS",
          checkAnswer: (value: string) => {
            const marineMammals = ['Dolphin', 'Whale', 'Seal', 'Walrus', 'Orca', 'Narwhal', 'Manatee'];
            return marineMammals.includes(value);
          }
        }
      ],
      insects: [
        {
          description: "Munch INSECTS & BUGS",
          checkAnswer: (value: string) => this.insects.includes(value)
        }
      ],
      predators: [
        {
          description: "Munch PREDATORS",
          checkAnswer: (value: string) => this.predators.includes(value)
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
