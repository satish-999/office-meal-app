import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { employeeRepo } from "../repositories";
import { AppError } from "../domain/errors";

export const authRouter = Router();

const loginSchema = z.object({
  employeeCode: z.string().min(1),
});

/** Dev login — role comes from employee record, not client */
authRouter.post("/dev-login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const employee = await employeeRepo.findByCode(
      body.employeeCode.trim().toUpperCase()
    );
    if (!employee) {
      throw new AppError("Unknown employee code", 404);
    }
    if (!employee.active) {
      throw new AppError("Account inactive", 403);
    }
    const role = employee.role;
    const token = jwt.sign(
      { id: employee.id, role, employeeCode: employee.employeeCode },
      config.devAuthSecret,
      { expiresIn: "12h" }
    );
    res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role,
        defaultDiet: employee.defaultDiet,
      },
    });
  } catch (e) {
    next(e);
  }
});
