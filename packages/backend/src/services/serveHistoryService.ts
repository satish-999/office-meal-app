import { employeeRepo, serveRepo } from "../repositories/memory";

export const serveHistoryService = {
  async listManualServes(date: string) {
    const events = await serveRepo.findManualByDate(date);
    const rows = [];

    for (const event of events) {
      const employee = await employeeRepo.findById(event.employeeId);
      rows.push({
        id: event.id,
        employeeCode: employee?.employeeCode ?? "—",
        employeeName: employee?.name ?? "Unknown",
        employeeEmail: employee?.email ?? "—",
        date: event.date,
        mealType: event.mealType,
        dietType: event.dietType,
        servedAt: event.servedAt,
        manualReason: event.manualReason,
        counterId: event.counterId,
      });
    }

    return rows.sort(
      (a, b) => new Date(b.servedAt).getTime() - new Date(a.servedAt).getTime()
    );
  },
};
