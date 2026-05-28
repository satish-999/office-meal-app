import jwt from "jsonwebtoken";
import { config } from "../config";
import type { Booking } from "@office-meal/shared";
import { AppError } from "../domain/errors";

export interface QrPayload {
  bookingId: string;
  employeeId: string;
  date: string;
  mealType: string;
  dietType: string;
}

export const qrService = {
  createToken(booking: Booking): string {
    if (booking.status !== "booked") {
      throw new AppError("QR only available for active bookings", 400);
    }
    const payload: QrPayload = {
      bookingId: booking.id,
      employeeId: booking.employeeId,
      date: booking.date,
      mealType: booking.mealType,
      dietType: booking.dietType,
    };
    return jwt.sign(payload, config.devQrSecret, { expiresIn: "48h" });
  },

  verifyToken(token: string): QrPayload {
    try {
      return jwt.verify(token, config.devQrSecret) as QrPayload;
    } catch {
      throw new AppError("Invalid or expired QR code", 401, "INVALID_QR");
    }
  },
};
