import test from "node:test";
import assert from "node:assert/strict";
import { captureDashboardQuery, fetchAllById, getDashboardStatus, summarizeDashboardForms } from "../src/utils/dashboardData.mjs";

test("incluye áreas sin clasificar y no convierte estados desconocidos en borrador", () => {
  const summary = summarizeDashboardForms([
    { area: "vehiculos", estado: "borrador" },
    { area: null, estado: "borrador" },
    { area: "", estado: "completado" },
    { area: "desconocida", estado: null },
    { area: "operaciones", estado: "salida" },
    { area: "repositorios", estado: "borrador" },
    { tipo: "uso_recurso", estado: "borrador" },
  ]);
  assert.deepEqual(summary.totals, { completado: 1, borrador: 2, salida: 1, otro: 1, total: 5 });
  assert.equal(summary.unclassified, 3);
  assert.equal(summary.activeAreas, 2);
  assert.equal(summary.areaRows.find((row) => row.area === "por_clasificar").total, 3);
  assert.equal(getDashboardStatus({ estado: " BORRADOR " }), "borrador");
});

test("paginación continúa incluso si el servidor devuelve páginas cortas", async () => {
  const pages = {
    start: [{ id: "a" }, { id: "b" }],
    b: [{ id: "c" }],
    c: [{ id: "d" }],
    d: [],
  };
  const rows = await fetchAllById(async (cursor) => pages[cursor || "start"]);
  assert.deepEqual(rows.map((row) => row.id), ["a", "b", "c", "d"]);
});

test("paginación informa errores y no devuelve totales parciales", async () => {
  await assert.rejects(() => fetchAllById(async (cursor) => {
    if (!cursor) return [{ id: "a" }];
    throw new Error("consulta fallida");
  }), /consulta fallida/);
  await assert.rejects(() => fetchAllById(async () => [{ id: "a" }]), /no avanzó/);
});

test("una consulta fallida informa la sección y no se presenta como cero", async () => {
  const errors = [];
  const result = await captureDashboardQuery(async () => { throw new Error("fallo simulado"); }, null, errors, "notificaciones");
  assert.equal(result, null);
  assert.deepEqual(errors, ["notificaciones"]);
  assert.equal(await captureDashboardQuery(async () => 0, null, errors, "inventario"), 0);
});

test("paginación supera mil registros sin truncar", async () => {
  const input = Array.from({ length: 1501 }, (_, index) => ({ id: String(index).padStart(5, "0") }));
  const rows = await fetchAllById(async (cursor) => input.filter((row) => cursor === null || row.id > cursor).slice(0, 137));
  assert.equal(rows.length, 1501);
});
