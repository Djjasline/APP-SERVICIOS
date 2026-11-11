import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getAdditionalRows, getAdditionalRowsForPdf } from "../src/app/vehiculos/inspeccion/additionalInspectionItems.mjs";

test("elementos adicionales conservan respuestas, observaciones y fotos en PDF", () => {
  const rows = [{ id: "uno", descripcion: "Manguera", estado: "SI", observacion: "Fuga", imagenes: ["foto"] }, { id: "vacio" }, { id: "dos", estado: "NA" }];
  const result = getAdditionalRowsForPdf(rows);
  assert.deepEqual(result.items, [["AD.1", "Manguera"], ["AD.2", "Elemento sin descripción"]]);
  assert.equal(result.data.items["AD.1"].estado, "SI");
  assert.deepEqual(result.data.items["AD.1"].imagenes, ["foto"]);
  assert.equal(result.data.items["AD.2"].estado, "NA");
  assert.deepEqual(getAdditionalRows(null), []);
});

test("sección adicional precede al anexo en los tres formularios y PDF", () => {
  for (const name of ["Barredora", "Hidro", "Camara"]) {
    const form = readFileSync(new URL(`../src/app/vehiculos/inspeccion/HojaInspeccion${name}.jsx`, import.meta.url), "utf8");
    const pdf = readFileSync(new URL(`../src/app/vehiculos/inspeccion/Inspeccion${name}PDF.jsx`, import.meta.url), "utf8");
    assert.ok(form.indexOf("<AdditionalInspectionItems ") < form.indexOf("<InspectionPartsAnnex\n"));
    assert.ok(pdf.indexOf("<AdditionalInspectionItemsPdf ") < pdf.indexOf("<InspectionPartsAnnexPdf "));
  }
});
