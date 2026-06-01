/** Local calendar date YYYY-MM-DD (avoids UTC shift from toISOString). */
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function tomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
}

/** For HTML datetime-local input from ISO string */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function defaultMealCutoffLocal(date: string, hour: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(hour, 0, 0, 0);
  return toDatetimeLocalValue(d.toISOString());
}

export function isBeforeCutoff(cutoffAt: string): boolean {
  return new Date() < new Date(cutoffAt);
}
