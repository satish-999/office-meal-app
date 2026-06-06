import { initPool } from "../db/pool";
import { runMigrations } from "../db/migrate";
import type {
  BookingRepository,
  EmployeeRepository,
  EscalationRepository,
  FeedbackRepository,
  MealScheduleRepository,
  ServeEventRepository,
} from "./interfaces";
import * as memory from "./memory";
import { createPostgresRepos } from "./postgres";

export type StorageMode = "memory" | "postgres";

let storageMode: StorageMode = "memory";

export let employeeRepo: EmployeeRepository = memory.employeeRepo;
export let scheduleRepo: MealScheduleRepository = memory.scheduleRepo;
export let bookingRepo: BookingRepository = memory.bookingRepo;
export let serveRepo: ServeEventRepository = memory.serveRepo;
export let feedbackRepo: FeedbackRepository = memory.feedbackRepo;
export let escalationRepo: EscalationRepository = memory.escalationRepo;

export function getStorageMode(): StorageMode {
  return storageMode;
}

export async function initRepositories(): Promise<StorageMode> {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const pool = initPool(url);
    await runMigrations();
    const repos = createPostgresRepos(pool);
    employeeRepo = repos.employeeRepo;
    scheduleRepo = repos.scheduleRepo;
    bookingRepo = repos.bookingRepo;
    serveRepo = repos.serveRepo;
    feedbackRepo = repos.feedbackRepo;
    escalationRepo = repos.escalationRepo;
    storageMode = "postgres";
    console.log("Storage: PostgreSQL");
    return storageMode;
  }

  employeeRepo = memory.employeeRepo;
  scheduleRepo = memory.scheduleRepo;
  bookingRepo = memory.bookingRepo;
  serveRepo = memory.serveRepo;
  feedbackRepo = memory.feedbackRepo;
  escalationRepo = memory.escalationRepo;
  storageMode = "memory";
  console.log("Storage: in-memory (set DATABASE_URL for PostgreSQL)");
  return storageMode;
}
