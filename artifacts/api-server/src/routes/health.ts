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
  // Only ever echo a parsed hostname — raw values can contain credentials
  // in unexpected places when the env var is malformed.
  const raw = process.env.DATABASE_URL ?? "";
  let maskedHost: string;
  if (!raw) {
    maskedHost = "(DATABASE_URL not set)";
  } else {
    try {
      const parsed = new URL(raw);
      maskedHost = `${parsed.hostname}:${parsed.port || "5432"}`;
    } catch {
      maskedHost =
        "(unparseable DATABASE_URL — check for duplicated paste, brackets or special characters in the password)";
    }
  }
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
