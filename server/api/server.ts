// api/server.ts — Vercel serverless wrapper for the existing Express app
// This file re-exports the handler exported by `server/index.ts` so Vercel
// can use it as a serverless function.

import handler from "..";

// Export as `any` to avoid strict type issues in the serverless environment.
const vercelHandler: any = handler
export default vercelHandler;
