import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class ScienceTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'elements', name: 'Elements' },
      { id: 'planets', name: 'Planets & Space' },
      { id: 'biology', name: 'Biology' },
      { id: 'physics', name: 'Physics' },
      { id: 'chemistry', name: 'Chemistry' },
      { id: 'scientists', name: 'Famous Scientists' }
    ];
  }

  private readonly elements = [
    'Hydrogen', 'Helium', 'Lithium', 'Carbon', 'Nitrogen', 'Oxygen',
    'Neon', 'Sodium', 'Iron', 'Gold', 'Silver', 'Copper',
    'Zinc', 'Lead', 'Tin', 'Mercury', 'Uranium', 'Plutonium',
    'Calcium', 'Potassium', 'Chlorine', 'Argon', 'Sulfur', 'Silicon'
  ];

  private readonly planets = [
    'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Moon', 'Sun', 'Asteroid',
    'Comet', 'Meteor', 'Nebula', 'Galaxy', 'Star', 'Black Hole',
    'Orbit', 'Eclipse', 'Satellite', 'Constellation'
  ];

  private readonly biology = [
    'Cell', 'DNA', 'Gene', 'Protein', 'Enzyme', 'Nucleus',
    'Mitosis', 'Meiosis', 'Photosynthesis', 'Respiration', 'Evolution', 'Species',
    'Bacteria', 'Virus', 'Fungus', 'Organ', 'Tissue', 'Membrane',
    'Chromosome', 'Mutation', 'Adaptation', 'Ecosystem', 'Biome', 'Habitat'
  ];

  private readonly physics = [
    'Gravity', 'Force', 'Mass', 'Energy', 'Momentum', 'Velocity',
    'Acceleration', 'Friction', 'Inertia', 'Electron', 'Proton', 'Neutron',
    'Atom', 'Photon', 'Wavelength', 'Frequency', 'Amplitude', 'Magnetism',
    'Voltage', 'Current', 'Resistance', 'Radiation', 'Entropy', 'Quantum'
  ];

  private readonly chemistry = [
    'Molecule', 'Compound', 'Solution', 'Acid', 'Base', 'Salt',
    'Reaction', 'Catalyst', 'Ion', 'Bond', 'Isotope', 'Oxidation',
    'Reduction', 'pH', 'Solvent', 'Solute', 'Crystal', 'Gas',
    'Liquid', 'Solid', 'Plasma', 'Mixture', 'Alloy', 'Polymer'
  ];

  private readonly scientists = [
    'Einstein', 'Newton', 'Darwin', 'Curie', 'Galileo', 'Hawking',
    'Tesla', 'Edison', 'Faraday', 'Bohr', 'Planck', 'Pasteur',
    'Mendel', 'Watson', 'Crick', 'Feynman', 'Kepler', 'Copernicus',
    'Archimedes', 'Lavoisier', 'Heisenberg', 'Rutherford', 'Hubble', 'Lovelace'
  ];

  private readonly allItems = [
    ...this.elements, ...this.planets, ...this.biology,
    ...this.physics, ...this.chemistry, ...this.scientists
  ];

  getName(): string {
    return "Science";
  }

  generateChallenge(level: number): Challenge {
    const allChallenges: Record<string, Challenge[]> = {
      elements: [
        {
          description: "Munch CHEMICAL ELEMENTS",
          checkAnswer: (value: string) => this.elements.includes(value)
        },
        {
          description: "Munch METALS",
          checkAnswer: (value: string) => {
            const metals = ['Iron', 'Gold', 'Silver', 'Copper', 'Zinc', 'Lead', 'Tin', 'Mercury', 'Sodium', 'Potassium', 'Calcium', 'Lithium'];
            return metals.includes(value);
          }
        },
        {
          description: "Munch NOBLE GASES",
          checkAnswer: (value: string) => {
            const gases = ['Helium', 'Neon', 'Argon'];
            return gases.includes(value);
          }
        }
      ],
      planets: [
        {
          description: "Munch PLANETS",
          checkAnswer: (value: string) => {
            const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
            return planets.includes(value);
          }
        },
        {
          description: "Munch SPACE OBJECTS",
          checkAnswer: (value: string) => this.planets.includes(value)
        }
      ],
      biology: [
        {
          description: "Munch BIOLOGY terms",
          checkAnswer: (value: string) => this.biology.includes(value)
        },
        {
          description: "Munch CELL BIOLOGY terms",
          checkAnswer: (value: string) => {
            const cellTerms = ['Cell', 'DNA', 'Nucleus', 'Mitosis', 'Meiosis', 'Membrane', 'Chromosome', 'Gene', 'Protein'];
            return cellTerms.includes(value);
          }
        }
      ],
      physics: [
        {
          description: "Munch PHYSICS concepts",
          checkAnswer: (value: string) => this.physics.includes(value)
        },
        {
          description: "Munch SUBATOMIC PARTICLES",
          checkAnswer: (value: string) => {
            const particles = ['Electron', 'Proton', 'Neutron', 'Photon', 'Atom', 'Quantum'];
            return particles.includes(value);
          }
        }
      ],
      chemistry: [
        {
          description: "Munch CHEMISTRY terms",
          checkAnswer: (value: string) => this.chemistry.includes(value)
        },
        {
          description: "Munch STATES OF MATTER",
          checkAnswer: (value: string) => {
            const states = ['Gas', 'Liquid', 'Solid', 'Plasma', 'Crystal'];
            return states.includes(value);
          }
        }
      ],
      scientists: [
        {
          description: "Munch FAMOUS SCIENTISTS",
          checkAnswer: (value: string) => this.scientists.includes(value)
        },
        {
          description: "Munch PHYSICISTS",
          checkAnswer: (value: string) => {
            const physicists = ['Einstein', 'Newton', 'Galileo', 'Hawking', 'Tesla', 'Faraday', 'Bohr', 'Planck', 'Feynman', 'Heisenberg'];
            return physicists.includes(value);
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
