import { createApp } from "./app";
import { config } from "./config";
import { seedIfEmpty } from "./seed";

async function main() {
  await seedIfEmpty();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Office Meal API running at http://localhost:${config.port}`);
    console.log(`Health: http://localhost:${config.port}/health`);
  });
}

main().catch(console.error);
