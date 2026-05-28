import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { employeeRouter } from "./routes/employee";
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
      mode: "local-in-memory",
      message: "Integrations (Postgres, SSO, email) not connected yet",
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/employee", employeeRouter);
  app.use("/api/server", serverRouter);
  app.use("/api/admin", adminRouter);

  app.use(errorHandler);
  return app;
}
