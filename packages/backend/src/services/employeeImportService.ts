import { v4 as uuid } from "uuid";
import type { DietType, Employee, Role } from "@office-meal/shared";
import { AppError } from "../domain/errors";
import { employeeRepo } from "../repositories";

const HEADER_ALIASES: Record<string, string> = {
  employeecode: "employeeCode",
  employee_code: "employeeCode",
  code: "employeeCode",
  name: "name",
  email: "email",
  department: "department",
  defaultdiet: "defaultDiet",
  default_diet: "defaultDiet",
  diet: "defaultDiet",
  role: "role",
  active: "active",
};

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      const key = HEADER_ALIASES[h] ?? h;
      row[key] = values[i] ?? "";
    });
    return row;
  });
}

function parseRole(value: string): Role {
  const v = value.toLowerCase();
  if (v === "employee" || v === "server" || v === "admin") return v;
  throw new AppError(`Invalid role "${value}" — use employee, server, or admin`, 400);
}

function parseDiet(value: string): DietType {
  const v = value.toLowerCase().replace("-", "_");
  if (v === "veg" || v === "vegetarian") return "veg";
  if (v === "non_veg" || v === "nonveg" || v === "non-veg") return "non_veg";
  throw new AppError(`Invalid defaultDiet "${value}" — use veg or non_veg`, 400);
}

function parseActive(value: string | undefined): boolean {
  if (!value) return true;
  const v = value.toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "y";
}

export const employeeImportService = {
  async importCsv(csvText: string): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      throw new AppError("CSV is empty or missing data rows", 400);
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const line = i + 2;
      try {
        const code = (row.employeeCode ?? "").trim().toUpperCase();
        const name = (row.name ?? "").trim();
        const email = (row.email ?? "").trim();
        const department = (row.department ?? "").trim() || "—";

        if (!code || !name || !email) {
          throw new Error("employeeCode, name, and email are required");
        }

        const employee: Employee = {
          id: (await employeeRepo.findByCode(code))?.id ?? uuid(),
          employeeCode: code,
          name,
          email,
          department,
          defaultDiet: parseDiet(row.defaultDiet ?? "veg"),
          role: parseRole(row.role ?? "employee"),
          active: parseActive(row.active),
        };

        const existed = Boolean(await employeeRepo.findByCode(code));
        await employeeRepo.save(employee);
        if (existed) updated++;
        else created++;
      } catch (e) {
        errors.push(
          `Line ${line}: ${e instanceof Error ? e.message : "Invalid row"}`
        );
      }
    }

    return { created, updated, errors };
  },

  async listAll(): Promise<Employee[]> {
    const list = await employeeRepo.list();
    return list.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
  },
};
