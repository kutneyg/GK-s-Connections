/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, Award, BarChart3, TrendingUp, History, Sparkles, Check, Trash2 } from "lucide-react";
import { UserStats, PlayedGame } from "../types";

interface StatsModalProps {
  stats: UserStats;
  history: PlayedGame[];
  onClose: () => void;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, history, onClose, onResetStats }) => {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const handleResetClick = () => {
    if (window.confirm("Are you sure you want to reset all your statistics and history? This cannot be undone.")) {
      onResetStats();
    }
  };

  return (
    <div id="stats-modal-overlay" className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div id="stats-modal-content" className="bg-white rounded-2xl w-full max-w-lg border border-neutral-200 overflow-hidden shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neutral-800" />
            <h2 className="text-lg font-bold text-neutral-900 font-sans">Player Statistics & History</h2>
          </div>
          <button
            id="close-stats-btn"
            onClick={onClose}
            className="p-1 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-center">
              <span className="text-2xl lg:text-3xl font-bold text-neutral-900 block font-sans">{stats.gamesPlayed}</span>
              <span className="text-xs text-neutral-500 font-sans">Played</span>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-center">
              <span className="text-2xl lg:text-3xl font-bold text-neutral-900 block font-sans">{winRate}%</span>
              <span className="text-xs text-neutral-500 font-sans">Win Rate</span>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-center flex flex-col justify-center items-center">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-lg lg:text-xl font-bold text-neutral-900 font-sans">{stats.currentStreak}</span>
              </div>
              <span className="text-xs text-neutral-500 font-sans">Current Streak</span>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-center flex flex-col justify-center items-center">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-lg lg:text-xl font-bold text-neutral-900 font-sans">{stats.maxStreak}</span>
              </div>
              <span className="text-xs text-neutral-500 font-sans">Max Streak</span>
            </div>
          </div>

          {/* Perfect Games */}
          {stats.perfectGames > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-amber-900 tracking-wider uppercase font-sans">Perfect Clears</h4>
                <p className="text-sm text-amber-800 font-sans font-medium">You’ve completed <span className="font-bold">{stats.perfectGames}</span> {stats.perfectGames === 1 ? "game" : "games"} with zero mistakes!</p>
              </div>
            </div>
          )}

          {/* Categories Solved Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-neutral-400 tracking-wider uppercase font-sans">Categories Cleared</h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Yellow: Straightforward */}
              <div className="flex items-center justify-between p-3 bg-[#f9df6d]/10 border border-[#f9df6d]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#f9df6d] rounded-full"></span>
                  <span className="text-xs text-neutral-700 font-medium font-sans">Yellow (Easy)</span>
                </div>
                <span className="text-xs font-bold font-mono text-neutral-900">{stats.categorySolved.yellow}</span>
              </div>

              {/* Green: Medium */}
              <div className="flex items-center justify-between p-3 bg-[#a0c35a]/10 border border-[#a0c35a]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#a0c35a] rounded-full"></span>
                  <span className="text-xs text-neutral-700 font-medium font-sans">Green (Medium)</span>
                </div>
                <span className="text-xs font-bold font-mono text-neutral-900">{stats.categorySolved.green}</span>
              </div>

              {/* Blue: Hard */}
              <div className="flex items-center justify-between p-3 bg-[#b0c4ef]/10 border border-[#b0c4ef]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#b0c4ef] rounded-full"></span>
                  <span className="text-xs text-neutral-700 font-medium font-sans">Blue (Hard)</span>
                </div>
                <span className="text-xs font-bold font-mono text-neutral-900">{stats.categorySolved.blue}</span>
              </div>

              {/* Purple: Tricky */}
              <div className="flex items-center justify-between p-3 bg-[#ba7ec8]/10 border border-[#ba7ec8]/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#ba7ec8] rounded-full"></span>
                  <span className="text-xs text-neutral-700 font-medium font-sans">Purple (Tricky)</span>
                </div>
                <span className="text-xs font-bold font-mono text-neutral-900">{stats.categorySolved.purple}</span>
              </div>
            </div>
          </div>

          {/* Past History Logs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-neutral-400 tracking-wider uppercase font-sans flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Recent Games
              </h4>
              <span className="text-[10px] text-neutral-400 font-sans">{history.length} games logged</span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-neutral-400 italic font-sans text-center py-4 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                Play a game to log stats here!
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {history.map((game, i) => (
                  <div
                    key={game.id || i}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-neutral-800">{game.puzzleTitle}</span>
                        {game.isCustom && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-sm font-semibold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-sans uppercase">
                        {game.theme ? `Theme: ${game.theme} • ` : ""}
                        {new Date(game.datePlayed).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      {game.won ? (
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Win
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-sm">
                          Loss
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
          <button
            id="reset-all-stats-btn"
            onClick={handleResetClick}
            className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset All Data
          </button>
          <button
            id="dismiss-stats-btn"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
