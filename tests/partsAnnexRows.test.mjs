import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasPartsAnnexRowContent, removePartsAnnexRow } from "../src/utils/partsAnnexRows.mjs";

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
  assert.deepEqual(removePartsAnnexRow([{ descripcion: "Única" }], 0), [{ descripcion: "", numeroParte: "", cantidad: "" }]);
  assert.equal(hasPartsAnnexRowContent({ descripcion: " ", numeroParte: "", cantidad: "" }), false);
  assert.equal(hasPartsAnnexRowContent({ descripcion: "", numeroParte: "0001" }), true);
  assert.equal(hasPartsAnnexRowContent({ cantidad: 0 }), true);
});

test("el anexo usa confirmación e iconos individuales en lugar de eliminar último", () => {
  const source = readFileSync(new URL("../src/components/InspectionPartsAnnex.jsx", import.meta.url), "utf8");
  assert.match(source, /hasPartsAnnexRowContent\(items\[index\]\).*window\.confirm/);
  assert.match(source, /onClick=\{\(\) => removeRow\(index\)\}/);
  assert.match(source, /aria-label=\{`Eliminar ítem \$\{index \+ 1\}`\}/);
  assert.doesNotMatch(source, /Eliminar último|removeLastRow/);
});
