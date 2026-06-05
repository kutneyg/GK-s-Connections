/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { PRESET_PUZZLES, getRandomPreset } from "./data/puzzles";
import { ConnectionsGame } from "./components/ConnectionsGame";
import { AISelector } from "./components/AISelector";
import { StatsModal } from "./components/StatsModal";
import { Puzzle, PlayedGame, UserStats } from "./types";
import { Sparkles, BookOpen, BarChart3, RefreshCw, HelpCircle, AlertCircle } from "lucide-react";

const LOCAL_STATS_KEY = "connections_unlimited_stats_v1";
const LOCAL_HISTORY_KEY = "connections_unlimited_history_v1";

const DEFAULT_STATS: UserStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  perfectGames: 0,
  categorySolved: {
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0
  }
};

export default function App() {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle>(PRESET_PUZZLES[0]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [history, setHistory] = useState<PlayedGame[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Initialize and load persistent player statistics
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem(LOCAL_STATS_KEY);
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }

      const storedHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (err) {
      console.error("Local storage error:", err);
    }
  }, []);

  // Save Stats whenever they update
  const saveStatsAndHistory = (newStats: UserStats, newHistory: PlayedGame[]) => {
    setStats(newStats);
    setHistory(newHistory);
    try {
      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(newStats));
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (err) {
      console.error("Failed to save state to local storage:", err);
    }
  };

  // Called when a puzzle is finished (win or loss)
  const handleGameFinished = (gameRecord: PlayedGame) => {
    const updatedHistory = [gameRecord, ...history];

    const updatedStats = { ...stats };
    updatedStats.gamesPlayed += 1;

    if (gameRecord.won) {
      updatedStats.gamesWon += 1;
      updatedStats.currentStreak += 1;
      if (updatedStats.currentStreak > updatedStats.maxStreak) {
        updatedStats.maxStreak = updatedStats.currentStreak;
      }
      if (gameRecord.mistakesRemaining === 4) {
        updatedStats.perfectGames += 1;
      }

      // If they won, they successfully completed all yellow, green, blue, and purple levels
      updatedStats.categorySolved.yellow += 1;
      updatedStats.categorySolved.green += 1;
      updatedStats.categorySolved.blue += 1;
      updatedStats.categorySolved.purple += 1;
    } else {
      // Streak breaks on loss
      updatedStats.currentStreak = 0;

      // In case of a loss, let's credit any levels they solved before running out of mistakes.
      // Since this is a simple approximation, we assume they solved at least a couple of categories.
      // We will credit the yellow & green categories as partially completed efforts
      updatedStats.categorySolved.yellow += 1;
    }

    saveStatsAndHistory(updatedStats, updatedHistory);
  };

  const handleResetStats = () => {
    saveStatsAndHistory(DEFAULT_STATS, []);
  };

  // Switch to a chosen preset puzzle level
  const handleSelectPreset = (puzzleId: string) => {
    const found = PRESET_PUZZLES.find(p => p.id === puzzleId);
    if (found) {
      setActivePuzzle(found);
    }
  };

  // Trigger random puzzle select (preset list)
  const handleLoadRandomPreset = () => {
    const random = getRandomPreset(activePuzzle.id);
    setActivePuzzle(random);
  };

  // API query to fetch custom AI Generated grid
  const handleGenerateAIPuzzle = async (theme: string) => {
    setIsAIGenerating(true);
    setAiError(null);
    try {
      const response = await fetch("/api/generate-puzzle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        let errorMessage = "An error occurred during AI generation.";
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (_) {
            // Keep default message if parsing fails
          }
        } else {
          try {
            const textResponse = await response.text();
            if (textResponse.includes("<body") || textResponse.includes("<html") || textResponse.includes("<!DOCTYPE")) {
              errorMessage = "The server is currently starting up, processing, or returned an unexpected page. Please make sure GEMINI_API_KEY is configured in Settings -> Secrets.";
            } else {
              errorMessage = textResponse || errorMessage;
            }
          } catch (_) {
            // Keep default message if text read fails
          }
        }
        throw new Error(errorMessage);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned a non-JSON response. Please verify the server is running correctly.");
      }

      const generatedPuzzle = await response.json();
      setActivePuzzle(generatedPuzzle as Puzzle);
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      const userMessage = err.message || "Failed to make custom board. Please double check that server is online and API key is set.";
      setAiError(userMessage);
      throw new Error(userMessage);
    } finally {
      setIsAIGenerating(false);
    }
  };

  return (
    <div id="application-root" className="min-h-screen bg-[#FFFFFF] text-[#121212] selection:bg-[#121212] selection:text-white font-sans py-4 sm:py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Navigation / Header Brand - Matching Sleek Interface layout */}
        <header id="connections-brand-header" className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#E2E2E2]">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-10 h-10 bg-[#121212] flex items-center justify-center rounded-lg flex-shrink-0">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-white rounded-2xs"></div>
                <div className="w-2 h-2 bg-white/40 rounded-2xs"></div>
                <div className="w-2 h-2 bg-white/40 rounded-2xs"></div>
                <div className="w-2 h-2 bg-white rounded-2xs"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-[#121212]">
                CONNECTIONS
              </h1>
              <p className="text-[10px] text-[#787878] font-sans font-bold tracking-[0.2em] uppercase mt-0.5">
                Unlimited Puzzles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] text-[#787878] uppercase font-bold tracking-widest leading-none">Streak</p>
              <p className="text-lg font-mono font-bold text-[#121212] mt-0.5">{stats.currentStreak}</p>
            </div>
            <div className="h-8 w-[1px] bg-[#E2E2E2]"></div>
            <div className="flex flex-col items-center sm:items-end">
              <button
                id="view-stats-btn"
                onClick={() => setShowStatsModal(true)}
                className="px-4 py-1.5 bg-[#121212] hover:bg-black text-white text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Stats & Logs
              </button>
            </div>
          </div>
        </header>

        {/* Level Controls & Puzzle Select */}
        <div id="puzzle-selector-panel" className="bg-[#FFFFFF] rounded-2xl border border-[#E2E2E2] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#787878]" />
              <label htmlFor="preset-level-picker" className="text-xs font-semibold text-[#787878] uppercase tracking-wider font-sans">
                Curated Levels:
              </label>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <select
                id="preset-level-picker"
                value={activePuzzle.id.startsWith("preset-") ? activePuzzle.id : ""}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-xs bg-[#F5F5F5] border border-[#E2E2E2] rounded-lg text-[#121212] outline-hidden focus:border-[#787878] font-sans cursor-pointer font-semibold uppercase tracking-wider"
              >
                <option value="" disabled>-- Select Preset --</option>
                {PRESET_PUZZLES.map((preset, index) => (
                  <option key={preset.id} value={preset.id}>
                    LEVEL #{index + 1}: {preset.title}
                  </option>
                ))}
              </select>

              <button
                id="random-preset-btn"
                onClick={handleLoadRandomPreset}
                className="p-1.5 hover:bg-[#F5F5F5] text-[#121212] border border-[#E2E2E2] bg-white rounded-lg transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                title="Random Preset Level"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic game execution terminal */}
        <main id="active-game-workspace" className="bg-[#FFFFFF] rounded-2xl border border-[#E2E2E2] p-6 relative">
          {/* AI Generator Loading overlay */}
          {isAIGenerating && (
            <div id="ai-generating-overlay" className="absolute inset-0 bg-white/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in rounded-2xl">
              <div className="flex flex-col items-center gap-4 max-w-sm">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 animate-pulse">
                  <Sparkles className="w-10 h-10 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-lg font-sans">Gemini is designing a custom grid</h4>
                  <p className="text-xs text-neutral-500 mt-2 font-sans line-clamp-2">
                    Creating word associations, crafting overlaps, and sorting difficulty colors... This will be ready in seconds!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active board element */}
          <ConnectionsGame
            puzzle={activePuzzle}
            onNextLevel={handleLoadRandomPreset}
            onGameFinished={handleGameFinished}
          />
        </main>

        {/* Interactive AI theme selector module */}
        <AISelector
          onGenerate={handleGenerateAIPuzzle}
          isLoading={isAIGenerating}
        />

        {/* Dynamic compilation/operation alerts */}
        {aiError && (
          <div id="ai-error-banner" className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5 text-xs text-red-800 font-sans">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Puzzle Generation Failed</p>
              <p className="text-[11px] leading-relaxed text-red-600 mt-0.5">{aiError}</p>
            </div>
          </div>
        )}

        {/* Global Statistics Visual Modal */}
        {showStatsModal && (
          <StatsModal
            stats={stats}
            history={history}
            onClose={() => setShowStatsModal(false)}
            onResetStats={handleResetStats}
          />
        )}

        {/* Minimal styled footer */}
        <footer id="global-application-footer" className="text-center py-6 text-[10px] text-neutral-400 font-sans tracking-wide uppercase border-t border-neutral-200">
          Connections Unlimited &bull; Handcrafted dynamic board game &bull; Powered by Gemini AI
        </footer>
      </div>
    </div>
  );
}
