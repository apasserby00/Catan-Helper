import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/Catan-Clock/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["catan-clock-logo.png"],
      manifest: {
        name: "Catan Clock",
        short_name: "Catan",
        description: "A simple Catan timer with music, turn reminders, and history.",
        theme_color: "#e8d7b9",
        background_color: "#f4ecdb",
        display: "standalone",
        start_url: "/Catan-Clock/",
        icons: [
          {
            src: "catan-clock-logo.png",
            sizes: "1024x1024",
            type: "image/png"
          },
          {
            src: "catan-clock-logo.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true
  }
}));
