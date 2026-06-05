/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import generatePuzzleHandler from "./api/generate-puzzle";

dotenv.config();

const PORT = 3000;

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
  app.post("/api/generate-puzzle", generatePuzzleHandler);

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
