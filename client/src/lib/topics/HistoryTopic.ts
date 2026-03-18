import { TopicProvider, GridCell } from "./TopicProvider";
import { Challenge } from "../stores/useGameState";

export class HistoryTopic extends TopicProvider {
  private selectedCategory: string = 'random';

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  getCategories(): Array<{id: string, name: string}> {
    return [
      { id: 'random', name: 'Random Mix' },
      { id: 'ancient', name: 'Ancient Civilizations' },
      { id: 'leaders', name: 'World Leaders' },
      { id: 'events', name: 'Major Events' },
      { id: 'inventions', name: 'Inventions' },
      { id: 'egypt', name: 'Ancient Egypt' },
      { id: 'wars', name: 'Wars & Conflicts' }
    ];
  }

  private readonly ancient = [
    'Roman Empire', 'Ancient Greece', 'Mesopotamia', 'Persia', 'Carthage',
    'Aztec Empire', 'Inca Empire', 'Maya', 'Han Dynasty', 'Mongol Empire',
    'Ottoman Empire', 'Byzantine', 'Sparta', 'Athens', 'Troy',
    'Babylonia', 'Sumeria', 'Phoenicia', 'Viking Age', 'Medieval'
  ];

  private readonly leaders = [
    'Caesar', 'Cleopatra', 'Alexander', 'Napoleon', 'Churchill',
    'Lincoln', 'Washington', 'Genghis Khan', 'Elizabeth I', 'Victoria',
    'Gandhi', 'Mandela', 'Charlemagne', 'Augustus', 'Constantine',
    'Ramses II', 'Hatshepsut', 'Akhenaten', 'Tutankhamun', 'Nefertiti'
  ];

  private readonly events = [
    'Renaissance', 'Reformation', 'Industrial Rev', 'French Rev',
    'Moon Landing', 'Fall of Rome', 'Black Death', 'Crusades',
    'Silk Road', 'Printing Press', 'Discovery of America', 'Magna Carta',
    'Berlin Wall', 'Cold War', 'Space Race', 'D-Day'
  ];

  private readonly inventions = [
    'Wheel', 'Compass', 'Gunpowder', 'Paper', 'Telescope',
    'Steam Engine', 'Telephone', 'Light Bulb', 'Airplane', 'Radio',
    'Television', 'Computer', 'Internet', 'Printing', 'Clock',
    'Dynamite', 'Penicillin', 'Vaccine', 'Microscope', 'Battery'
  ];

  private readonly egypt = [
    'Pyramids', 'Sphinx', 'Pharaoh', 'Mummy', 'Hieroglyphics',
    'Nile River', 'Tutankhamun', 'Cleopatra', 'Ramses II', 'Cairo',
    'Thebes', 'Rosetta Stone', 'Papyrus', 'Sarcophagus', 'Ankh',
    'Scarab', 'Obelisk', 'Anubis', 'Ra', 'Isis',
    'Osiris', 'Horus', 'Canopic Jars', 'Valley of Kings'
  ];

  private readonly wars = [
    'World War I', 'World War II', 'Civil War', 'Trojan War',
    'Hundred Years War', 'Napoleonic Wars', 'Punic Wars', 'Peloponnesian',
    'War of Roses', 'Revolutionary War', 'Korean War', 'Vietnam War',
    'Cold War', 'Gulf War', 'Crusades', 'Norman Conquest'
  ];

  private readonly allItems = [
    ...this.ancient, ...this.leaders, ...this.events,
    ...this.inventions, ...this.egypt, ...this.wars
  ];

  getName(): string {
    return "History";
  }

  generateChallenge(level: number): Challenge {
    const allChallenges: Record<string, Challenge[]> = {
      ancient: [
        {
          description: "Munch ANCIENT CIVILIZATIONS",
          checkAnswer: (value: string) => this.ancient.includes(value)
        },
        {
          description: "Munch GREEK & ROMAN places",
          checkAnswer: (value: string) => {
            const grecoRoman = ['Roman Empire', 'Ancient Greece', 'Sparta', 'Athens', 'Troy', 'Carthage', 'Byzantine'];
            return grecoRoman.includes(value);
          }
        }
      ],
      leaders: [
        {
          description: "Munch WORLD LEADERS",
          checkAnswer: (value: string) => this.leaders.includes(value)
        },
        {
          description: "Munch ANCIENT RULERS",
          checkAnswer: (value: string) => {
            const ancientRulers = ['Caesar', 'Cleopatra', 'Alexander', 'Genghis Khan', 'Augustus', 'Constantine', 'Ramses II', 'Hatshepsut', 'Tutankhamun', 'Nefertiti', 'Charlemagne', 'Akhenaten'];
            return ancientRulers.includes(value);
          }
        }
      ],
      events: [
        {
          description: "Munch MAJOR HISTORICAL EVENTS",
          checkAnswer: (value: string) => this.events.includes(value)
        }
      ],
      inventions: [
        {
          description: "Munch INVENTIONS",
          checkAnswer: (value: string) => this.inventions.includes(value)
        },
        {
          description: "Munch ANCIENT INVENTIONS",
          checkAnswer: (value: string) => {
            const ancient = ['Wheel', 'Compass', 'Gunpowder', 'Paper', 'Printing', 'Clock'];
            return ancient.includes(value);
          }
        }
      ],
      egypt: [
        {
          description: "Munch ANCIENT EGYPT items",
          checkAnswer: (value: string) => this.egypt.includes(value)
        },
        {
          description: "Munch EGYPTIAN GODS",
          checkAnswer: (value: string) => {
            const gods = ['Anubis', 'Ra', 'Isis', 'Osiris', 'Horus'];
            return gods.includes(value);
          }
        },
        {
          description: "Munch EGYPTIAN PHARAOHS",
          checkAnswer: (value: string) => {
            const pharaohs = ['Tutankhamun', 'Cleopatra', 'Ramses II', 'Hatshepsut', 'Akhenaten', 'Nefertiti'];
            return pharaohs.includes(value);
          }
        }
      ],
      wars: [
        {
          description: "Munch WARS & CONFLICTS",
          checkAnswer: (value: string) => this.wars.includes(value)
        },
        {
          description: "Munch WORLD WARS",
          checkAnswer: (value: string) => {
            const worldWars = ['World War I', 'World War II', 'D-Day', 'Cold War'];
            return worldWars.includes(value);
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
