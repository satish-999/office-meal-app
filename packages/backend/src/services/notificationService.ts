/** Mock notifications — logs to console; swap for SendGrid/Teams later */

export const notificationService = {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log("[MOCK EMAIL]", { to, subject, body });
  },

  async sendNoShowWarning(
    email: string,
    name: string,
    mealType: string,
    date: string
  ): Promise<void> {
    await this.sendEmail(
      email,
      `Meal no-show: ${mealType} on ${date}`,
      `Hi ${name}, you registered for ${mealType} on ${date} but did not collect your meal. Please cancel before cutoff if you cannot attend.`
    );
  },

  async sendEscalation(
    email: string,
    name: string,
    level: number
  ): Promise<void> {
    await this.sendEmail(
      email,
      `Meal registration warning (Level ${level})`,
      `Hi ${name}, you have repeated meal no-shows. Please register only when you plan to eat.`
    );
  },
};
