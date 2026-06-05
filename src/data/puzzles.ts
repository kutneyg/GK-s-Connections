/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Puzzle } from "../types";

export const PRESET_PUZZLES: Puzzle[] = [
  {
    id: "preset-1",
    title: "Starter Pack",
    isCustom: false,
    categories: [
      {
        title: "SHADES OF BLUE",
        words: ["AZURE", "COBALT", "NAVY", "TEAL"],
        level: 0,
        description: "Standard recognizable shades of blue."
      },
      {
        title: "KITCHEN APPLIANCES",
        words: ["BLENDER", "MICROWAVE", "OVEN", "TOASTER"],
        level: 1,
        description: "Common electrical devices used for cooking or prep."
      },
      {
        title: "THINGS WITH TEETH",
        words: ["COMB", "GEAR", "SAW", "ZIPPER"],
        level: 2,
        description: "Items that share the physical attribute of having teeth."
      },
      {
        title: "WORDS PRECEDING 'PAPER'",
        words: ["CLIP", "MACHE", "TIGER", "WALL"],
        level: 3,
        description: "Terms that can be combined with 'paper': Paperclip, Paper-mache, Paper tiger, Wallpaper."
      }
    ]
  },
  {
    id: "preset-2",
    title: "Animal Planet",
    isCustom: false,
    categories: [
      {
        title: "FLIGHTLESS BIRDS",
        words: ["KIWI", "OSTRICH", "PENGUIN", "RHEA"],
        level: 0,
        description: "Birds incapable of sustained flight."
      },
      {
        title: "CAT SOUNDS",
        words: ["HISS", "MEOW", "PURR", "YOWL"],
        level: 1,
        description: "Vocalizations typically produced by cats."
      },
      {
        title: "WORDS STARTING WITH PLANETS",
        words: ["EARTHWORM", "MARROW", "MERCURIAL", "SATURNINE"],
        level: 2,
        description: "Words whose prefixes spell out solar system planets."
      },
      {
        title: "HOMOPHONES OF NUMBERS",
        words: ["ATE", "FOR", "ONE", "TOO"],
        level: 3,
        description: "Words that sound exactly like numbers (Eight, Four, Won, Two)."
      }
    ]
  },
  {
    id: "preset-3",
    title: "Game Night",
    isCustom: false,
    categories: [
      {
        title: "CARD GAMES",
        words: ["BRIDGE", "HEARTS", "POKER", "WAR"],
        level: 0,
        description: "Popular multiplayer card games."
      },
      {
        title: "RECREATIONAL AREAS",
        words: ["GARDEN", "LAWN", "PARK", "YARD"],
        level: 1,
        description: "Outdoor green spaces."
      },
      {
        title: "MONOPOLY TOKENS",
        words: ["HAT", "IRON", "SHIP", "SHOE"],
        level: 2,
        description: "Classic pewter playing pieces for Monopoly."
      },
      {
        title: "THINGS YOU CAN 'DECK'",
        words: ["CARDS", "HALLS", "OPPONENT", "PATIO"],
        level: 3,
        description: "Double meanings of things you can physically build, punch, decorate, or deal of cards."
      }
    ]
  },
  {
    id: "preset-4",
    title: "Musical Nuance",
    isCustom: false,
    categories: [
      {
        title: "WOODWIND INSTRUMENTS",
        words: ["CLARINET", "FLUTE", "OBOE", "RECORDER"],
        level: 0,
        description: "Wind instruments crafted from woods or polymers."
      },
      {
        title: "SHINY METALS",
        words: ["BRASS", "GOLD", "PLATINUM", "SILVER"],
        level: 1,
        description: "Precious and shiny metallic materials."
      },
      {
        title: "SLANG FOR EXCELLENT SONG",
        words: ["BANGER", "GEM", "JAM", "KNOCKOUT"],
        level: 2,
        description: "Interchangeable slang words used to praise a good track."
      },
      {
        title: "PALINDROMES",
        words: ["KAYAK", "NOON", "RADAR", "ROTOR"],
        level: 3,
        description: "Words spelled the same forwards and backwards."
      }
    ]
  },
  {
    id: "preset-5",
    title: "Tech & Office",
    isCustom: false,
    categories: [
      {
        title: "WEB BROWSERS",
        words: ["CHROME", "EDGE", "OPERA", "SAFARI"],
        level: 0,
        description: "Software used to view websites."
      },
      {
        title: "OFFICE STATIONERY",
        words: ["ERASER", "RULER", "STAPLER", "TAPE"],
        level: 1,
        description: "Devices found sitting on desks."
      },
      {
        title: "COMPUTER MOUSE ACTIONS",
        words: ["CLICK", "DRAG", "HOVER", "SCROLL"],
        level: 2,
        description: "Interactions executed via a mouse or trackpad."
      },
      {
        title: "WORDS COMBINING WITH '_PORT'",
        words: ["AIR", "CAR", "PASS", "SUP"],
        level: 3,
        description: "Common root syllables that prefix -port (Airport, Carport, Passport, Support)."
      }
    ]
  },
  {
    id: "preset-6",
    title: "Chef's Kiss",
    isCustom: false,
    categories: [
      {
        title: "POPULAR HERBS",
        words: ["BASIL", "MINT", "OREGANO", "ROSEMARY"],
        level: 0,
        description: "Aromatic edible leaves used as seasoning."
      },
      {
        title: "COOKING METHODS",
        words: ["BAKE", "FRY", "GRILL", "STEAM"],
        level: 1,
        description: "Procedures used to heat food."
      },
      {
        title: "SHAPES OF PASTA",
        words: ["BOWTIE", "ELBOW", "PENNE", "SHELL"],
        level: 2,
        description: "Distinctive shapes of dried Italian pasta."
      },
      {
        title: "HOMOPHONES OF COUNTRIES",
        words: ["CHILE", "GREECE", "HUNGARY", "WALES"],
        level: 3,
        description: "Words sounding like Chili, Grease, Hungry, Whales."
      }
    ]
  },
  {
    id: "preset-7",
    title: "Nature & Space",
    isCustom: false,
    categories: [
      {
        title: "TREE ANATOMY",
        words: ["BRANCH", "LEAF", "ROOT", "TRUNK"],
        level: 0,
        description: "Biological components of trees."
      },
      {
        title: "WIND DESCRIPTIONS",
        words: ["GUST", "HOWL", "SIGH", "WHISTLE"],
        level: 1,
        description: "Nouns and verbs describing wind behavior."
      },
      {
        title: "GEOLOGICAL FORMATIONS",
        words: ["CANYON", "MESA", "PLATEAU", "VALLEY"],
        level: 2,
        description: "Common geological elevation profiles."
      },
      {
        title: "ANAGRAMS OF 'EAST'",
        words: ["EATS", "SATE", "SEAT", "TEAS"],
        level: 3,
        description: "Every word is constructed using the exact letters E, A, S, T."
      }
    ]
  },
  {
    id: "preset-8",
    title: "Fit & Active",
    isCustom: false,
    categories: [
      {
        title: "FOOTWEAR DESIGNS",
        words: ["BOOT", "LOAFER", "SANDAL", "SNEAKER"],
        level: 0,
        description: "Classes of protective worn items on feet."
      },
      {
        title: "EXERCISE CORES",
        words: ["PLANK", "RUN", "SQUAT", "STRETCH"],
        level: 1,
        description: "Standard movements performed in gym fitness regimes."
      },
      {
        title: "THINGS THAT SPIN",
        words: ["COIN", "EARTH", "TOP", "WHEEL"],
        level: 2,
        description: "Objects that revolve continuously around an axis."
      },
      {
        title: "WORDS PRECEDING 'WORK'",
        words: ["ART", "FRAME", "NET", "PATCH"],
        level: 3,
        description: "Words compounding with work: Artwork, Framework, Network, Patchwork."
      }
    ]
  },
  {
    id: "preset-9",
    title: "Magic & Myth",
    isCustom: false,
    categories: [
      {
        title: "ASTRONOMY Nouns",
        words: ["COMET", "METEOR", "PLANET", "STAR"],
        level: 0,
        description: "Celestial bodies visible in the night skies."
      },
      {
        title: "MYTHOLOGICAL BEASTS",
        words: ["DRAGON", "GRIFFIN", "KRAKEN", "PHOENIX"],
        level: 1,
        description: "Legendary creatures of ancient lore."
      },
      {
        title: "STAGE ILLUSION CONCEPTS",
        words: ["ESCAPE", "LEVITATE", "SAW", "VANISH"],
        level: 2,
        description: "Key themes performed by stage magicians."
      },
      {
        title: "WORDS PRECEDING 'JACK'",
        words: ["BLACK", "FLAP", "LUMBER", "UNION"],
        level: 3,
        description: "Words ending with 'jack': Blackjack, Flapjack, Lumberjack, Union Jack."
      }
    ]
  },
  {
    id: "preset-10",
    title: "Time & Measure",
    isCustom: false,
    categories: [
      {
        title: "TIME INTERVALS",
        words: ["ERA", "HOUR", "MONTH", "YEAR"],
        level: 0,
        description: "Standard durations of time."
      },
      {
        title: "METRIC UNITS",
        words: ["GRAM", "INCH", "LITER", "METER"],
        level: 1,
        description: "Physical dimensional measurement units. (Note: Inch is imperial, the others are metric, but represent common math units!)"
      },
      {
        title: "SLANG FOR 'EXCELLENT'",
        words: ["DOPE", "RAD", "SICK", "TIGHT"],
        level: 2,
        description: "Aesthetic terms of enthusiasm."
      },
      {
        title: "SPORTS THAT USE STONES / PUCKS",
        words: ["CURLING", "GO", "MANCALA", "SHUFFLEBOARD"],
        level: 3,
        description: "Games/Sports that are played physically using smooth stones or flattened weights/pucks."
      }
    ]
  }
];

export function getRandomPreset(excludeId?: string): Puzzle {
  const filtered = PRESET_PUZZLES.filter(p => p.id !== excludeId);
  const pool = filtered.length > 0 ? filtered : PRESET_PUZZLES;
  return pool[Math.floor(Math.random() * pool.length)];
}
