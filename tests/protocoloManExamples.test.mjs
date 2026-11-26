import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PROTOCOLO_MAN_EXAMPLES } from "../src/app/operaciones/protocoloMan/protocolosManExamples.mjs";

test("the four MAN formats each have a distinct local WebP example", async () => {
  assert.deepEqual(Object.keys(PROTOCOLO_MAN_EXAMPLES).sort(), [
    "avance-cronograma", "entrega", "recepcion", "semanal-proveedor",
  ]);
  const paths = Object.values(PROTOCOLO_MAN_EXAMPLES);
  assert.equal(new Set(paths).size, 4);
  for (const src of paths) {
    assert.match(src, /^\/protocolos-man\/[a-z-]+\.webp$/);
    const data = await readFile(new URL(`../public${src}`, import.meta.url));
    assert.equal(data.subarray(0, 4).toString(), "RIFF");
    assert.equal(data.subarray(8, 12).toString(), "WEBP");
  }
});

test("examples are optional on shared cards and do not replace form navigation", async () => {
  const card = await readFile(new URL("../src/components/CardModulo.jsx", import.meta.url), "utf8");
  const home = await readFile(new URL("../src/app/operaciones/protocoloMan/ProtocoloManHome.jsx", import.meta.url), "utf8");
  const dialog = await readFile(new URL("../src/app/operaciones/protocoloMan/ProtocoloManExample.jsx", import.meta.url), "utf8");
  assert.match(card, /\{children\}/);
  assert.match(card, /navigate\(ruta\)/);
  assert.match(home, /ruta=\{`\$\{PROTOCOLO_MAN_BASE_PATH\}\/\$\{protocol\.id\}`\}/);
  assert.match(home, /setExample\(protocol\)/);
  assert.match(dialog, /showModal\(\)/);
  assert.match(dialog, /onClose=\{onClose\}/);
  assert.match(dialog, /Ejemplo visual/);
});
