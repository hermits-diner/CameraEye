import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// Named import: pino-http is CJS, and its default export is not callable
// under every TS module-resolution mode (e.g. Vercel builds).
import { pinoHttp } from "pino-http";
import router from "./routes";
import { attachUser } from "./lib/auth";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: { id?: unknown; method?: string; url?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: { statusCode?: number }) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", attachUser, router);

// JSON error responses (Express 5 forwards rejected async handlers here).
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    req.log?.error({ err }, "unhandled route error");
    if (res.headersSent) return;
    res.status(500).json({ message: "Internal server error" });
  },
);

export default app;
