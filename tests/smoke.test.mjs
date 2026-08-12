import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("rutas criticas de lanzamiento estan protegidas", () => {
  const routes = read("src/Routes.jsx");

  assert.match(routes, /path="\/vehiculos\/configurador"[^\n]+SpecialModuleRoute[^\n]+configurador/);
  assert.match(routes, /path="\/vehiculos\/configurador\/ver\/:id"[^\n]+SpecialModuleRoute[^\n]+configurador/);
  assert.match(routes, /path="\/operaciones\/bodega"[^\n]+SpecialModuleRoute[^\n]+bodega/);
  assert.match(routes, /path="\/operaciones\/bodega\/nuevo"[^\n]+SpecialModuleRoute[^\n]+bodega/);
  assert.match(routes, /path="\/operaciones\/bodega\/:source\/:id"[^\n]+SpecialModuleRoute[^\n]+bodega/);
  assert.match(routes, /path="\/agua\/recorrido\/informe\/\*"[^\n]+SpecialModuleRoute[^\n]+recorridoAgua/);
  assert.match(routes, /path="\*"[^\n]+<NotFound \/>/);
});

test("modulos especiales conservan llaves esperadas", () => {
  const accessControl = read("src/constants/accessControl.js");

  for (const key of ["configurador", "recorrido_agua", "encuestas_satisfaccion", "bodega"]) {
    assert.match(accessControl, new RegExp(`"${key}"`));
  }

  assert.match(accessControl, /CONFIGURADOR_OWNER_EMAIL = "smaviles@astap\.com"/);
});

test("configurador mantiene dueno, vista previa e imagen proporcional", () => {
  const service = read("src/services/configuratorQuoteService.js");
  const home = read("src/app/vehiculos/configurador/ConfiguradorHome.jsx");
  const pdf = read("src/app/vehiculos/configurador/configuratorPdf.js");

  assert.match(service, /if \(userId\) dbPayload\.user_id = userId/);
  assert.doesNotMatch(service, /update\(\{ \.\.\.buildDbPayload\(payload, user\.id\)/);
  assert.match(service, /STATUS_PDF_PENDING = "pdf_pendiente"/);
  assert.match(service, /regenerateConfiguratorQuotePdf/);
  assert.match(home, /navigate\(`\/vehiculos\/configurador\/ver\/\$\{quoteId\}`\)/);
  assert.match(home, /navigate\(`\/vehiculos\/configurador\/ver\/\$\{editingQuoteId\}`\)/);
  assert.match(pdf, /function getContainedSize/);
  assert.match(pdf, /doc\.addImage\(modelImage\.dataUrl/);
});

test("RLS versionado cubre registros, perfiles, bodega y configurador", () => {
  const recordSql = read("supabase/sql/record_access_permissions.sql");
  const profilesSql = read("supabase/sql/profiles_policies.sql");
  const warehouseSql = read("supabase/sql/warehouse_inventory.sql");
  const vehicleReferenceSql = read("supabase/sql/vehicle_reference_catalog.sql");
  const configuratorSql = read("supabase/sql/vactor_configurator_quotes.sql");

  assert.match(recordSql, /alter table public\.registros enable row level security/);
  assert.match(recordSql, /Usuario consulta sus registros/);
  assert.match(recordSql, /Usuario ve registros permitidos/);
  assert.match(recordSql, /tecnicoCorreo/);
  assert.match(recordSql, /correoTecnico/);

  assert.match(profilesSql, /alter table public\.profiles enable row level security/);
  assert.match(profilesSql, /Usuarios autenticados leen perfiles/);
  assert.match(profilesSql, /Usuario actualiza su perfil/);

  assert.match(warehouseSql, /Usuario con permiso especial consulta inventario de bodega/);
  assert.match(warehouseSql, /p\.tipo = 'bodega'/);

  assert.match(vehicleReferenceSql, /create table if not exists public\.vehicle_reference_catalog/);
  assert.match(vehicleReferenceSql, /reference_stock numeric/);
  assert.match(vehicleReferenceSql, /Usuario con permiso bodega consulta referencia historica vehiculos/);
  assert.match(vehicleReferenceSql, /p\.tipo = 'bodega'/);
  assert.match(warehouseSql, /image_url text/);
  assert.match(warehouseSql, /compatible_equipment text/);
  assert.match(vehicleReferenceSql, /image_url text/);
  assert.match(vehicleReferenceSql, /compatible_equipment text/);

  assert.match(configuratorSql, /pdf_error text/);
  assert.match(configuratorSql, /pdf_pendiente/);
  assert.match(configuratorSql, /Usuario o super admin gestiona cotizaciones Vactor/);
});

test("subida de imagen de registros conserva validacion compatible", () => {
  const storage = read("src/utils/storage.js");

  assert.match(storage, /uploadRegistroImage/);
  assert.match(storage, /sanitizeStoragePart/);
  assert.match(storage, /temp/);
  assert.match(storage, /imagen/);
});

test("capitalizacion automatica no interfiere con escritura", () => {
  const autoCapitalize = read("src/components/AutoCapitalizeInputs.jsx");

  assert.match(autoCapitalize, /addEventListener\("focusout"/);
  assert.doesNotMatch(autoCapitalize, /addEventListener\("input"/);
  assert.match(autoCapitalize, /setNativeValue/);
  assert.match(autoCapitalize, /dispatchEvent\(new Event\("input", \{ bubbles: true \}\)\)/);
});

test("historiales limitan consultas pesadas", () => {
  const accessService = read("src/services/accessControlService.js");

  assert.match(accessService, /HISTORY_QUERY_LIMIT = 200/);
  assert.match(accessService, /RECORD_LIST_COLUMNS/);
  assert.match(accessService, /\.select\(RECORD_LIST_COLUMNS\)/);
  assert.match(accessService, /\.limit\(limit\)/);
  assert.match(accessService, /data->>correoTecnico/);

  for (const path of [
    "src/app/vehiculos/inspeccion/HistorialInspecciones.jsx",
    "src/app/vehiculos/mantenimiento/IndexMantenimiento.jsx",
    "src/app/vehiculos/protocolos/ProtocolosHome.jsx",
    "src/app/vehiculos/informe/InformeHome.jsx",
    "src/app/agua/informe/InformeHome.jsx",
    "src/utils/inspectionStorage.js",
  ]) {
    const source = read(path);
    assert.match(source, /\.select\(RECORD_LIST_COLUMNS\)/, path);
    assert.match(source, /\.limit\(HISTORY_QUERY_LIMIT\)/, path);
  }

  const notifications = read("src/services/notificationService.js");
  const appUpdates = read("src/services/appUpdatesService.js");

  assert.match(notifications, /\.limit\(100\)/);
  assert.match(appUpdates, /\.limit\(50\)/);
});

test("bodega separa stock real de referencia historica vehiculos", () => {
  const service = read("src/services/warehouseInventoryService.js");
  const home = read("src/app/operaciones/bodega/BodegaHome.jsx");

  assert.match(service, /getVehicleReferenceCatalog/);
  assert.match(service, /vehicle_reference_catalog/);
  assert.match(service, /reference_stock/);
  assert.match(service, /normalizeProductCode/);
  assert.match(service, /replace\(\/\^\[`'"‘’´\]\+\//);

  const importer = read("scripts/build_vehicle_reference_catalog_import.py");
  assert.match(importer, /def clean_product_code/);
  assert.match(importer, /lstrip\("`'\\"‘’´"\)/);

  assert.match(home, /SOURCE_VEHICLE_REFERENCE/);
  assert.match(home, /Referencia histórica vehículos/);
  assert.match(home, /No descuenta, suma ni reemplaza stock real de bodega/);
  assert.match(home, /VehicleReferenceTable/);
  assert.match(home, /SortableTh/);
  assert.match(home, /toggleStockSort/);
  assert.match(home, /toggleReferenceSort/);
  assert.match(home, /physical_stock/);
  assert.match(home, /last_cost/);
  assert.match(home, /Resumen por área/);
  assert.match(home, /Nuevo artículo/);

  const detail = read("src/app/operaciones/bodega/BodegaItemDetail.jsx");
  assert.match(detail, /Ficha de artículo/);
  assert.match(detail, /Área \/ unidad de negocio/);
  assert.match(detail, /URL de imagen de referencia/);
  assert.match(detail, /updateWarehouseItemMetadata/);

  const newItem = read("src/app/operaciones/bodega/BodegaItemNew.jsx");
  assert.match(newItem, /Bodega multiárea/);
  assert.match(newItem, /Stock real de bodega/);
  assert.match(newItem, /Referencia histórica/);
  assert.match(newItem, /createWarehouseItem/);
  assert.match(newItem, /Agua/);
  assert.match(newItem, /Petróleo/);

  assert.match(service, /createWarehouseItem/);
  assert.match(service, /STOCK_CREATE_FIELDS/);
  assert.match(service, /VEHICLE_REFERENCE_CREATE_FIELDS/);

  const metadataSql = read("supabase/sql/warehouse_item_metadata.sql");
  assert.match(metadataSql, /alter table public\.warehouse_inventory/);
  assert.match(metadataSql, /alter table public\.vehicle_reference_catalog/);
  assert.match(metadataSql, /area text/);
  assert.match(metadataSql, /technical_specs text/);
});
