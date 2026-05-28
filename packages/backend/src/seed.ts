import { v4 as uuid } from "uuid";
import type { Employee, MealSchedule } from "@office-meal/shared";
import { memoryStore } from "./repositories/memory/store";
import { employeeRepo, scheduleRepo } from "./repositories/memory";

function tomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function cutoffTomorrow(hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const DEMO_EMPLOYEES: Omit<Employee, "id">[] = [
  {
    employeeCode: "EMP001",
    name: "Priya Sharma",
    email: "priya@company.com",
    department: "Engineering",
    defaultDiet: "veg",
    active: true,
  },
  {
    employeeCode: "EMP002",
    name: "Rahul Mehta",
    email: "rahul@company.com",
    department: "HR",
    defaultDiet: "non_veg",
    active: true,
  },
  {
    employeeCode: "SRV001",
    name: "Cafeteria Server",
    email: "server@company.com",
    department: "Facilities",
    defaultDiet: "veg",
    active: true,
  },
  {
    employeeCode: "ADM001",
    name: "Cafeteria Admin",
    email: "admin@company.com",
    department: "Facilities",
    defaultDiet: "veg",
    active: true,
  },
];

export async function seedIfEmpty(): Promise<void> {
  if (memoryStore.employees.size > 0) return;

  console.log("Seeding demo data (in-memory)...");

  for (const e of DEMO_EMPLOYEES) {
    await employeeRepo.save({ ...e, id: uuid() });
  }

  const date = tomorrowDate();
  const meals = ["breakfast", "lunch", "dinner"] as const;
  const cutoffs = { breakfast: 6, lunch: 10, dinner: 16 };

  for (const mealType of meals) {
    const schedule: MealSchedule = {
      id: uuid(),
      date,
      mealType,
      menuVeg: `Veg ${mealType} special`,
      menuNonVeg: `Non-veg ${mealType} special`,
      cutoffAt: cutoffTomorrow(cutoffs[mealType]),
      capacity: 500,
      active: true,
    };
    await scheduleRepo.save(schedule);
  }

  console.log(`Seeded employees + schedules for ${date}`);
}

if (require.main === module) {
  seedIfEmpty().then(() => {
    console.log("Seed complete.");
    process.exit(0);
  });
}
