/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

// Lazy-initialized Gemini Client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in the Settings Secrets tab.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -----------------------------------------------------------------------------
  // API Endpoints
  // -----------------------------------------------------------------------------

  // API Route to verify server health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date() });
  });

  // Dynamic NYTimes Connections Board Generator
  app.post("/api/generate-puzzle", async (req, res) => {
    try {
      const { theme } = req.body;
      const requestedTheme = theme && theme.trim() ? theme.trim() : "Any creative broad theme";

      const ai = getGeminiClient();

      // Define strict response schemas for structured JSON
      const categorySchema = {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Brief, punchy association name in UPPERCASE (e.g. 'DOG BREEDS', 'THINGS WE WEAR')",
          },
          words: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 4 distinct, single-word strings (shorthand names are fine) in UPPERCASE",
          },
          level: {
            type: Type.INTEGER,
            description: "Difficulty index. 0 for Yellow (easiest), 1 for Green (medium), 2 for Blue (hard), 3 for Purple (tricky/meta)",
          },
          description: {
            type: Type.STRING,
            description: "Short sentence explaining the clever connection between the words",
          },
        },
        required: ["title", "words", "level", "description"],
      };

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A fun title for the overall puzzle",
          },
          categories: {
            type: Type.ARRAY,
            items: categorySchema,
            description: "List of exactly 4 categories. Must have exactly one of each level (0, 1, 2, 3)",
          },
        },
        required: ["title", "categories"],
      };

      const promptText = `You are a master puzzle designer for the NYTimes Connections game.
Your task is to design a mind-bending, elegant, and fully accurate Connections puzzle.

A Connections board contains exactly 16 words. These are partitioned into 4 categories of 4 words each.
The categories represent levels of increasing difficulty:
- Level 0 (Yellow): Straightforward groupings, synonyms, clear relations.
- Level 1 (Green): Medium difficulty, slightly more abstract associations or common phrases.
- Level 2 (Blue): Challenging, wordplay, slang synonyms, or double meanings.
- Level 3 (Purple): Tricky. Creative meta clues, rhymes, puns, letter patterns (anagrams, homophones), or words preceding/succeeding another word (e.g., words before "JACK" - BLACK, FLAP, LUMBER, UNION).

GUIDELINES FOR CRITICAL ACCURACY:
1. Every word MUST be completely unique. There must be NO repeated words in the grid of 16.
2. Each category MUST have exactly 4 words.
3. Every word should be in UPPERCASE. Prefer single words of 3 to 10 characters. Avoid long multi-word phrases.
4. You must output EXACTLY one category for level 0, one category for level 1, one category for level 2, and one category for level 3.
5. Sift in subtle overlaps! True Connections features words that could fit into multiple categories, but only one partition of 4x4 allows all 16 words to be resolved.

Theme to design around: ${requestedTheme}
Take your time to think carefully and generate a high-quality Connections board.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 1.0,
        },
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("Received empty response from Gemini.");
      }

      const puzzleData = JSON.parse(textOutput.trim());

      // Server-side validation, normalization and cleaning to prevent client issues
      const normalizedCategories = puzzleData.categories.map((cat: any) => {
        return {
          title: cat.title.toUpperCase().trim(),
          words: cat.words.map((w: string) => w.toUpperCase().trim().replace(/[^A-Z0-9-\s]/g, "")),
          level: Math.round(Number(cat.level)) as 0 | 1 | 2 | 3,
          description: cat.description || "",
        };
      });

      // Validations:
      // 1. Confirm exactly 4 categories
      if (normalizedCategories.length !== 4) {
        throw new Error(`Invalid category count generated: ${normalizedCategories.length}. Must be 4.`);
      }

      // 2. Validate difficulty levels (must contain exact 0, 1, 2, 3)
      const levels = normalizedCategories.map((c: any) => c.level);
      const hasAllLevels = [0, 1, 2, 3].every(lvl => levels.includes(lvl));
      if (!hasAllLevels) {
        // Force assign them 0, 1, 2, 3 chronologically to avoid crash
        normalizedCategories.forEach((cat: any, i: number) => {
           cat.level = i as 0 | 1 | 2 | 3;
        });
      }

      // 3. Confirm exactly 4 words per category and build set of all words
      const allWords: string[] = [];
      normalizedCategories.forEach((cat: any) => {
        if (cat.words.length !== 4) {
          throw new Error(`Category ${cat.title} has ${cat.words.length} words instead of 4.`);
        }
        allWords.push(...cat.words);
      });

      // 4. Validate total uniques (must be 16 distinct words)
      const uniqueWordCount = new Set(allWords).size;
      if (uniqueWordCount !== 16) {
        throw new Error(`Uniqueness violation! Found only ${uniqueWordCount} unique words out of 16.`);
      }

      // Wrap and return
      const customPuzzle = {
        id: `ai-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: puzzleData.title || `Theme: ${requestedTheme}`,
        categories: normalizedCategories,
        isCustom: true,
        theme: requestedTheme,
      };

      res.json(customPuzzle);
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({
        error: "Failed to generate custom Connections puzzle. Make sure your Gemini API key is configured correctly, or try another theme.",
        details: error.message,
      });
    }
  });

  // -----------------------------------------------------------------------------
  // Dev & Build Static File Serving
  // -----------------------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Connections server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
