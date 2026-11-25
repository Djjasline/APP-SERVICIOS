import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { formatServiceDate, isServiceDateRangeValid } from "../src/utils/serviceDateRange.mjs";

test("service dates accept legacy records and same-day or multi-day ranges", () => {
  assert.equal(isServiceDateRangeValid("2026-11-18", ""), true);
  assert.equal(isServiceDateRangeValid("2026-11-18", undefined), true);
  assert.equal(isServiceDateRangeValid("2026-11-18", "2026-11-18"), true);
  assert.equal(isServiceDateRangeValid("2026-11-18", "2026-11-20"), true);
});

test("service end date cannot precede the start date", () => {
  assert.equal(isServiceDateRangeValid("2026-11-18", "2026-11-17"), false);
  assert.equal(isServiceDateRangeValid("2027-01-01", "2026-12-31"), false);
});

test("service dates display in local day/month/year order", () => {
  assert.equal(formatServiceDate("2026-11-18"), "18/11/2026");
  assert.equal(formatServiceDate(undefined), "");
  assert.equal(formatServiceDate("18/11/2026"), "18/11/2026");
});

test("all vehicle service forms and PDF views use the shared date range", async () => {
  const forms = [
    "informe/NuevoInforme.jsx",
    "inspeccion/HojaInspeccionHidro.jsx",
    "inspeccion/HojaInspeccionCamara.jsx",
    "inspeccion/HojaInspeccionBarredora.jsx",
    "mantenimiento/HojaMantenimientoHidro.jsx",
    "mantenimiento/HojaMantenimientoVCam.jsx",
    "mantenimiento/HojaMantenimientoBarredora.jsx",
  ];
  const pdfs = [
    "informe/InformePDF.jsx",
    "inspeccion/InspeccionHidroPDF.jsx",
    "inspeccion/InspeccionCamaraPDF.jsx",
    "inspeccion/InspeccionBarredoraPDF.jsx",
    "mantenimiento/MantenimientoHidroPdf.jsx",
    "mantenimiento/MantenimientoVCamPdf.jsx",
    "mantenimiento/MantenimientoBarredoraPdf.jsx",
  ];
  for (const file of forms) {
    const source = await readFile(new URL(`../src/app/vehiculos/${file}`, import.meta.url), "utf8");
    assert.match(source, /<ServiceDateRange\b/, file);
    assert.match(source, /isServiceDateRangeValid\(data\.fechaServicio, data\.fechaServicioFinal\)/, file);
  }
  for (const file of pdfs) {
    const source = await readFile(new URL(`../src/app/vehiculos/${file}`, import.meta.url), "utf8");
    assert.match(source, /<ServiceDateRangeDisplay\b/, file);
    assert.match(source, /fechaServicioFinal/, file);
  }
});

test("date range renders two calendar inputs and both dates in the PDF view", async () => {
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const component = await vite.ssrLoadModule("/src/components/ServiceDateRange.jsx");
    const props = { start: "2026-11-18", end: "2026-11-20", onChange: () => {} };
    const form = renderToStaticMarkup(React.createElement(component.default, props));
    const pdf = renderToStaticMarkup(React.createElement(component.ServiceDateRangeDisplay, props));
    assert.equal((form.match(/type="date"/g) || []).length, 2);
    assert.match(form, /Inicial/);
    assert.match(form, /Final/);
    assert.match(pdf, /18\/11\/2026/);
    assert.match(pdf, /20\/11\/2026/);

    const legacyPdf = renderToStaticMarkup(React.createElement(component.ServiceDateRangeDisplay, { start: props.start }));
    assert.match(legacyPdf, /18\/11\/2026/);
    assert.match(legacyPdf, /Final: .*—/);
  } finally {
    await vite.close();
  }
});
