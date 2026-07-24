// Serverless entry: exports the Express app without binding a port.
// Vercel's Node runtime invokes the exported app per request
// (api/index.mjs at the repo root imports the bundled output of this file).
import app from "./app";

export default app;
