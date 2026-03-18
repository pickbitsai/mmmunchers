import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class DinosaurTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'carnivores', name: 'Carnivores' },
      { id: 'herbivores', name: 'Herbivores' },
      { id: 'flying', name: 'Flying & Marine' },
      { id: 'periods', name: 'Time Periods' },
      { id: 'features', name: 'Dino Features' }
    ];
  }

  private readonly carnivores = [
    'T-Rex', 'Velociraptor', 'Allosaurus', 'Spinosaurus', 'Carnotaurus',
    'Giganotosaurus', 'Deinonychus', 'Baryonyx', 'Utahraptor', 'Ceratosaurus',
    'Compsognathus', 'Dilophosaurus', 'Megalosaurus', 'Oviraptor', 'Therizinosaurus',
    'Acrocanthosaurus', 'Carcharodontosaurus'
  ];

  private readonly herbivores = [
    'Triceratops', 'Stegosaurus', 'Brachiosaurus', 'Diplodocus', 'Ankylosaurus',
    'Parasaurolophus', 'Iguanodon', 'Pachycephalosaurus', 'Styracosaurus',
    'Edmontosaurus', 'Maiasaura', 'Gallimimus', 'Amargasaurus', 'Apatosaurus',
    'Kentrosaurus', 'Protoceratops', 'Hadrosaurus'
  ];

  private readonly flying = [
    'Pterodactyl', 'Pteranodon', 'Quetzalcoatlus', 'Dimorphodon', 'Rhamphorhynchus',
    'Mosasaurus', 'Plesiosaur', 'Ichthyosaur', 'Elasmosaurus', 'Liopleurodon',
    'Archaeopteryx', 'Microraptor'
  ];

  private readonly periods = [
    'Triassic', 'Jurassic', 'Cretaceous', 'Mesozoic', 'Paleozoic',
    'Permian', 'Cambrian', 'Carboniferous', 'Devonian', 'Ordovician',
    'Cenozoic', 'Extinction Event'
  ];

  private readonly features = [
    'Fossil', 'Skeleton', 'Bone', 'Claw', 'Tooth', 'Horn',
    'Tail Club', 'Frill', 'Plates', 'Feathers', 'Scales', 'Egg',
    'Nest', 'Footprint', 'Amber', 'Coprolite', 'Pangaea', 'Meteor'
  ];

  private readonly allItems = [
    ...this.carnivores, ...this.herbivores, ...this.flying,
    ...this.periods, ...this.features
  ];

  getName(): string {
    return "Dinosaurs";
  }

  generateChallenge(level: number): Challenge {
    const allChallenges: Record<string, Challenge[]> = {
      carnivores: [
        {
          description: "Munch CARNIVORE dinosaurs",
          checkAnswer: (value: string) => this.carnivores.includes(value)
        },
        {
          description: "Munch RAPTOR dinosaurs",
          checkAnswer: (value: string) => {
            const raptors = ['Velociraptor', 'Deinonychus', 'Utahraptor', 'Oviraptor', 'Microraptor'];
            return raptors.includes(value);
          }
        }
      ],
      herbivores: [
        {
          description: "Munch HERBIVORE dinosaurs",
          checkAnswer: (value: string) => this.herbivores.includes(value)
        },
        {
          description: "Munch ARMORED dinosaurs",
          checkAnswer: (value: string) => {
            const armored = ['Triceratops', 'Stegosaurus', 'Ankylosaurus', 'Styracosaurus', 'Kentrosaurus', 'Pachycephalosaurus'];
            return armored.includes(value);
          }
        },
        {
          description: "Munch LONG-NECK dinosaurs",
          checkAnswer: (value: string) => {
            const longNeck = ['Brachiosaurus', 'Diplodocus', 'Apatosaurus', 'Amargasaurus'];
            return longNeck.includes(value);
          }
        }
      ],
      flying: [
        {
          description: "Munch FLYING & MARINE reptiles",
          checkAnswer: (value: string) => this.flying.includes(value)
        },
        {
          description: "Munch SEA REPTILES",
          checkAnswer: (value: string) => {
            const sea = ['Mosasaurus', 'Plesiosaur', 'Ichthyosaur', 'Elasmosaurus', 'Liopleurodon'];
            return sea.includes(value);
          }
        }
      ],
      periods: [
        {
          description: "Munch GEOLOGICAL TIME PERIODS",
          checkAnswer: (value: string) => this.periods.includes(value)
        },
        {
          description: "Munch DINOSAUR ERAS",
          checkAnswer: (value: string) => {
            const dinoEras = ['Triassic', 'Jurassic', 'Cretaceous', 'Mesozoic'];
            return dinoEras.includes(value);
          }
        }
      ],
      features: [
        {
          description: "Munch DINOSAUR FEATURES",
          checkAnswer: (value: string) => this.features.includes(value)
        },
        {
          description: "Munch FOSSIL-related items",
          checkAnswer: (value: string) => {
            const fossil = ['Fossil', 'Skeleton', 'Bone', 'Footprint', 'Amber', 'Coprolite', 'Egg'];
            return fossil.includes(value);
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
