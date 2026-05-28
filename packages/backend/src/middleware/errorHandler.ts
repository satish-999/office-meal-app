import { Request, Response, NextFunction } from "express";
import { AppError } from "../domain/errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
