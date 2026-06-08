/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, RotateCw, Check, Share2, HelpCircle, Eye, EyeOff, ClipboardCheck, ArrowRight, Award, RotateCcw } from "lucide-react";
import { Puzzle, Category, PlayedGame, UserStats } from "../types";

interface ConnectionsGameProps {
  puzzle: Puzzle;
  onNextLevel: () => void;
  onGameFinished: (game: PlayedGame) => void;
}

// NYTimes Authentic hex styling values
const LEVEL_COLORS = {
  0: { bg: "bg-[#f9df6d]", text: "text-neutral-900", border: "border-[#edd15c]", name: "Yellow (Straightforward)" },
  1: { bg: "bg-[#a0c35a]", text: "text-neutral-900", border: "border-[#91b24d]", name: "Green (Medium)" },
  2: { bg: "bg-[#b0c4ef]", text: "text-neutral-900", border: "border-[#9dafd8]", name: "Blue (Hard)" },
  3: { bg: "bg-[#ba7ec8]", text: "text-white", border: "border-[#a66cb3]", name: "Purple (Tricky)" },
};

export const ConnectionsGame: React.FC<ConnectionsGameProps> = ({ puzzle, onNextLevel, onGameFinished }) => {
  const [activeWords, setActiveWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<Category[]>([]);
  const [mistakesRemaining, setMistakesRemaining] = useState<number>(4);
  const [attempts, setAttempts] = useState<string[][]>([]); // Selection history
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [revealSolutions, setRevealSolutions] = useState<boolean>(false);
  const [shakeGrid, setShakeGrid] = useState<boolean>(false);
  const [showHelpMsg, setShowHelpMsg] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Initialize new puzzle
  useEffect(() => {
    // Collect all words across the 4 categories
    const words = puzzle.categories.reduce((acc: string[], cat) => [...acc, ...cat.words], [] as string[]);
    // Randomize initial positions
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    setActiveWords(shuffled);
    setSelectedWords([]);
    setSolvedCategories([]);
    setMistakesRemaining(4);
    setAttempts([]);
    setAlertMsg(null);
    setIsGameFinished(false);
    setWon(false);
    setRevealSolutions(false);
    setShakeGrid(false);
    setCopiedShareLink(false);
  }, [puzzle]);

  // Reset the current puzzle play state back to pristine state without requesting a new puzzle
  const handleRetry = () => {
    // Collect all words across the 4 categories
    const words = puzzle.categories.reduce((acc: string[], cat) => [...acc, ...cat.words], [] as string[]);
    // Randomize positions again
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    setActiveWords(shuffled);
    setSelectedWords([]);
    setSolvedCategories([]);
    setMistakesRemaining(4);
    setAttempts([]);
    setAlertMsg("Level restarted - Good luck!");
    setIsGameFinished(false);
    setWon(false);
    setRevealSolutions(false);
    setShakeGrid(false);
    setCopiedShareLink(false);
  };

  // Alert dismisser timer
  useEffect(() => {
    if (alertMsg) {
      const t = setTimeout(() => setAlertMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [alertMsg]);

  // Click card handler
  const handleWordClick = (word: string) => {
    if (isGameFinished) return;

    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      if (selectedWords.length < 4) {
        setSelectedWords([...selectedWords, word]);
      }
    }
  };

  // Reshuffle items currently in play
  const handleShuffle = () => {
    if (isGameFinished) return;
    setActiveWords([...activeWords].sort(() => Math.random() - 0.5));
  };

  // Submit current selections
  const handleSubmit = () => {
    if (isGameFinished || selectedWords.length !== 4) return;

    // 1. Check if selection is already guessed previously
    const sortedSelection = [...selectedWords].sort();
    const alreadyGuessed = attempts.some(att => {
      const sortedAtt = [...att].sort();
      return sortedAtt.every((w, i) => w === sortedSelection[i]);
    });

    if (alreadyGuessed) {
      setAlertMsg("Already guessed!");
      setShakeGrid(true);
      setTimeout(() => setShakeGrid(false), 500);
      return;
    }

    // Append to attempts history
    const newAttempts = [...attempts, selectedWords];
    setAttempts(newAttempts);

    // 2. Discover if selectedWords match any of the categories
    const matchingCategory = puzzle.categories.find(cat => {
      return cat.words.every(w => selectedWords.includes(w));
    });

    if (matchingCategory) {
      // Correct Match!
      const updatedSolved = [...solvedCategories, matchingCategory];
      setSolvedCategories(updatedSolved);

      // Filter out these solved words from the active board Pool
      const remainingWords = activeWords.filter(w => !selectedWords.includes(w));
      setActiveWords(remainingWords);
      setSelectedWords([]);

      // Play success check
      setAlertMsg(`Resolved: ${matchingCategory.title}!`);

      // Win condition: All 4 categories solved
      if (updatedSolved.length === 4) {
        triggerEndGame(true, newAttempts, mistakesRemaining);
      }
    } else {
      // Incorrect Match
      setShakeGrid(true);
      setTimeout(() => setShakeGrid(false), 500);

      // Check if "One Away" (selection shares exactly 3 words with any category)
      let isOneAway = false;
      puzzle.categories.forEach(cat => {
        const matches = cat.words.filter(w => selectedWords.includes(w)).length;
        if (matches === 3) {
          isOneAway = true;
        }
      });

      const nextMistakes = mistakesRemaining - 1;
      setMistakesRemaining(nextMistakes);

      if (isOneAway && nextMistakes > 0) {
        setAlertMsg("One away!");
      } else {
        setAlertMsg("Incorrect guess");
      }

      // Lose condition: 0 mistakes remaining
      if (nextMistakes === 0) {
        triggerEndGame(false, newAttempts, 0);
      }
    }
  };

  const triggerEndGame = (didWin: boolean, allAttempts: string[][], mistakesLeft: number) => {
    setIsGameFinished(true);
    setWon(didWin);

    // Create record
    const record: PlayedGame = {
      id: `game-${Date.now()}`,
      puzzleId: puzzle.id,
      puzzleTitle: puzzle.title,
      isCustom: puzzle.isCustom,
      theme: puzzle.theme,
      won: didWin,
      mistakesRemaining: mistakesLeft,
      history: allAttempts,
      datePlayed: new Date().toISOString()
    };

    onGameFinished(record);
  };

  // Compile NYC authentic grid emojis representation
  const generateShareData = (): string => {
    // Map each puzzle word to its correct category difficulty index (0-3)
    const wordLevelMap: Record<string, 0 | 1 | 2 | 3> = {};
    puzzle.categories.forEach(cat => {
      cat.words.forEach(w => {
        wordLevelMap[w] = cat.level;
      });
    });

    const levelEmojis = {
      0: "🟨", // Yellow
      1: "🟩", // Green
      2: "🟦", // Blue
      3: "🟪"  // Purple
    };

    let textStr = `Connections Unlimited: "${puzzle.title}"\n`;
    if (puzzle.isCustom && puzzle.theme) {
      textStr += `Custom AI Theme: ${puzzle.theme}\n`;
    }

    if (won) {
      const mistakesUsed = 4 - mistakesRemaining;
      textStr += `Cleared in ${attempts.length} attempts! (Mistakes used: ${mistakesUsed})\n\n`;
    } else {
      textStr += "Failed to clear the grid\n\n";
    }

    // Convert attempts into rows of emojis
    attempts.forEach(attempt => {
      const emojis = attempt.map(word => levelEmojis[wordLevelMap[word] ?? 0]);
      textStr += `${emojis.join("")}\n`;
    });

    textStr += "\nPlay more unlimited puzzles here: Connections Unlimited!";
    return textStr;
  };

  const handleShareClick = () => {
    const data = generateShareData();
    navigator.clipboard.writeText(data).then(() => {
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2000);
    }).catch(() => {
      setAlertMsg("Failed to copy to clipboard.");
    });
  };

  const getDifficultyBadgeColor = (diff?: string) => {
    switch (diff) {
      case "easy":
        return "bg-[#f9df6d]/20 text-[#a38000] border-[#f9df6d]";
      case "medium":
        return "bg-[#a0c35a]/20 text-[#4c6b12] border-[#a0c35a]";
      case "hard":
        return "bg-[#b0c4ef]/25 text-[#1e3a8a] border-[#b0c4ef]";
      case "super-hard":
        return "bg-[#ba7ec8]/20 text-[#6b21a8] border-[#ba7ec8]";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-300";
    }
  };

  return (
    <div id="connections-game-container" className="space-y-6">
      {/* Game Banner Header */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-200">
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
            <span className="text-[10px] bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-sm font-semibold tracking-wider uppercase font-sans">
              {puzzle.isCustom ? "AI Generated" : "Preset Level"}
            </span>
            {puzzle.difficulty && (
              <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-widest uppercase font-sans border ${getDifficultyBadgeColor(puzzle.difficulty)}`}>
                {puzzle.difficulty === "super-hard" ? "SUPER HARD" : puzzle.difficulty}
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-neutral-900 font-sans mt-1">
            {puzzle.title} {puzzle.isCustom && puzzle.theme ? `• "${puzzle.theme}"` : ""}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            id="retry-level-now"
            onClick={handleRetry}
            className="p-1.5 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg flex items-center gap-1 text-xs cursor-pointer transition-colors"
            title="Reset mistakes and clear progress to try this level again"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-700" />
            Restart Level
          </button>

          <button
            id="how-to-play-toggle"
            onClick={() => setShowHelpMsg(!showHelpMsg)}
            className="p-1.5 hover:bg-neutral-200 text-neutral-500 rounded-lg flex items-center gap-1 text-xs cursor-pointer transition-colors"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4" />
            Rules
          </button>

          <button
            id="cheat-reveal-toggle"
            onClick={() => setRevealSolutions(!revealSolutions)}
            className="p-1.5 hover:bg-neutral-200 text-neutral-500 rounded-lg flex items-center gap-1 text-xs cursor-pointer transition-colors"
            title={revealSolutions ? "Hide Answers" : "Peek Answers"}
          >
            {revealSolutions ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4" />}
            {revealSolutions ? "Hide Solution" : "Reveal Answers"}
          </button>
        </div>
      </div>

      {/* Rules block */}
      <AnimatePresence>
        {showHelpMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-xs text-sky-900 space-y-1.5 font-sans overflow-hidden"
          >
            <p className="font-bold">Group words that share an association:</p>
            <ul className="list-disc list-inside space-y-1 ml-1 pl-1">
              <li>Select four words and click "Submit" to test your category.</li>
              <li>You must identify all four categories without making 4 mistakes!</li>
              <li>Categories range in difficulty: <span className="font-semibold text-amber-700">Yellow</span> is straightforward, <span className="font-semibold text-emerald-700">Green</span> is medium, <span className="font-semibold text-sky-700">Blue</span> is hard, and <span className="font-semibold text-purple-700">Purple</span> is trickiest.</li>
              <li>Play preset hand-crafted boards or type any theme to build creative AI connections!</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cheat solution viewer sheet */}
      <AnimatePresence>
        {revealSolutions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl space-y-2.5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-sans">Solutions Sheet</span>
              <span className="text-[10px] text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded-xs font-sans">Cheat Mode</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {puzzle.categories.map((cat) => {
                const colors = LEVEL_COLORS[cat.level];
                return (
                  <div key={cat.title} className="p-3 bg-white border border-neutral-200 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.bg}`}></span>
                        <span className="text-xs font-bold text-neutral-800 font-sans">{cat.title}</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-tight font-sans italic mb-2">
                        {cat.description || "Clever connection category..."}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap mt-auto">
                      {cat.words.map(w => (
                        <span key={w} className="text-[10px] bg-neutral-100 text-neutral-700 font-mono font-semibold uppercase px-1.5 py-0.5 rounded-xs border border-neutral-200">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Pop Feedback Alert */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            id="connections-toast-banner"
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-neutral-900 text-white font-sans text-xs px-4 py-2.5 rounded-full shadow-lg font-semibold flex items-center justify-center border border-neutral-800 tracking-wide uppercase transition-all"
          >
            {alertMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Wrapper */}
      <div className="space-y-4">
        {/* Solved Categories Stack */}
        <div className="flex flex-col gap-3">
          {solvedCategories.map((cat) => {
            const colors = LEVEL_COLORS[cat.level];
            return (
              <motion.div
                key={cat.title}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`${colors.bg} ${colors.text} rounded-xl h-20 flex flex-col items-center justify-center relative font-sans shadow-sm`}
              >
                <div className="absolute top-2 right-4 text-[9px] font-bold opacity-60 tracking-widest uppercase">
                  SOLVED
                </div>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none">
                  {cat.title}
                </p>
                <p className="text-sm sm:text-base font-bold tracking-tight text-center px-4 mt-1.5 uppercase leading-none">
                  {cat.words.join(", ")}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Word Selection Grid */}
        {activeWords.length > 0 && (
          <motion.div
            animate={shakeGrid ? { x: [-10, 10, -8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-4 gap-3 animate-fade-in"
          >
            {activeWords.map((word) => {
              const isSelected = selectedWords.includes(word);
              return (
                <button
                  key={word}
                  id={`word-card-${word.toLowerCase().replace(/\s+/g, "-")}`}
                  type="button"
                  disabled={isGameFinished}
                  onClick={() => handleWordClick(word)}
                  className={`
                    h-20 sm:h-24 flex items-center justify-center p-2 rounded-xl text-xs sm:text-sm font-bold uppercase select-none transition-all cursor-pointer border tracking-tight font-sans text-center break-words leading-tight
                    ${isSelected
                      ? "bg-[#5A594E] text-white border-b-4 border-[#3A3932] shadow-md -translate-y-0.5"
                      : "bg-[#EFEFEF] hover:bg-[#E5E5E5] border-transparent text-[#121212]"
                    }
                  `}
                >
                  <span className="line-clamp-2 max-w-full truncate overflow-ellipsis p-0.5">
                    {word}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Mistake remaining counter dots - Styled as sleek slate indicators */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 border-t border-[#E2E2E2] mt-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#787878] uppercase tracking-wider">
            Mistakes Remaining:
          </span>
          <div id="mistakes-counter-dots" className="flex items-center gap-2">
            {[1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  dot <= mistakesRemaining ? "bg-[#121212]" : "border-2 border-[#E2E2E2] bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Categories count found info bubble */}
        {solvedCategories.length > 0 && (
          <div className="bg-[#F5F5F5] px-4 py-1.5 rounded-lg border border-[#E2E2E2] text-xs">
            <span className="font-bold text-[#121212] uppercase tracking-wider">Solved:</span>
            <span className="ml-2 font-medium text-[#787878]">
              {solvedCategories.length} / 4 Found
            </span>
          </div>
        )}
      </div>

      {/* Interactive Controls Buttons */}
      <div id="controls-toolbar" className="flex items-center justify-center flex-wrap gap-4 pt-4 border-t border-[#E2E2E2]">
        <button
          id="shuffle-btn"
          disabled={isGameFinished}
          onClick={handleShuffle}
          className="px-6 py-2.5 text-xs font-bold bg-white border-2 border-[#121212] hover:bg-[#F5F5F5] text-[#121212] rounded-full flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Shuffle
        </button>

        <button
          id="deselect-all-btn"
          disabled={selectedWords.length === 0 || isGameFinished}
          onClick={() => setSelectedWords([])}
          className="px-6 py-2.5 text-xs font-bold bg-white border-2 border-[#121212] hover:bg-[#F5F5F5] text-[#121212] rounded-full flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Deselect All
        </button>

        <button
          id="submit-selection-btn"
          disabled={selectedWords.length !== 4 || isGameFinished}
          onClick={handleSubmit}
          className={`px-8 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-md
            ${selectedWords.length === 4 && !isGameFinished
              ? "bg-[#121212] hover:bg-black text-white border-2 border-[#121212] active:scale-95"
              : "bg-[#EFEFEF] text-neutral-400 border-2 border-transparent cursor-not-allowed shadow-none"
            }
          `}
        >
          <Check className="w-4 h-4" />
          Submit Guess
        </button>
      </div>

      {/* Completion Dialog / Next Steps container */}
      <AnimatePresence>
        {isGameFinished && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            id="completion-banner-segment"
            className={`p-6 rounded-2xl border text-center ${
              won
                ? "bg-emerald-50 text-emerald-900 border-emerald-100"
                : "bg-red-50 text-red-900 border-red-100"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              {won ? (
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full">
                  <Award className="w-8 h-8" />
                </div>
              ) : null}

              <div>
                <h3 className="text-lg font-black font-sans leading-tight">
                  {won ? "Incredible Job! Solution Discovered." : "Better Luck Next Time!"}
                </h3>
                <p className="text-xs font-medium text-neutral-500 mt-1">
                  {won
                    ? `You cleared "${puzzle.title}" with ${mistakesRemaining} ${mistakesRemaining === 1 ? "mistake" : "mistakes"} remaining!`
                    : "You made 4 mistakes. Reveal the answers above to see what connections you missed."}
                </p>
              </div>

              {/* Share grid widget */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  id="share-grid-btn"
                  onClick={handleShareClick}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs hover:bg-neutral-800 active:scale-98 transition-all"
                >
                  {copiedShareLink ? (
                    <>
                      <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                      Results Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share Connections Grid
                    </>
                  )}
                </button>

                <button
                  id="retry-level-btn"
                  onClick={handleRetry}
                  className="px-5 py-2 bg-white text-neutral-800 border border-neutral-300 hover:border-neutral-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Level
                </button>

                <button
                  id="next-puzzle-trigger"
                  onClick={onNextLevel}
                  className="px-5 py-2 bg-white text-neutral-800 border border-neutral-300 hover:border-neutral-400 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Next Game
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
