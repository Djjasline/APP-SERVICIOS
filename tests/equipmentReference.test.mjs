import test from "node:test";
import assert from "node:assert/strict";
import { getEquipmentFormValues, mergeEquipmentFormValues } from "../src/utils/equipmentReference.mjs";

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
