import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { requireAuth } from "./auth";

/** Admin JWT or X-Cron-Secret header (for GitHub Actions nightly job). */
export function requireAdminOrCron(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cronHeader = req.headers["x-cron-secret"];
  if (
    config.cronSecret &&
    typeof cronHeader === "string" &&
    cronHeader === config.cronSecret
  ) {
    return next();
  }
  return requireAuth("admin")(req, res, next);
}
