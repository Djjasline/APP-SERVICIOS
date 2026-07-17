import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
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

          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }

          if (id.includes("framer-motion")) {
            return "vendor-motion";
          }

          if (id.includes("react-signature-canvas")) {
            return "vendor-signature";
          }

          if (id.includes("@radix-ui")) {
            return "vendor-ui";
          }

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom") ||
            id.includes("scheduler") ||
            id.includes("redux") ||
            id.includes("@reduxjs")
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
