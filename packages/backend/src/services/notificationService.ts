import { config } from "../config";

async function sendViaBrevo(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": config.brevoApiKey!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: config.emailFrom!, name: config.emailFromName },
      to: [{ email: to }],
      subject,
      textContent: body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo email failed (${res.status}): ${err}`);
  }
}

export const notificationService = {
  isEmailConfigured(): boolean {
    return Boolean(config.brevoApiKey && config.emailFrom);
  },

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    if (this.isEmailConfigured()) {
      await sendViaBrevo(to, subject, body);
      console.log("[EMAIL SENT]", { to, subject });
      return;
    }
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
