import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { bookingService } from "../services/bookingService";
import { qrService } from "../services/qrService";
import { feedbackService } from "../services/feedbackService";
import { scheduleRepo, bookingRepo } from "../repositories/memory";
import { AppError } from "../domain/errors";

export const employeeRouter = Router();

employeeRouter.use(requireAuth("employee", "admin"));

employeeRouter.get("/schedules", async (req, res, next) => {
  try {
    const date =
      (req.query.date as string) ?? new Date().toISOString().slice(0, 10);
    const schedules = (await scheduleRepo.listByDate(date)).filter(
      (s) => s.active
    );
    res.json({ date, schedules });
  } catch (e) {
    next(e);
  }
});

const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(["breakfast", "lunch", "dinner"]),
  dietType: z.enum(["veg", "non_veg"]),
});

employeeRouter.post("/bookings", async (req, res, next) => {
  try {
    const input = bookingSchema.parse(req.body);
    const booking = await bookingService.createBooking(req.user!.id, input);
    res.status(201).json(booking);
  } catch (e) {
    next(e);
  }
});

employeeRouter.get("/bookings", async (req, res, next) => {
  try {
    const date = req.query.date as string | undefined;
    const bookings = await bookingService.listMyBookings(req.user!.id, date);
    res.json({ bookings });
  } catch (e) {
    next(e);
  }
});

employeeRouter.delete("/bookings/:id", async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(
      req.user!.id,
      req.params.id
    );
    res.json(booking);
  } catch (e) {
    next(e);
  }
});

employeeRouter.get("/bookings/:id/qr", async (req, res, next) => {
  try {
    const booking = await bookingRepo.findById(req.params.id);
    if (!booking || booking.employeeId !== req.user!.id) {
      throw new AppError("Booking not found", 404);
    }
    const qrToken = qrService.createToken(booking);
    res.json({
      bookingId: booking.id,
      mealType: booking.mealType,
      dietType: booking.dietType,
      dietLabel: booking.dietType === "veg" ? "VEGETARIAN" : "NON-VEGETARIAN",
      qrToken,
    });
  } catch (e) {
    next(e);
  }
});

const feedbackSchema = z.object({
  date: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner"]),
  dietType: z.enum(["veg", "non_veg"]),
  rating: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
  comment: z.string().optional(),
  facilityNotes: z.string().optional(),
});

employeeRouter.get("/feedback", async (req, res, next) => {
  try {
    const feedback = await feedbackService.listMine(req.user!.id);
    res.json({ feedback });
  } catch (e) {
    next(e);
  }
});

employeeRouter.post("/feedback", async (req, res, next) => {
  try {
    const input = feedbackSchema.parse(req.body);
    const feedback = await feedbackService.submit({
      employeeId: req.user!.id,
      ...input,
    });
    res.status(201).json(feedback);
  } catch (e) {
    next(e);
  }
});

const feedbackUpdateSchema = z.object({
  rating: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
  comment: z.string().optional(),
  facilityNotes: z.string().optional(),
});

employeeRouter.put("/feedback/:id", async (req, res, next) => {
  try {
    const input = feedbackUpdateSchema.parse(req.body);
    const feedback = await feedbackService.update(
      req.params.id,
      req.user!.id,
      input
    );
    res.json(feedback);
  } catch (e) {
    next(e);
  }
});
