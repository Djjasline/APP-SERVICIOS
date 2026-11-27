import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import viteConfig from "../vite.config.mjs";

test("las bibliotecas PDF no se fuerzan a un paquete compartido con el inicio", () => {
  const manualChunks = viteConfig.build.rollupOptions.output.manualChunks;
  assert.equal(manualChunks("/app/node_modules/jspdf/dist/jspdf.es.min.js"), undefined);
  assert.equal(manualChunks("/app/node_modules/html2canvas/dist/html2canvas.esm.js"), undefined);
  assert.equal(manualChunks("/app/node_modules/html2pdf.js/dist/html2pdf.js"), undefined);
  assert.equal(manualChunks("/app/node_modules/react/index.js"), "vendor-react");
});

test("las fuentes conservan respaldo sin bloquear la primera presentación", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const link = html.match(/<link\s+href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"[\s\S]*?\/>/)?.[0] || "";
  assert.match(link, /rel="preload"/);
  assert.match(link, /as="style"/);
  assert.match(link, /this\.rel='stylesheet'/);
  assert.match(html, /<noscript><link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com/);
  assert.match(html, /name="robots" content="noindex, nofollow, noarchive"/);
});
