import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("rutas criticas de lanzamiento estan protegidas", () => {
  const routes = read("src/Routes.jsx");

  assert.match(routes, /path="\/vehiculos\/configurador"[^\n]+SpecialModuleRoute[^\n]+configurador/);
  assert.match(routes, /path="\/vehiculos\/configurador\/ver\/:id"[^\n]+SpecialModuleRoute[^\n]+configurador/);
  assert.match(routes, /path="\/vehiculos\/cotizador"[^\n]+SpecialModuleRoute[^\n]+cotizador/);
  assert.match(routes, /path="\/operaciones\/bodega"[^\n]+SpecialModuleRoute[^\n]+bodega/);
  assert.match(routes, /path="\/operaciones\/bodega\/nuevo"[^\n]+SpecialModuleRoute[^\n]+bodega/);
  assert.match(routes, /path="\/operaciones\/bodega\/:source\/:id"[^\n]+SpecialModuleRoute[^\n]+bodega/);
  assert.match(routes, /path="\/operaciones\/protocolo-man"[^\n]+SuperAdminRoute[^\n]+ProtocoloManHome/);
  assert.match(routes, /path="\/operaciones\/protocolo-man\/:protocolId"[^\n]+SuperAdminRoute[^\n]+ProtocoloManForm/);
  assert.match(routes, /path="\/vehiculos\/capacitacion"[^\n]+InformeHome[^\n]+reportType="capacitacion"/);
  assert.match(routes, /path="\/vehiculos\/capacitacion\/nuevo"[^\n]+NuevoInforme[^\n]+reportType="capacitacion"/);
  assert.match(routes, /path="\/vehiculos\/capacitacion\/pdf\/:id"[^\n]+InformePDF[^\n]+reportType="capacitacion"/);
  assert.match(routes, /path="\/agua\/recorrido\/informe\/\*"[^\n]+SpecialModuleRoute[^\n]+recorridoAgua/);
  assert.match(routes, /path="\*"[^\n]+<NotFound \/>/);
});

test("menu lateral muestra acceso a informe de capacitacion", () => {
  const sidebar = read("src/layouts/Sidebar.jsx");

  assert.match(sidebar, /go\("\/vehiculos\/capacitacion"\)/);
  assert.match(sidebar, /subItemClass\("\/vehiculos\/capacitacion"\)/);
  assert.match(sidebar, /Informe de Capacitación/);
});

test("menu lateral muestra bodega como seccion independiente", () => {
  const sidebar = read("src/layouts/Sidebar.jsx");

  assert.match(sidebar, /puedeVerTodo && puedeUsarBodega/);
  assert.match(sidebar, /go\("\/operaciones\/bodega"\)/);
  assert.match(sidebar, /itemClass\(isActive\("\/operaciones\/bodega"\)\)/);
  assert.match(sidebar, /path\.startsWith\("\/operaciones"\) && !isBodegaPath/);
  assert.doesNotMatch(sidebar, /subLabel\(Package, OPERACIONES_TEXT\.bodega\.title\)/);
});

test("operaciones incluye protocolo MAN solo para superadmin", () => {
  const sidebar = read("src/layouts/Sidebar.jsx");
  const area = read("src/pages/AreaOperaciones.jsx");
  const home = read("src/app/operaciones/protocoloMan/ProtocoloManHome.jsx");
  const form = read("src/app/operaciones/protocoloMan/ProtocoloManForm.jsx");
  const config = read("src/app/operaciones/protocoloMan/protocolosManConfig.js");

  assert.match(sidebar, /superAdminActivo && \(/);
  assert.match(sidebar, /go\("\/operaciones\/protocolo-man"\)/);
  assert.match(sidebar, /OPERACIONES_TEXT\.protocoloMan\.title/);
  assert.match(area, /superAdminActivo/);
  assert.match(area, /"\/operaciones\/protocolo-man"/);
  assert.match(home, /Solo superadministrador/);
  assert.match(form, /PROTOCOLO_MAN_TIPO/);
  for (const code of ["FR-MAN-001", "FR-MAN-002", "FR-MAN-003", "FR-MAN-004"]) {
    assert.match(config, new RegExp(code));
  }
});

test("modulos especiales conservan llaves esperadas", () => {
  const accessControl = read("src/constants/accessControl.js");

  for (const key of ["configurador", "cotizador", "recorrido_agua", "encuestas_satisfaccion", "bodega", "clientes"]) {
    assert.match(accessControl, new RegExp(`"${key}"`));
  }

  assert.match(accessControl, /CONFIGURADOR_OWNER_EMAIL = PRIVILEGED_EMAILS\.superAdmin\[0\]/);
});

test("temas oscuros mantienen variantes dark y azul", () => {
  const themeContext = read("src/context/ThemeContext.jsx");
  const mainLayout = read("src/layouts/MainLayout.jsx");
  const sidebar = read("src/layouts/Sidebar.jsx");
  const styles = read("src/styles/tailwind.css");

  assert.match(themeContext, /const THEMES = \["dark", "blue", "light", "liquid"\]/);
  assert.match(themeContext, /isBlueDark: theme === "blue"/);
  assert.match(mainLayout, /oscuro azul/);
  assert.match(sidebar, /from-\[#003366\] to-\[#001f3f\]/);
  assert.match(styles, /GRAPHITE DARK THEME/);
  assert.match(themeContext, /isLiquid: theme === "liquid"/);
  assert.match(mainLayout, /liquid-glass-background/);
  assert.match(mainLayout, /liquid-glass-shell/);
  assert.match(sidebar, /liquid-glass-sidebar/);
  assert.match(styles, /LIQUID GLASS THEME/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /\.text-blue-900,\nhtml\[data-theme="dark"\].*\.text-blue-800,\nhtml\[data-theme="dark"\].*\.text-blue-700/s);
  assert.match(styles, /\.text-blue-900,\nhtml\[data-theme="blue"\].*\.text-blue-800,\nhtml\[data-theme="blue"\].*\.text-blue-700/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell.*\.bg-red-200.*\.bg-amber-50.*\.bg-green-100.*\.bg-purple-100/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell.*\.text-red-700.*\.text-amber-700.*\.text-green-700.*\.text-purple-700/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell.*\.hover\\:bg-white:hover.*\.hover\\:bg-blue-50:hover.*\.hover\\:bg-red-50:hover.*\.hover\\:bg-purple-100:hover/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell.*\.hover\\:text-slate-700:hover.*\.hover\\:text-red-700:hover.*\.hover\\:text-blue-700:hover/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell.*\.odd\\:bg-slate-50:nth-child\(odd\).*\.odd\\:bg-blue-50\\\/40:nth-child\(odd\)/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell :where\(\.pdf-container, \.print-area, \.pdf-page, \.pdf-table\).*\.bg-green-100/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell :where\(\.pdf-container, \.print-area, \.pdf-page, \.pdf-table\).*\.text-red-700/s);
  assert.match(styles, /html\[data-theme="dark"\] \.app-page-shell :where\(\.document-sheet\)/);
  assert.match(styles, /document-sheet.*input, textarea, select/s);
  assert.match(styles, /document-sheet.*\.bg-blue-50/s);
  assert.match(styles, /document-sheet.*\.bg-green-100/s);
  assert.match(styles, /document-sheet.*\.text-red-700/s);
});

test("formularios tecnicos conservan hoja blanca en modo oscuro", () => {
  const vehiculo = read("src/app/vehiculos/informe/NuevoInforme.jsx");
  const agua = read("src/app/agua/informe/NuevoInforme.jsx");
  const recepcion = read("src/app/operaciones/recepcion/HojaRecepcion.jsx");
  const herramientas = read("src/app/operaciones/registro/HojaRegistroHerramientas.jsx");
  const liberacion = read("src/app/operaciones/liberacion/LiberacionForm.jsx");
  const protocoloMan = read("src/app/operaciones/protocoloMan/ProtocoloManForm.jsx");

  assert.match(vehiculo, /document-sheet bg-white/);
  assert.match(agua, /document-sheet bg-white/);
  assert.match(recepcion, /document-sheet recepcion-sheet-wrap/);
  assert.match(herramientas, /document-sheet bg-white text-slate-900/);
  assert.match(liberacion, /document-sheet max-w-\[794px\]/);
  assert.match(protocoloMan, /document-sheet overflow-hidden/);
});

test("dashboard de exito mantiene actividad diaria visible", () => {
  const dashboard = read("src/pages/admin/AdminSuccessDashboard.jsx");

  assert.match(dashboard, /function buildDailyActivity/);
  assert.match(dashboard, /dailyActivity: buildDailyActivity/);
  assert.match(dashboard, /getGeneralDashboard/);
  assert.match(dashboard, /Vista operativa diaria/);
  assert.match(dashboard, /OperationalSnapshot/);
  assert.match(dashboard, /Alertas importantes/);
  assert.match(dashboard, /Actividad reciente/);
  assert.match(dashboard, /<BarChart data=\{dashboard\.dailyActivity\}/);
  assert.match(dashboard, /role="img" aria-label="Actividad diaria de informes"/);
  assert.match(dashboard, /lg:grid-cols-2 2xl:grid-cols-\[0\.9fr_0\.9fr_1fr\]/);
  assert.match(dashboard, /<Panel title="7\. Resumen de impacto">\s*<ImpactList \/>\s*<\/Panel>/);
  assert.match(dashboard, /<ResourceUsageTable usage=\{dashboard\.resourceUsage\} isLight=\{isLight\} \/>/);
  assert.match(dashboard, /border border-white\/10 bg-white\/10 text-white/);
  assert.match(dashboard, /bg-purple-500\/25 text-purple-100/);
});

test("firma predeterminada mantiene contraste sobre canvas blanco", () => {
  const signature = read("src/components/SignatureCanvasField.jsx");

  assert.match(signature, /Usar mi firma/);
  assert.match(signature, /bg-slate-950[^\n]+text-white/);
  assert.doesNotMatch(signature, /bg-blue-50\/90[^\n]+text-blue-700/);
});

test("panel principal conserva visual de menu estable", () => {
  const panel = read("src/pages/PanelServicios.jsx");
  const service = read("src/services/dashboardService.js");

  assert.match(panel, /Panel de servicios ASTAP/);
  assert.match(panel, /Gestión técnica organizada por secciones operativas/);
  assert.match(panel, /menuPrincipal/);
  assert.doesNotMatch(panel, /getGeneralDashboard/);
  assert.doesNotMatch(panel, /Centro de control/);
  assert.match(service, /warehouse_inventory/);
  assert.match(service, /vehicle_service_quotes/);
  assert.match(service, /customer_satisfaction_surveys/);
  assert.match(service, /safeQuery/);
});

test("configurador mantiene dueno, vista previa e imagen proporcional", () => {
  const service = read("src/services/configuratorQuoteService.js");
  const home = read("src/app/vehiculos/configurador/ConfiguradorHome.jsx");
  const pdf = read("src/app/vehiculos/configurador/configuratorPdf.js");
  const warehouseService = read("src/services/warehouseInventoryService.js");

  assert.match(service, /if \(userId\) dbPayload\.user_id = userId/);
  assert.doesNotMatch(service, /update\(\{ \.\.\.buildDbPayload\(payload, user\.id\)/);
  assert.match(service, /STATUS_PDF_PENDING = "pdf_pendiente"/);
  assert.match(service, /regenerateConfiguratorQuotePdf/);
  assert.match(home, /navigate\(`\/vehiculos\/configurador\/ver\/\$\{quoteId\}`\)/);
  assert.match(home, /navigate\(`\/vehiculos\/configurador\/ver\/\$\{editingQuoteId\}`\)/);
  assert.doesNotMatch(home, /Cruce con Bodega/);
  assert.doesNotMatch(home, /getWarehouseAvailabilityForQuoteItems/);
  assert.doesNotMatch(home, /AvailabilityBadge/);
  assert.match(warehouseService, /getWarehouseAvailabilityForQuoteItems/);
  assert.match(warehouseService, /WAREHOUSE_AVAILABILITY_STATUS/);
  assert.match(warehouseService, /warehouse_inventory/);
  assert.match(warehouseService, /vehicle_reference_catalog/);
  assert.match(pdf, /function getContainedSize/);
  assert.match(pdf, /doc\.addImage\(modelImage\.dataUrl/);
});

test("RLS versionado cubre registros, perfiles, bodega y configurador", () => {
  const recordSql = read("supabase/sql/record_access_permissions.sql");
  const profilesSql = read("supabase/sql/profiles_policies.sql");
  const warehouseSql = read("supabase/sql/warehouse_inventory.sql");
  const vehicleReferenceSql = read("supabase/sql/vehicle_reference_catalog.sql");
  const configuratorSql = read("supabase/sql/vactor_configurator_quotes.sql");
  const serviceQuotesSql = read("supabase/sql/vehicle_service_quotes.sql");

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
  assert.match(warehouseSql, /Usuario cotizador consulta inventario/);
  assert.match(warehouseSql, /p\.tipo = 'cotizador'/);

  assert.match(vehicleReferenceSql, /create table if not exists public\.vehicle_reference_catalog/);
  assert.match(vehicleReferenceSql, /reference_stock numeric/);
  assert.match(vehicleReferenceSql, /Usuario con permiso bodega consulta referencia historica vehiculos/);
  assert.match(vehicleReferenceSql, /p\.tipo = 'bodega'/);
  assert.match(vehicleReferenceSql, /Usuario cotizador consulta referencia/);
  assert.match(vehicleReferenceSql, /p\.tipo = 'cotizador'/);
  assert.match(warehouseSql, /image_url text/);
  assert.match(warehouseSql, /compatible_equipment text/);
  assert.match(vehicleReferenceSql, /image_url text/);
  assert.match(vehicleReferenceSql, /compatible_equipment text/);

  assert.match(configuratorSql, /pdf_error text/);
  assert.match(configuratorSql, /pdf_pendiente/);
  assert.match(configuratorSql, /Usuario o super admin gestiona cotizaciones Vactor/);
  assert.match(serviceQuotesSql, /create table if not exists public\.vehicle_service_quotes/);
  assert.match(serviceQuotesSql, /offer jsonb/);
  assert.match(serviceQuotesSql, /lines jsonb/);
  assert.match(serviceQuotesSql, /pdf_url text/);
  assert.match(serviceQuotesSql, /pdf_error text/);
  assert.match(serviceQuotesSql, /pdf_pendiente/);
  assert.match(serviceQuotesSql, /Usuario o super admin gestiona cotizaciones de servicios/);
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

test("formularios activan revision ortografica sin afectar campos tecnicos", () => {
  const app = read("src/App.jsx");
  const hook = read("src/hooks/useFormWritingQuality.js");
  const quality = read("src/utils/formWritingQuality.js");
  const assistant = read("src/components/TechnicalWritingAssistant.jsx");

  assert.match(app, /useFormWritingQuality\(\)/);
  assert.match(hook, /applyWritingQuality\(\)/);
  assert.match(hook, /MutationObserver/);
  assert.match(hook, /addEventListener\("input"/);
  assert.match(quality, /setAttribute\("spellcheck", enabled \? "true" : "false"\)/);
  assert.match(quality, /setAttribute\("lang", "es-EC"\)/);
  assert.match(quality, /TECHNICAL_FIELD_KEYWORDS/);
  assert.match(quality, /"correo"/);
  assert.match(quality, /"vin"/);
  assert.match(assistant, /shouldEnableWritingAssistance/);
  assert.match(assistant, /activeFieldRef/);
  assert.match(assistant, /onMouseDown=\{\(event\) => event\.preventDefault\(\)\}/);
});

test("chat soporta adjuntos estructurados en mensajes", () => {
  const chatSql = read("supabase/sql/chat_interno_setup.sql");
  const chatService = read("src/services/chatService.js");
  const chatPage = read("src/pages/chat/ChatInterno.jsx");

  assert.match(chatSql, /attachments jsonb not null default '\[\]'::jsonb/);
  assert.match(chatSql, /add column if not exists attachments jsonb/);
  assert.match(chatService, /CHAT_MESSAGE_COLUMNS = "id, conversation_id, sender_id, body, attachments, created_at"/);
  assert.match(chatService, /getCompletedRecordPdfAttachmentsForChat/);
  assert.match(chatPage, /Adjuntar PDF completado/);
  assert.match(chatPage, /adjuntoSeleccionado/);
  assert.match(chatPage, /EMOJI_OPTIONS/);
  assert.doesNotMatch(chatPage, /VITE_TENOR_API_KEY/);
  assert.doesNotMatch(chatPage, />GIF</);
});

test("biblioteca tecnica incluye buscador por indice OneDrive", () => {
  const page = read("src/app/repositorios/ManualesTecnicos.jsx");
  const service = read("src/services/technicalManualIndexService.js");
  const script = read("scripts/build-technical-manual-index.mjs");
  const index = JSON.parse(read("public/data/technical-manual-index.json"));
  const pkg = read("package.json");

  assert.match(page, /Buscador técnico por número de parte/);
  assert.match(page, /loadTechnicalManualIndex/);
  assert.match(page, /searchTechnicalManualIndex/);
  assert.match(service, /VITE_TECH_MANUAL_INDEX_URL/);
  assert.match(service, /buildIndexUrls/);
  assert.match(service, /cache: "reload"/);
  assert.match(service, /\/data\/technical-manual-index\.json/);
  assert.match(page, /Cargando índice técnico de manuales/);
  assert.match(script, /ONEDRIVE_MANUALS_URL/);
  assert.match(script, /_api\/v2\.0\/drives/);
  assert.match(script, /pages: \[\]/);
  assert.equal(index.source, "onedrive-sharepoint");
  assert.ok(index.totalFiles > 0);
  assert.ok(Array.isArray(index.entries));
  assert.ok(index.entries.some((entry) => String(entry.searchText || "").includes("vactor")));
  assert.match(pkg, /"manuals:index": "node scripts\/build-technical-manual-index\.mjs"/);
});

test("service worker no bloquea indice tecnico con cache vieja", () => {
  const sw = read("public/sw.js");

  assert.match(sw, /app-servicios-v14/);
  assert.match(sw, /data\/technical-manual-index\.json/);
  assert.match(sw, /fetch\(event\.request, \{ cache: "reload" \}\)/);
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
  assert.match(service, /LIST_METADATA_COLUMNS/);
  assert.match(service, /image_url/);
  assert.match(service, /category/);
  assert.match(service, /vehicle_reference_catalog/);
  assert.match(service, /reference_stock/);
  assert.match(service, /normalizeWarehouseProductCode/);
  assert.match(service, /replace\(\/\^\[`'"‘’´\]\+\//);
  assert.match(service, /replace\(\/\^0-\(\.\+\)\$\/i, "\$1"\)/);

  const importer = read("scripts/build_vehicle_reference_catalog_import.py");
  assert.match(importer, /def clean_product_code/);
  assert.match(importer, /lstrip\("`'\\"‘’´"\)/);
  assert.match(importer, /re\.sub\(r"\^0-\(\.\+\)\$"/);

  assert.match(home, /SOURCE_VEHICLE_REFERENCE/);
  assert.match(home, /SOURCE_ALL/);
  assert.match(home, /Todas las listas/);
  assert.match(home, /Buscar en todas las listas/);
  assert.match(home, /buildCombinedExportRows/);
  assert.match(home, /ResultGroup/);
  assert.match(home, /StockTable/);
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
  assert.match(home, /Filtros avanzados/);
  assert.match(home, /Limpiar filtros/);
  assert.match(home, /Solo terminados -30/);
  assert.match(home, /Incompletas/);
  assert.match(home, /Estado ficha/);
  assert.match(home, /FichaStatusBadge/);
  assert.match(home, /getFichaMissingFields/);
  assert.match(home, /Ficha incompleta/);
  assert.match(home, /Falta:/);
  assert.match(home, /Fichas completas/);
  assert.match(home, /Fichas incompletas/);
  assert.match(home, /Exportar CSV/);
  assert.match(home, /downloadCsv/);
  assert.match(home, /buildExportRows/);
  assert.match(home, /Campos faltantes más comunes/);
  assert.match(home, /missingFieldSummary/);
  assert.match(home, /Calidad de datos/);
  assert.match(home, /Normalizar datos/);
  assert.match(home, /Importador CSV/);
  assert.match(home, /prepareWarehouseImportRows/);
  assert.match(home, /Indicadores operativos/);
  assert.match(home, /Valor referencial/);
  assert.match(home, /Top proveedores/);
  assert.match(home, /buildRanking/);
  assert.match(home, /operationalSummary/);
  assert.match(home, />Ubicación</);
  assert.match(home, />Proveedor</);
  assert.match(home, />Origen</);
  assert.match(home, />Fecha</);
  assert.doesNotMatch(home, /Ubicación \/ proveedor/);
  assert.doesNotMatch(home, /Origen \/ fecha/);
  assert.doesNotMatch(home, /Saldo ref\./);

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
  assert.match(service, /VEHICLE_SPECIALS_AREA = "Vehículos Especiales"/);
  assert.match(service, /FS_DEPOT_SUPPLIER = "FS-DEPOT"/);
  assert.match(service, /USA_BLUEBOOK_SUPPLIER = "USA BLUEBOOK"/);
  assert.match(service, /function normalizeWarehouseSupplierName/);
  assert.match(service, /USABLUEBOOK: USA_BLUEBOOK_SUPPLIER/);
  assert.match(service, /cleanupWarehouseCatalogData/);
  assert.match(service, /importWarehouseItems/);
  assert.match(service, /getWarehouseItemAuditLogs/);
  assert.match(service, /PIQUERSA_SUPPLIER = "Piquersa"/);
  assert.match(service, /isPiquersaDescription/);
  assert.match(service, /applyWarehouseClassificationRules/);
  assert.match(service, /isFsDepotVehicleCode/);
  assert.match(service, /-30\$/);
  assert.match(service, /WAREHOUSE_MOVEMENT_TYPES/);
  assert.match(service, /getWarehouseItemMovements/);
  assert.match(service, /createWarehouseItemMovement/);
  assert.match(service, /register_warehouse_item_movement/);
  assert.match(service, /stock_before/);
  assert.match(service, /stock_after/);
  assert.match(service, /stock_minimum/);
  assert.match(service, /getWarehouseRecentMovements/);
  assert.match(service, /warehouse_item_movements/);

  assert.match(home, /Actividad reciente/);
  assert.match(home, /getWarehouseRecentMovements/);
  assert.match(home, /Bajo mínimo/);
  assert.match(home, /Stock mín\./);

  const metadataSql = read("supabase/sql/warehouse_item_metadata.sql");
  assert.match(metadataSql, /alter table public\.warehouse_inventory/);
  assert.match(metadataSql, /alter table public\.vehicle_reference_catalog/);
  assert.match(metadataSql, /area text/);
  assert.match(metadataSql, /last_supplier text/);
  assert.match(metadataSql, /technical_specs text/);
  assert.match(metadataSql, /stock_minimum numeric/);

  const fsDepotSql = read("supabase/sql/apply_fs_depot_vehicle_codes.sql");
  assert.match(fsDepotSql, /Vehículos Especiales/);
  assert.match(fsDepotSql, /FS-DEPOT/);
  assert.match(fsDepotSql, /Piquersa/);
  assert.match(fsDepotSql, /piquersa/);
  assert.match(fsDepotSql, /-30\$/);

  const supplierNamesSql = read("supabase/sql/normalize_supplier_names.sql");
  assert.match(supplierNamesSql, /last_supplier = 'FS-DEPOT'/);
  assert.match(supplierNamesSql, /FSDEPOT/);
  assert.match(supplierNamesSql, /last_supplier = 'USA BLUEBOOK'/);
  assert.match(supplierNamesSql, /USABLUEBOOK/);

  const piquersaSql = read("supabase/sql/apply_piquersa_vehicle_codes.sql");
  assert.match(piquersaSql, /Piquersa/);
  assert.match(piquersaSql, /Vehículos Especiales/);
  assert.match(piquersaSql, /description/);

  const movementsSql = read("supabase/sql/warehouse_item_movements.sql");
  assert.match(movementsSql, /create table if not exists public\.warehouse_item_movements/);
  assert.match(movementsSql, /item_source text not null/);
  assert.match(movementsSql, /movement_type text not null/);
  assert.match(movementsSql, /stock_before numeric/);
  assert.match(movementsSql, /stock_after numeric/);
  assert.match(movementsSql, /responsible text/);
  assert.match(movementsSql, /create or replace function public\.register_warehouse_item_movement/);
  assert.match(movementsSql, /update public\.warehouse_inventory/);
  assert.match(movementsSql, /Stock insuficiente/);
  assert.match(movementsSql, /Usuario con permiso bodega consulta movimientos/);
  assert.match(movementsSql, /p\.tipo = 'bodega'/);

  const auditSql = read("supabase/sql/warehouse_item_audit_logs.sql");
  assert.match(auditSql, /create table if not exists public\.warehouse_item_audit_logs/);
  assert.match(auditSql, /field_name text not null/);
  assert.match(auditSql, /Super admin registra auditoria de bodega/);

  assert.match(detail, /Historial de cambios/);
  assert.match(detail, /Movimientos y uso/);
  assert.match(detail, /QR operativo del artículo/);
  assert.match(detail, /api\.qrserver\.com/);
  assert.match(detail, /Stock antes/);
  assert.match(detail, /Responsable que recibe/);
  assert.match(detail, /Servicio \/ informe \/ OT/);
  assert.match(detail, /createWarehouseItemMovement/);
  assert.match(detail, /getWarehouseItemMovements/);
});

test("cotizador es modulo separado para repuestos y servicios", () => {
  const cotizador = read("src/app/vehiculos/cotizador/CotizadorHome.jsx");
  const quoteService = read("src/services/vehicleServiceQuoteService.js");
  const quotePdf = read("src/app/vehiculos/cotizador/vehicleServiceQuotePdf.js");
  const area = read("src/pages/AreaVehiculos.jsx");
  const sidebar = read("src/layouts/Sidebar.jsx");
  const text = read("src/constants/vehiculosText.js");

  assert.match(cotizador, /Cotizador independiente del configurador de equipos nuevos/);
  assert.match(cotizador, /getWarehouseInventory/);
  assert.match(cotizador, /getVehicleReferenceCatalog/);
  assert.match(cotizador, /Stock real de bodega/);
  assert.match(cotizador, /Referencia histórica/);
  assert.match(cotizador, /Agregar servicio manual/);
  assert.match(cotizador, /requieren aprobación/);
  assert.match(cotizador, /Datos de la oferta final/);
  assert.match(cotizador, /OfferPreview/);
  assert.match(cotizador, /Proforma No\./);
  assert.match(cotizador, /Descripción del CPC/);
  assert.match(cotizador, /12% IVA/);
  assert.match(cotizador, /Términos de negociación/);
  assert.match(cotizador, /Preparado por/);
  assert.match(cotizador, /Aprobado por/);
  assert.match(cotizador, /Aceptación Cliente/);
  assert.match(cotizador, /SignatureCanvas/);
  assert.match(cotizador, /SignatureField/);
  assert.match(cotizador, /OfferSignature/);
  assert.match(cotizador, /Borrar firma/);
  assert.match(cotizador, /toDataURL\("image\/png"\)/);
  assert.match(cotizador, /window\.print/);
  assert.match(cotizador, /Historial de cotizaciones/);
  assert.match(cotizador, /Guardar historial/);
  assert.match(cotizador, /Usar como base/);
  assert.match(cotizador, /saveVehicleServiceQuote/);
  assert.match(cotizador, /updateVehicleServiceQuote/);
  assert.match(cotizador, /getVehicleServiceQuoteHistory/);
  assert.match(cotizador, /Reintentar PDF/);
  assert.match(quoteService, /vehicle_service_quotes/);
  assert.match(quoteService, /generateVehicleServiceQuotePdfBlob/);
  assert.match(quoteService, /regenerateVehicleServiceQuotePdf/);
  assert.match(quoteService, /pdf_url/);
  assert.match(quoteService, /getVehicleServiceQuoteById/);
  assert.match(quotePdf, /new jsPDF/);
  assert.match(quotePdf, /autoTable/);
  assert.match(quotePdf, /generateVehicleServiceQuotePdfBlob/);
  assert.match(area, /SPECIAL_MODULE_KEYS\.cotizador/);
  assert.match(area, /VEHICULOS_TEXT\.cotizador/);
  assert.match(sidebar, /puedeUsarCotizador/);
  assert.match(sidebar, /\/vehiculos\/cotizador/);
  assert.match(text, /Cotizador de repuestos y servicios/);
});

test("PWA permite instalacion y accesos directos", () => {
  const layout = read("src/layouts/MainLayout.jsx");
  const manifest = read("public/manifest.json");
  const sw = read("public/sw.js");

  assert.match(layout, /beforeinstallprompt/);
  assert.match(layout, /Instalar app/);
  assert.match(manifest, /"shortcuts"/);
  assert.match(manifest, /"url": "\/operaciones\/bodega"/);
  assert.match(sw, /app-servicios-v14/);
});
