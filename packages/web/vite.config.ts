import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY ?? "http://localhost:3001";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      // Allow Cloudflare tunnel / ngrok hostnames (Vite blocks unknown Host headers)
      allowedHosts: true,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
