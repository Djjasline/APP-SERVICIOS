import test from "node:test";
import assert from "node:assert/strict";
import { isBarredoraPartsSection, setPartRemoved, visibleParts } from "../src/utils/predefinedParts.mjs";
import { normalizeRepuestoRow, parseRepuestoRows, repuestoRowsToText } from "../src/app/petroleo/visitaCampo/repuestoRows.mjs";

test("retirar y recuperar una pieza conserva sus respuestas y las demás filas", () => {
  const parts = [["C.1", "Pieza 1"], ["C.2", "Pieza 2"]];
  const original = { items: { "C.1": { estado: "SI", observacion: "detalle" } } };
  const removed = setPartRemoved(original, "C.1", true);
  assert.deepEqual(visibleParts(parts, removed.repuestosOcultos), [parts[1]]);
  assert.deepEqual(removed.items, original.items);
  assert.deepEqual(visibleParts(parts, setPartRemoved(removed, "C.1", false).repuestosOcultos), parts);
  assert.equal(original.repuestosOcultos, undefined);
  assert.deepEqual(setPartRemoved(removed, "C.1", true).repuestosOcultos, ["C.1"]);
});

test("solo las secciones de repuestos de barredora se identifican como tales", () => {
  assert.equal(isBarredoraPartsSection({ tipo: "cantidad", titulo: "C. REPUESTOS QUE SE REQUIEREN" }), true);
  assert.equal(isBarredoraPartsSection({ tipo: "cantidad", titulo: "C. CIRCUITO HIDRÁULICO" }), false);
  assert.equal(isBarredoraPartsSection({ tipo: "simple", titulo: "C. REPUESTOS" }), false);
});

test("tabla de repuestos conserva columnas vacías, espacios y filas nuevas", () => {
  const rows = [["1", "Filtro de ", "", "00123", "", "2"], normalizeRepuestoRow()];
  assert.deepEqual(parseRepuestoRows(repuestoRowsToText(rows)), rows);
  assert.deepEqual(parseRepuestoRows(""), [normalizeRepuestoRow()]);
});
