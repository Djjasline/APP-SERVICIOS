// Generate a private, insert-only SQL file; never modifies the workbook or database.
// node scripts/prepare-equipment-reference-import.mjs <workbook.xlsx> <output.sql>
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";
import readXlsxFile from "read-excel-file/node";

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error("Indica el Excel y un archivo SQL de salida nuevo.");

const layouts = {
  "BARREDORAS PELICAN": "sweeper",
  "MODELO ROAD WIZARD": "sweeper",
  "MODELO CROSSWIND": "sweeper",
  "MODELO PIQUERSA": "sweeper",
  "MODELO VACTOR HIDRO": "hydro",
  "OTROS HIDROS": "hydro",
};
const sheets = await readXlsxFile(input);
for (const name of Object.keys(layouts)) {
  if (!sheets.some((sheet) => sheet.sheet === name)) throw new Error(`Falta la hoja ${name}`);
}
const rows = [];
for (const sheet of sheets) {
  const layout = layouts[sheet.sheet];
  if (!layout) continue;
  const header = sheet.data[0].map((value) => String(value ?? "").trim().toUpperCase());
  if (header[1] !== "TIPO" || !header[2].includes("VIN") ||
      (layout === "hydro" && !header[4].includes("MÓDULO")) ||
      (layout === "sweeper" && header[4] !== "MODELO")) {
    throw new Error(`Encabezado inesperado en ${sheet.sheet}; revisa el Excel antes de importar.`);
  }
  sheet.data.slice(1).forEach((row, index) => {
    if (!row.some((value) => value != null && String(value).trim())) return;
    const text = (value) => value == null ? null : String(value).trim() || null;
    rows.push([
      basename(input), sheet.sheet, index + 2, text(row[0]), text(row[1]), text(row[2]), text(row[3]),
      text(row[layout === "hydro" ? 5 : 4]), layout === "hydro" ? text(row[4]) : null,
      text(row[layout === "hydro" ? 6 : 5]), layout === "sweeper" ? text(row[6]) : null,
      layout === "sweeper" ? text(row[7]) : null, layout === "sweeper" ? text(row[8]) : null,
    ]);
  });
}
const sqlValue = (value) => value === null ? "null" : typeof value === "number" ? String(value) : `'${value.replace(/'/g, "''")}'`;
const columns = "source_file, source_sheet, source_row, client_name, equipment_type, chassis_vin, chassis_brand, equipment_model, module_serial, manufacture_year, auxiliary_brand, auxiliary_model, auxiliary_serial";
const sql = `-- Datos internos: revisar antes de ejecutar y no publicar este archivo.\n-- Se omiten hojas de resumen y reparaciones para revisión por separado.\nbegin;\ninsert into public.equipment_reference_catalog (${columns}) values\n${rows.map((row) => `  (${row.map(sqlValue).join(", ")})`).join(",\n")}\non conflict (source_file, source_sheet, source_row) do nothing;\ncommit;\n`;
await writeFile(output, sql, { encoding: "utf8", flag: "wx" });
console.log(`Preparadas ${rows.length} filas de seis hojas principales. No se modificó la base de datos.`);
