import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { serveService } from "../services/serveService";
import { serveHistoryService } from "../services/serveHistoryService";

export const serverRouter = Router();

serverRouter.use(requireAuth("server", "admin"));

const scanSchema = z.object({
  qrToken: z.string().min(1),
  counterId: z.string().optional(),
});

serverRouter.post("/scan", async (req, res, next) => {
  try {
    const body = scanSchema.parse(req.body);
    const result = await serveService.scanAndServe(
      body.qrToken,
      req.user!.id,
      body.counterId
    );
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

const manualSchema = z.object({
  employeeCode: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(["breakfast", "lunch", "dinner"]),
  dietType: z.enum(["veg", "non_veg"]),
  reason: z.string().min(3),
  counterId: z.string().optional(),
});

serverRouter.post("/manual-serve", async (req, res, next) => {
  try {
    const body = manualSchema.parse(req.body);
    const result = await serveService.manualServe(body, req.user!.id);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
});

serverRouter.get("/manual-history", async (req, res, next) => {
  try {
    const date =
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const history = await serveHistoryService.listManualServes(date);
    res.json({ date, history });
  } catch (e) {
    next(e);
  }
});
