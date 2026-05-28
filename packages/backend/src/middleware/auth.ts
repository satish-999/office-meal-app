import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import type { Role } from "@office-meal/shared";
import { AppError } from "../domain/errors";

export interface AuthUser {
  id: string;
  role: Role;
  employeeCode?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized", 401));
    }
    try {
      const token = header.slice(7);
      const user = jwt.verify(token, config.devAuthSecret) as AuthUser;
      if (roles.length && !roles.includes(user.role)) {
        return next(new AppError("Forbidden", 403));
      }
      req.user = user;
      next();
    } catch {
      next(new AppError("Invalid token", 401));
    }
  };
}
