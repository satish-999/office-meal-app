import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { reportService } from "../services/reportService";
import { feedbackService } from "../services/feedbackService";
import { escalationService } from "../services/escalationService";
import { bookingRepo } from "../repositories/memory";

export const adminRouter = Router();

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
    const bookings = await bookingRepo.findByDate(date);
    res.json({ date, bookings });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/feedback", async (req, res, next) => {
  try {
    const date =
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const feedback = await feedbackService.listByDate(date);
    res.json({ date, feedback });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/jobs/no-shows", async (req, res, next) => {
  try {
    const date =
      (req.body?.date as string) ?? new Date().toISOString().slice(0, 10);
    const result = await escalationService.processNoShowsForDate(date);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
