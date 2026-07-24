import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/**
 * DB connectivity check. Reports the configured host (credentials masked)
 * and the raw connection error message so misconfigured DATABASE_URL
 * values (wrong pooler, IPv6-only direct host, bad password) are
 * diagnosable from a browser.
 */
router.get("/healthz/db", async (_req, res) => {
  const raw = process.env.DATABASE_URL ?? "";
  const maskedHost = raw
    .replace(/\/\/[^@/]*@/, "//***:***@")
    .split("?")[0];
  try {
    await db.execute(sql`select 1`);
    res.json({ ok: true, host: maskedHost });
  } catch (err) {
    res.status(500).json({
      ok: false,
      host: maskedHost,
      error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
    });
  }
});

export default router;
