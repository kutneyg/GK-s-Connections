/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

interface AISelectorProps {
  onGenerate: (theme: string) => Promise<void>;
  isLoading: boolean;
}

const THEME_SUGGESTIONS = [
  "Gaming",
  "Harry Potter",
  "90s Retro",
  "Cooking",
  "Outer Space",
  "Animals",
  "Programming",
  "Music Genres"
];

export const AISelector: React.FC<AISelectorProps> = ({ onGenerate, isLoading }) => {
  const [inputTheme, setInputTheme] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const theme = inputTheme.trim() ? inputTheme.trim() : "Surprise Me";
    try {
      await onGenerate(theme);
      setInputTheme("");
    } catch (err: any) {
      setError(err.message || "Failed to generate. Please try again.");
    }
  };

  const handleSuggestClick = async (suggestion: string) => {
    if (isLoading) return;
    setError(null);
    try {
      await onGenerate(suggestion);
    } catch (err: any) {
      setError(err.message || "Failed to generate.");
    }
  };

  return (
    <div id="ai-selector-module" className="bg-white rounded-2xl border border-[#E2E2E2] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#121212] text-white rounded-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[#121212] text-base tracking-tight">Infinite AI Grid Builder</h3>
          <p className="text-xs text-[#787878]">Command Gemini to craft an intricate association board on any theme</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="theme-prompt-input"
            type="text"
            placeholder="Type a theme (e.g. Marvel, Slang, Cooking, Coding...)"
            value={inputTheme}
            onChange={(e) => setInputTheme(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs bg-[#F5F5F5] border border-[#E2E2E2] rounded-xl focus:outline-hidden focus:border-[#787878] focus:bg-white text-[#121212] placeholder-[#787878] font-sans font-semibold disabled:opacity-60"
          />
          <button
            id="generate-btn"
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 text-xs font-bold bg-[#121212] border border-[#121212] hover:bg-black text-white rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Crafting Grid...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Generate Board
              </>
            )}
          </button>
        </div>

        {error && (
          <p id="generation-error-msg" className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-sans">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#787878] tracking-widest uppercase font-sans">Popular Suggestions</span>
          <div className="flex flex-wrap gap-1.5">
            {THEME_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                id={`suggest-${suggestion.toLowerCase().replace(/\s+/g, "-")}`}
                type="button"
                disabled={isLoading}
                onClick={() => handleSuggestClick(suggestion)}
                className="px-3 py-1 text-xs border border-[#E2E2E2] text-[#121212] bg-[#F5F5F5] hover:bg-[#EFEFEF] font-sans font-semibold rounded-lg cursor-pointer transition-all disabled:opacity-55"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
