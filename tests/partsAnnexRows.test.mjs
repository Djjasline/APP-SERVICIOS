import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createDefaultPartsAnnexRows, hasPartsAnnexRowContent, normalizePartsAnnexRows, removePartsAnnexRow } from "../src/utils/partsAnnexRows.mjs";

test("elimina solo la fila elegida y conserva el orden sin modificar el original", () => {
  const rows = [
    { descripcion: "Primera", numeroParte: "001", cantidad: "1" },
    { descripcion: "Intermedia", numeroParte: "002", cantidad: "2" },
    { descripcion: "Última", numeroParte: "003", cantidad: "3" },
  ];
  assert.deepEqual(removePartsAnnexRow(rows, 1), [rows[0], rows[2]]);
  assert.equal(rows.length, 3);
  assert.deepEqual(removePartsAnnexRow(rows, 0), [rows[1], rows[2]]);
  assert.deepEqual(removePartsAnnexRow(rows, 2), [rows[0], rows[1]]);
  assert.equal(removePartsAnnexRow(rows, 3), rows);
});

test("mantiene una fila vacía al eliminar la última y detecta contenido", () => {
  assert.deepEqual(removePartsAnnexRow([{ descripcion: "Única" }], 0), [{ descripcion: "", numeroParte: "", cantidad: "", observaciones: "" }]);
  assert.equal(hasPartsAnnexRowContent({ descripcion: " ", numeroParte: "", cantidad: "" }), false);
  assert.equal(hasPartsAnnexRowContent({ descripcion: "", numeroParte: "0001" }), true);
  assert.equal(hasPartsAnnexRowContent({ cantidad: 0 }), true);
  assert.equal(hasPartsAnnexRowContent({ observaciones: "Revisar montaje" }), true);
  assert.equal(hasPartsAnnexRowContent({ observacion: "Observación histórica" }), true);
  assert.equal(hasPartsAnnexRowContent({ observacion: "Anterior", observaciones: "" }), false);
});

test("normaliza registros antiguos sin alterar sus datos ni campos adicionales", () => {
  const original = [{ descripcion: "SELLO", numeroParte: "", nParte: "00123", cantidad: 0, observacion: "Montaje", otroDato: "conservar" }, { descripcion: "Bomba", numeroParte: "987", cantidad: "3" }];
  const copia = structuredClone(original);
  const normalizadas = normalizePartsAnnexRows(original);
  assert.deepEqual(original, copia);
  assert.deepEqual(normalizadas[0], { ...original[0], numeroParte: "00123", observaciones: "Montaje" });
  assert.deepEqual(normalizadas[1], { ...original[1], observaciones: "" });
  assert.deepEqual(createDefaultPartsAnnexRows(1)[0], { descripcion: "", numeroParte: "", cantidad: "", observaciones: "" });
});

test("formulario y PDF comparten el orden y conservan observaciones", () => {
  const source = readFileSync(new URL("../src/components/InspectionPartsAnnex.jsx", import.meta.url), "utf8");
  const [form, pdf] = source.split("export function InspectionPartsAnnexPdf");
  for (const section of [form, pdf]) {
    const headers = ["ÍTEM</th>", "CANTIDAD</th>", "N° PARTE</th>", "DESCRIPCIÓN / NOMBRE</th>", "OBSERVACIONES</th>"];
    const positions = headers.map((header) => section.indexOf(header));
    assert.ok(positions.every((position) => position >= 0));
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  }
  assert.match(form, /updateRow\(index, "observaciones"/);
  assert.match(pdf, /filter\(hasPartsAnnexRowContent\)/);
  assert.match(pdf, /row\.observaciones/);
});

test("el anexo usa confirmación e iconos individuales en lugar de eliminar último", () => {
  const source = readFileSync(new URL("../src/components/InspectionPartsAnnex.jsx", import.meta.url), "utf8");
  assert.match(source, /hasPartsAnnexRowContent\(items\[index\]\).*window\.confirm/);
  assert.match(source, /onClick=\{\(\) => removeRow\(index\)\}/);
  assert.match(source, /aria-label=\{`Eliminar ítem \$\{index \+ 1\}`\}/);
  assert.doesNotMatch(source, /Eliminar último|removeLastRow/);
});
