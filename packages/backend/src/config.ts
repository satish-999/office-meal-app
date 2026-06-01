import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(__dirname, "../../../.env"),
];

const envPath = envCandidates.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  devQrSecret: process.env.DEV_QR_SECRET ?? "dev-qr-secret",
  devAuthSecret: process.env.DEV_AUTH_SECRET ?? "dev-jwt-secret",
  envFile: envPath ?? "(default)",
};
