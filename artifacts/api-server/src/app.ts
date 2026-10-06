import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const corsOrigins = process.env.CORS_ORIGIN
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins?.length ? corsOrigins : false, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use(
  (error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.log.error({ err: error }, "Unhandled API error");
    if (res.headersSent) {
      next(error);
      return;
    }
    res.status(500).json({ error: "The request could not be completed. Please try again." });
  },
);

export default app;
