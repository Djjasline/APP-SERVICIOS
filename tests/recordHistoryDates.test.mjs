import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatHistoryDate } from "../src/utils/recordHistoryDates.mjs";

test("muestra fecha y hora reales y no inventa valores ausentes o inválidos", () => {
  const value = "2026-11-12T15:24:00Z";
  const expected = new Intl.DateTimeFormat("es-EC", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
  assert.equal(formatHistoryDate(value), expected);
  assert.equal(formatHistoryDate(null), "No disponible");
  assert.equal(formatHistoryDate(undefined), "No disponible");
  assert.equal(formatHistoryDate(""), "No disponible");
  assert.equal(formatHistoryDate("fecha inválida"), "No disponible");
});

test("los historiales de formularios y cotizaciones muestran ambas fechas", () => {
  const paths = [
    "vehiculos/inspeccion/HistorialInspecciones.jsx",
    "vehiculos/mantenimiento/IndexMantenimiento.jsx",
    "vehiculos/informe/InformeHome.jsx",
    "vehiculos/protocolos/ProtocolosHome.jsx",
    "vehiculos/cotizador/CotizadorHome.jsx",
    "vehiculos/configurador/ConfiguradorHome.jsx",
    "agua/informe/InformeHome.jsx",
    "agua/recorrido/informe/InformeAguaHome.jsx",
    "operaciones/registro/RegistroHome.jsx",
    "operaciones/liberacion/LiberacionHome.jsx",
    "operaciones/recepcion/RecepcionHome.jsx",
    "operaciones/protocoloMan/ProtocoloManHome.jsx",
    "petroleo/visitaCampo/VisitaCampoHome.jsx",
  ];
  for (const path of paths) {
    const source = readFileSync(new URL(`../src/app/${path}`, import.meta.url), "utf8");
    assert.match(source, /<RecordHistoryDates record=\{/u, path);
  }
  const component = readFileSync(new URL("../src/components/RecordHistoryDates.jsx", import.meta.url), "utf8");
  assert.match(component, /record\?\.created_at \?\? record\?\.createdAt/u);
  assert.match(component, /record\?\.updated_at \?\? record\?\.updatedAt/u);
});
