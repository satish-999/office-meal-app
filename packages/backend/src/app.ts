import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { authRouter } from "./routes/auth";import { employeeRouter } from "./routes/employee";
import { serverRouter } from "./routes/server";
import { adminRouter } from "./routes/admin";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      mode: process.env.NODE_ENV === "production" ? "production" : "local-in-memory",
      message:
        process.env.NODE_ENV === "production"
          ? "Office Meal App"
          : "Integrations (Postgres, SSO, email) not connected yet",
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/employee", employeeRouter);
  app.use("/api/server", serverRouter);
  app.use("/api/admin", adminRouter);

  const isProd = process.env.NODE_ENV === "production";
  const webDist = path.resolve(__dirname, "../../web/dist");

  if (isProd && fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(webDist, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.json({
        name: "Office Meal API",
        status: "running",
        health: "/health",
        ui: "npm run dev:web → http://localhost:5173",
        deploy: "See docs/DEPLOY.md for permanent hosting",
      });
    });
  }

  app.use(errorHandler);
  return app;
}