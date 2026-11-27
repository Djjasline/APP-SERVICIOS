import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDraftStartGate, isDraftStartingInput, pendingDraftForFlush } from "../src/utils/draftLifecycle.mjs";

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

test("un formulario nuevo no crea borrador por valores iniciales o cargas automáticas", () => {
  const gate = createDraftStartGate({ requireInteraction: true });
  assert.equal(gate.canSave({ cliente: "", tecnico: "Preasignado" }), false);
  assert.equal(gate.canSave({ cliente: "", tecnico: "Actualizado" }), false);
  gate.input();
  assert.equal(gate.canSave({ cliente: "A" }), true);
  assert.equal(gate.canSave({ cliente: "" }), true);
});

test("selecciones y acciones solo activan el borrador si modifican los datos", () => {
  const gate = createDraftStartGate({ requireInteraction: true });
  gate.action({ items: {} }, 100);
  assert.equal(gate.canSave({ items: {} }, 101), false);
  assert.equal(gate.canSave({ items: { A1: "SI" } }, 102), true);
  const stale = createDraftStartGate({ requireInteraction: true });
  stale.action({ items: {} }, 100);
  assert.equal(stale.canSave({ items: { A1: "SI" } }, 5200), false);
});

test("campos con texto, selecciones y archivos habilitan el autoguardado", () => {
  assert.equal(isDraftStartingInput({ tagName: "INPUT", type: "text", value: "cliente" }), true);
  assert.equal(isDraftStartingInput({ tagName: "TEXTAREA", value: "  " }), false);
  assert.equal(isDraftStartingInput({ tagName: "INPUT", type: "text", value: "texto", readOnly: true }), false);
  assert.equal(isDraftStartingInput({ tagName: "INPUT", type: "checkbox", checked: false }), true);
  assert.equal(isDraftStartingInput({ tagName: "INPUT", type: "file", files: [] }), false);
  assert.equal(isDraftStartingInput({ tagName: "INPUT", type: "file", files: [{}] }), true);
  assert.equal(isDraftStartingInput({ tagName: "SELECT" }), true);
});

test("los borradores de edición conservan el comportamiento anterior", () => {
  const gate = createDraftStartGate({ requireInteraction: false });
  assert.equal(gate.canSave({ cliente: "" }), true);
});
