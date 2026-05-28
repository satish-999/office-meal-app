import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { employeeRepo } from "../repositories/memory";
import { AppError } from "../domain/errors";

export const authRouter = Router();

const loginSchema = z.object({
  employeeCode: z.string().min(1),
  role: z.enum(["employee", "server", "admin"]).default("employee"),
});

/** Dev-only login — replace with Azure AD / SSO later */
authRouter.post("/dev-login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const employee = await employeeRepo.findByCode(body.employeeCode);
    if (!employee) {
      throw new AppError("Unknown employee code", 404);
    }
    const token = jwt.sign(
      { id: employee.id, role: body.role, employeeCode: employee.employeeCode },
      config.devAuthSecret,
      { expiresIn: "12h" }
    );
    res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: body.role,
        defaultDiet: employee.defaultDiet,
      },
    });
  } catch (e) {
    next(e);
  }
});
