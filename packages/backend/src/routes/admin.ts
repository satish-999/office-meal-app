import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireAdminOrCron } from "../middleware/requireAdminOrCron";
import { reportService } from "../services/reportService";
import { escalationService } from "../services/escalationService";
import { adminService } from "../services/adminService";
import { scheduleService } from "../services/scheduleService";
import { employeeImportService } from "../services/employeeImportService";
import { z } from "zod";

export const adminRouter = Router();

adminRouter.post("/jobs/no-shows", requireAdminOrCron, async (req, res, next) => {
  try {
    const date =
      (req.body?.date as string) ?? new Date().toISOString().slice(0, 10);
    const result = await escalationService.processNoShowsForDate(date);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

adminRouter.use(requireAuth("admin"));

adminRouter.get("/reports/daily", async (req, res, next) => {
  try {
    const date =
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const report = await reportService.dailyReport(date);
    res.json({ date, meals: report });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/bookings", async (req, res, next) => {
  try {
    const date =
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const bookings = await adminService.listBookingsWithEmployees(date);
    res.json({ date, bookings });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/feedback", async (req, res, next) => {
  try {
    const date =
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const feedback = await adminService.listFeedbackWithEmployees(date);
    res.json({ date, feedback });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/employees", async (_req, res, next) => {
  try {
    const employees = await employeeImportService.listAll();
    res.json({ employees });
  } catch (e) {
    next(e);
  }
});

const importSchema = z.object({
  csv: z.string().min(1),
});

adminRouter.post("/employees/import", async (req, res, next) => {
  try {
    const { csv } = importSchema.parse(req.body);
    const result = await employeeImportService.importCsv(csv);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/schedules", async (req, res, next) => {
  try {
    const date =
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const schedules = await scheduleService.listByDate(date);
    res.json({ date, schedules });
  } catch (e) {
    next(e);
  }
});

const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(["breakfast", "lunch", "dinner"]),
  menuVeg: z.string().optional(),
  menuNonVeg: z.string().optional(),
  menuVegItems: z.array(z.string().min(1)).optional(),
  menuNonVegItems: z.array(z.string().min(1)).optional(),
  cutoffAt: z.string().min(1),
  capacity: z.number().int().min(1).max(10000),
  active: z.boolean().optional(),
});

adminRouter.post("/schedules", async (req, res, next) => {
  try {
    const input = scheduleSchema.parse(req.body);
    const schedule = await scheduleService.upsert(input);
    res.status(201).json(schedule);
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/schedules/:id", async (req, res, next) => {
  try {
    const input = scheduleSchema.parse(req.body);
    const schedule = await scheduleService.upsert(input);
    res.json(schedule);
  } catch (e) {
    next(e);
  }
});

adminRouter.delete("/schedules/:id", async (req, res, next) => {
  try {
    const result = await scheduleService.remove(req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
