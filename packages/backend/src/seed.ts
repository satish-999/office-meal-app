import { v4 as uuid } from "uuid";
import type { Employee, MealSchedule } from "@office-meal/shared";
import { employeeRepo, scheduleRepo } from "./repositories";

function tomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEMO_EMPLOYEES: Omit<Employee, "id">[] = [
  {
    employeeCode: "EMP001",
    name: "Priya Sharma",
    email: "priya@company.com",
    department: "Engineering",
    defaultDiet: "veg",
    role: "employee",
    active: true,
  },
  {
    employeeCode: "EMP002",
    name: "Rahul Mehta",
    email: "rahul@company.com",
    department: "HR",
    defaultDiet: "non_veg",
    role: "employee",
    active: true,
  },
  {
    employeeCode: "SRV001",
    name: "Cafeteria Server",
    email: "server@company.com",
    department: "Facilities",
    defaultDiet: "veg",
    role: "server",
    active: true,
  },
  {
    employeeCode: "ADM001",
    name: "Cafeteria Admin",
    email: "admin@company.com",
    department: "Facilities",
    defaultDiet: "veg",
    role: "admin",
    active: true,
  },
];

const MEAL_SEED_ITEMS: Record<
  "breakfast" | "lunch" | "dinner",
  { veg: string[]; nonVeg: string[] }
> = {
  breakfast: {
    veg: ["Idli", "Vada", "Sambar", "Coconut chutney", "Tea"],
    nonVeg: ["Egg dosa", "Chicken sandwich", "Tea"],
  },
  lunch: {
    veg: ["Rice", "Sambar", "Dal", "Mixed veg curry", "Curd", "Pickle", "Papad"],
    nonVeg: ["Rice", "Chicken curry", "Dal", "Curd", "Pickle", "Papad"],
  },
  dinner: {
    veg: ["Rice", "Sambar", "Dal", "Vegetable curry", "Curd", "Salad"],
    nonVeg: ["Rice", "Fish curry", "Dal", "Curd", "Salad"],
  },
};

function cutoffTomorrow(hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export async function seedIfEmpty(): Promise<void> {
  const existing = await employeeRepo.list();
  if (existing.length > 0) return;

  console.log("Seeding demo data...");

  for (const e of DEMO_EMPLOYEES) {
    await employeeRepo.save({ ...e, id: uuid() });
  }

  const date = tomorrowDate();
  const meals = ["breakfast", "lunch", "dinner"] as const;
  const cutoffs = { breakfast: 6, lunch: 10, dinner: 16 };

  for (const mealType of meals) {
    const items = MEAL_SEED_ITEMS[mealType];
    const schedule: MealSchedule = {
      id: uuid(),
      date,
      mealType,
      menuVegItems: items.veg,
      menuNonVegItems: items.nonVeg,
      menuVeg: items.veg.join(", "),
      menuNonVeg: items.nonVeg.join(", "),
      cutoffAt: cutoffTomorrow(cutoffs[mealType]),
      capacity: 500,
      active: true,
    };
    await scheduleRepo.save(schedule);
  }

  console.log(`Seeded employees + schedules for ${date}`);
}

if (require.main === module) {
  import("./repositories").then(async ({ initRepositories }) => {
    await initRepositories();
    await seedIfEmpty();
    console.log("Seed complete.");
    process.exit(0);
  });
}
