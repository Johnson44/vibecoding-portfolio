import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Each CloudBase Agent directory is built with its own absolute asset
  // prefix, so URLs work both with and without a trailing slash.
  base: process.env.VITE_DEPLOY_BASE ?? "./",
  // Keep the workspace-level .env.local as the single source of truth for
  // CloudBase deployment settings.
  envDir: "../..",
  server: { port: 5173 },
  build: { outDir: "dist" }
});
