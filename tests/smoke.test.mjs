import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("rutas criticas de lanzamiento estan protegidas", () => {
  const routes = read("src/Routes.jsx");

  assert.match(routes, /path="\/vehiculos\/configurador"[^\n]+SpecialModuleRoute[^\n]+configurador/);
  assert.match(routes, /path="\/vehiculos\/configurador\/ver\/:id"[^\n]+SpecialModuleRoute[^\n]+configurador/);
  assert.match(routes, /path="\/operaciones\/bodega"[^\n]+SpecialModuleRoute[^\n]+bodega/);
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
