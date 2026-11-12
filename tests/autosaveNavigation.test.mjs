import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pendingDraftForFlush } from "../src/utils/draftLifecycle.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("solo guarda al salir el borrador pendiente que no haya sido limpiado", () => {
  const datos = { cliente: "Último cambio" };
  const pending = { key: "usuario_inspeccion_new", version: 2, datos };
  assert.equal(pendingDraftForFlush(pending, "usuario_inspeccion_new", 2), datos);
  assert.equal(pendingDraftForFlush(pending, "usuario_inspeccion_new", 3), undefined);
  assert.equal(pendingDraftForFlush(pending, "otro_registro", 2), undefined);
  assert.equal(pendingDraftForFlush(null, "usuario_inspeccion_new", 2), undefined);
});

test("las inspecciones esperan la carga y permiten recuperar borradores de edición", () => {
  for (const type of ["Barredora", "Hidro", "Camara"]) {
    const form = read(`src/app/vehiculos/inspeccion/HojaInspeccion${type}.jsx`);
    assert.match(form, /useAutoguardado\(claveAutoguardado, data, recordLoaded, 15000, \{ protectExisting: true \}\)/);
    assert.match(form, /protectExisting\s+ready=\{recordLoaded\}/);
    assert.match(form, /const recordLoaded = loadedRecordId === \(id \|\| "new"\)/);
  }
  const banner = read("src/components/BannerAutoguardado.jsx");
  assert.match(banner, /isEditing && !protectExisting/);
  assert.match(banner, /disabled=\{!ready\}/);
  const hook = read("src/hooks/useAutoguardado.js");
  assert.match(hook, /pendingDraftForFlush\(pending, key/);
  assert.match(hook, /pendingRecoveryKeys\.has/);
});
