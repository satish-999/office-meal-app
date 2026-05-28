import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

export const config = {
  port: Number(process.env.PORT ?? 3000),
  devQrSecret: process.env.DEV_QR_SECRET ?? "dev-qr-secret",
  devAuthSecret: process.env.DEV_AUTH_SECRET ?? "dev-jwt-secret",
};
