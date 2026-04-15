import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Security: trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

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

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Security: restrict CORS to frontend origin only
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ credentials: true, origin: allowedOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hasClerkKeys = Boolean(
  process.env.CLERK_SECRET_KEY &&
    !process.env.CLERK_SECRET_KEY.includes("PLACEHOLDER") &&
    process.env.VITE_CLERK_PUBLISHABLE_KEY &&
    !process.env.VITE_CLERK_PUBLISHABLE_KEY.includes("PLACEHOLDER") &&
    process.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith("pk_"),
);

if (hasClerkKeys) {
  app.use(clerkMiddleware());
}

app.use("/api", router);

export default app;
