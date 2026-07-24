// Vercel Function entry: serves every /api/* request with the bundled
// Express app. The bundle is produced by the buildCommand in vercel.json
// (pnpm --filter @workspace/api-server run build) before functions are
// packaged, so dist/serverless.mjs exists at trace time.
import app from "../artifacts/api-server/dist/serverless.mjs";

export default app;
