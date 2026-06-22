import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "APP SERVICIOS ASTAP",
        short_name: "Servicios",
        description: "Sistema de informes, inspecciones y mantenimiento",
        theme_color: "#1d4ed8",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@app": path.resolve(rootDir, "src/app"),
      "@utils": path.resolve(rootDir, "src/utils"),
      "@components": path.resolve(rootDir, "src/components"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom") ||
            id.includes("scheduler") ||
            id.includes("redux") ||
            id.includes("@reduxjs") ||
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("framer-motion") ||
            id.includes("react-signature-canvas")
          ) {
            return "vendor-react";
          }

          if (id.includes("@supabase")) {
            return "vendor-supabase";
          }

          if (id.includes("html2pdf.js") || id.includes("html2canvas") || id.includes("jspdf")) {
            return "vendor-pdf";
          }

          return undefined;
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },
});
