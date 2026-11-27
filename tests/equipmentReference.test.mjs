import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getEquipmentFormValues, isPossibleEquipmentClient, mergeEquipmentFormValues, selectEquipmentReferenceForField } from "../src/utils/equipmentReference.mjs";

test("no confunde marca del chasis o número SN con marca y modelo del equipo", () => {
  const row = { chassis_brand: "FORD", chassis_vin: "ABC", equipment_model: "SN 4MW123", module_serial: "M123", manufacture_year: 2013 };
  assert.deepEqual(getEquipmentFormValues(row), { anio: "2013", vin: "ABC", serie: "M123" });
  assert.deepEqual(getEquipmentFormValues(row, { protocol: true }), { serie: "M123" });
});

test("solo completa campos vacíos sin tocar otros datos ni valores existentes", () => {
  const current = { vin: "ABC", marca: "VACTOR", placa: "AAA", modelo: "" };
  const result = mergeEquipmentFormValues(current, { vin: "abc", modelo: "2100" });
  assert.deepEqual(result.values, { vin: "ABC", marca: "VACTOR", placa: "AAA", modelo: "2100" });
  assert.deepEqual(result.conflicts, []);
  assert.deepEqual(current, { vin: "ABC", marca: "VACTOR", placa: "AAA", modelo: "" });
});

test("si hay diferencias no rellena ningún campo", () => {
  const current = { vin: "ABC", modelo: "" };
  const result = mergeEquipmentFormValues(current, { vin: "XYZ", modelo: "2100" });
  assert.equal(result.values, current);
  assert.deepEqual(result.conflicts, ["vin"]);
});

test("no reemplaza valores escritos como N/A", () => {
  const result = mergeEquipmentFormValues({ vin: "N/A" }, { vin: "ABC" });
  assert.deepEqual(result.conflicts, ["vin"]);
});

test("conserva campos de cámara y no copia VIN a formularios que no lo tienen", () => {
  const result = getEquipmentFormValues({ equipment_model: "V-CAM6", module_serial: "S01", chassis_vin: "VIN" }, { camera: true });
  assert.deepEqual(result, { modelo: "V-CAM6", serieModulo: "S01" });
});

test("sugiere equipos por cliente ignorando tildes y términos institucionales", () => {
  assert.equal(isPossibleEquipmentClient("GAD SANTA ANA", "Gobierno Autónomo Descentralizado Municipal del Cantón Santa Ana"), true);
  assert.equal(isPossibleEquipmentClient("EMAPA AMBATO", "Empresa municipal de agua potable y alcantarillado de Ambato"), true);
  assert.equal(isPossibleEquipmentClient("PUERTO LIMPIO GUAYAQUIL", "Puerto Limpio Guayaquil"), true);
  assert.equal(isPossibleEquipmentClient("GAD PORTOVIEJO", "PORTIVIEJO"), true);
  assert.equal(isPossibleEquipmentClient("GAD RUMIÑAHUI", "RUMIÑAHI"), true);
  assert.equal(isPossibleEquipmentClient("GAD SAMBORONDÓN", "GAD SAN BORONDON"), true);
  assert.equal(isPossibleEquipmentClient("EMPRESA MUNICIPAL DE ASEO SANTA ROSA EMAS EP", "EMAS-EP STA ROSA"), true);
  assert.equal(isPossibleEquipmentClient("GAD SANTA ANA", "GAD SANTA ELENA"), false);
  assert.equal(isPossibleEquipmentClient("GAD CHONE", "GAD SANTA ANA"), false);
  assert.equal(isPossibleEquipmentClient("GAD", "GAD SANTA ANA"), false);
  assert.equal(isPossibleEquipmentClient("", "GAD SANTA ANA"), false);
});

test("los formularios de vehículos conectan el cliente al desplegable", async () => {
  const forms = [
    "informe/NuevoInforme.jsx",
    "inspeccion/HojaInspeccionHidro.jsx",
    "inspeccion/HojaInspeccionBarredora.jsx",
    "inspeccion/HojaInspeccionCamara.jsx",
    "mantenimiento/HojaMantenimientoHidro.jsx",
    "mantenimiento/HojaMantenimientoBarredora.jsx",
    "mantenimiento/HojaMantenimientoVCam.jsx",
  ];
  for (const form of forms) {
    const content = await readFile(new URL(`../src/app/vehiculos/${form}`, import.meta.url), "utf8");
    assert.match(content, /<EquipmentReferenceSearch[^>]*clientName=\{data\.cliente\}/, form);
    assert.match(content, /<EquipmentReferenceField\b/, form);
  }
});

test("una opción reemplaza solo el identificador elegido y no pisa otros campos", () => {
  const reference = { chassis_vin: "VIN2", module_serial: "S2", equipment_model: "2100" };
  const current = { vin: "VIN1", serie: "S2", modelo: "", placa: "ABC" };
  const result = selectEquipmentReferenceForField(current, reference, "vin");
  assert.deepEqual(result.values, { vin: "VIN2", serie: "S2", modelo: "2100", placa: "ABC" });
  const conflict = selectEquipmentReferenceForField({ ...current, serie: "OTRA" }, reference, "vin");
  assert.deepEqual(conflict.conflicts, ["serie"]);
  assert.equal(conflict.values.vin, "VIN1");
  const unavailable = selectEquipmentReferenceForField(current, { module_serial: "S2" }, "vin");
  assert.equal(unavailable.unavailable, true);
  assert.equal(unavailable.values, current);
});
