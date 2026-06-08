/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  title: string;
  words: string[];
  level: 0 | 1 | 2 | 3; // 0: Yellow, 1: Green, 2: Blue, 3: Purple
  description?: string;
}

export interface Puzzle {
  id: string;
  title: string;
  categories: Category[]; // Exactly 4 categories
  isCustom: boolean;
  theme?: string;
  difficulty?: "easy" | "medium" | "hard" | "super-hard";
}

export interface PlayedGame {
  id: string;
  puzzleId: string;
  puzzleTitle: string;
  isCustom: boolean;
  theme?: string;
  won: boolean;
  mistakesRemaining: number;
  history: string[][]; // Selections submitted during the game, each is 4 words
  datePlayed: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  perfectGames: number; // Win with 4 mistakes remaining
  categorySolved: {
    yellow: number;
    green: number;
    blue: number;
    purple: number;
  };
}
