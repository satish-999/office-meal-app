import { createApp } from "./app";
import { config } from "./config";
import { seedIfEmpty } from "./seed";

async function main() {
  await seedIfEmpty();
  const app = createApp();
  app.listen(config.port, "0.0.0.0", () => {
    const base = `http://localhost:${config.port}`;
    console.log(`Office Meal API running at ${base}`);
    console.log(`Health: ${base}/health`);
    if (process.env.NODE_ENV === "production") {
      console.log("Production mode: web UI served from same URL (open / in browser)");
    } else {
      console.log(`Dev web UI: npm run dev:web → http://localhost:5173`);
    }
  });
}

main().catch(console.error);
