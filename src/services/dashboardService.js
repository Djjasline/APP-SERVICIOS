import { supabase } from "@/lib/supabase";
import { getDashboardRecordPreviewUrl } from "@/utils/dashboardRecordPreview.mjs";
import { captureDashboardQuery, fetchAllById } from "@/utils/dashboardData.mjs";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function startOfWeek() {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

async function countRows(table, applyFilters = (query) => query) {
  const query = applyFilters(supabase.from(table).select("id", { count: "exact", head: true }));
  const { count, error } = await query;
  if (error) throw error;
  if (count == null) throw new Error("No se recibió el total de la consulta.");
  return count;
}

async function listAllRows(table, columns, applyFilters = (query) => query) {
  return fetchAllById(async (cursor) => {
    let query = applyFilters(supabase.from(table).select(columns)).order("id", { ascending: true }).limit(200);
    if (cursor !== null) query = query.gt("id", cursor);
    const { data, error } = await query;
    if (error) throw error;
    if (!Array.isArray(data)) throw new Error("No se recibió la página solicitada.");
    return data;
  });
}

async function listRows(table, columns, applyFilters = (query) => query) {
  const query = applyFilters(supabase.from(table).select(columns));
  const { data, error } = await query;
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error("No se recibió la lista solicitada.");
  return data;
}

function getRecordLabel(record) {
  if (record.tipo === "capacitacion") return "Informe de capacitación";
  if (record.tipo === "recepcion") return "Recepción vehicular";
  if (record.tipo === "registro") return "Registro de herramientas";
  if (record.tipo === "liberacion") return "Liberación vehicular";
  if (record.tipo === "inspeccion") return "Inspección";
  if (record.tipo === "mantenimiento") return "Mantenimiento";
  return "Informe técnico";
}

function getTextValue(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value !== "object") return "";

  return [value.placa, value.marca, value.modelo, value.serie, value.vin, value.horometro, value.kilometraje]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function getRecordSummary(record) {
  const data = record.data || {};
  return [data.cliente, data.empresa, data.equipo, data.conductor, data.codInf, data.codigo, record.estado]
    .map(getTextValue)
    .find(Boolean) || "Sin referencia";
}

function normalizeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

function buildActivity({ reports, quotes, movements, notifications }) {
  const reportItems = reports.map((record) => ({
    id: `record-${record.id}`,
    type: "registro",
    title: getRecordLabel(record),
    detail: getRecordSummary(record),
    date: normalizeDate(record.created_at || record.updated_at),
    url: getDashboardRecordPreviewUrl(record),
  }));

  const quoteItems = quotes.map((quote) => ({
    id: `quote-${quote.id}`,
    type: "cotizacion",
    title: "Cotización de servicios",
    detail: quote.client || quote.quote_number || quote.reference || "Sin cliente",
    date: normalizeDate(quote.updated_at || quote.created_at),
    url: quote.id ? `/vehiculos/cotizador` : "/vehiculos/cotizador",
  }));

  const movementItems = movements.map((movement) => ({
    id: `movement-${movement.id}`,
    type: "bodega",
    title: `Movimiento de bodega: ${movement.movement_type || "registro"}`,
    detail: movement.document_ref || movement.related_party || movement.service_ref || movement.notes || "Sin referencia",
    date: normalizeDate(movement.created_at),
    url: "/operaciones/bodega",
  }));

  const notificationItems = notifications.map((notification) => ({
    id: `notification-${notification.id}`,
    type: "notificacion",
    title: notification.title || "Notificación",
    detail: notification.message || "Sin detalle",
    date: normalizeDate(notification.created_at),
    url: "/notifications",
  }));

  return [...reportItems, ...quoteItems, ...movementItems, ...notificationItems]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);
}

function buildAlerts(metrics, lowStockRows) {
  const alerts = [];

  if (metrics.unreadNotifications > 0) {
    alerts.push({
      id: "notifications",
      title: "Notificaciones sin leer",
      detail: `${metrics.unreadNotifications} aviso(s) pendiente(s).`,
      url: "/notifications",
      tone: "blue",
    });
  }

  if (metrics.draftReports > 0) {
    alerts.push({
      id: "drafts",
      title: "Informes en borrador",
      detail: `${metrics.draftReports} registro(s) visibles siguen pendientes de completar.`,
      section: "dashboard-area-status",
      tone: "amber",
    });
  }

  if (metrics.lowStockItems > 0) {
    const sample = lowStockRows[0];
    alerts.push({
      id: "low-stock",
      title: "Stock bajo en bodega",
      detail: sample ? `${sample.product_code || "Artículo"}: ${sample.description || "sin descripción"}` : `${metrics.lowStockItems} artículo(s) bajo mínimo.`,
      url: "/operaciones/bodega",
      tone: "red",
    });
  }

  if (metrics.quotesPdfPending > 0) {
    alerts.push({
      id: "quotes-pdf",
      title: "Cotizaciones con PDF pendiente",
      detail: `${metrics.quotesPdfPending} cotización(es) requieren regenerar PDF.`,
      url: "/vehiculos/cotizador",
      tone: "violet",
    });
  }

  if (metrics.pendingSurveys > 0) {
    alerts.push({
      id: "surveys",
      title: "Encuestas pendientes",
      detail: `${metrics.pendingSurveys} encuesta(s) esperan envío o respuesta.`,
      url: "/vehiculos/encuesta-satisfaccion",
      tone: "emerald",
    });
  }

  return alerts.slice(0, 5);
}

export async function getGeneralDashboard({ email, technicianKeys = [], reportRecords = [], draftReports = 0 } = {}) {
  const today = startOfToday();
  const week = startOfWeek();
  const userEmail = String(email || "").trim();
  const activeTechnicianKeys = Array.isArray(technicianKeys) ? technicianKeys.filter(Boolean) : [];
  const hasTechnicianFilter = activeTechnicianKeys.length > 0;

  const errors = [];
  const reportsToday = reportRecords.filter((record) => record.created_at && new Date(record.created_at) >= new Date(today)).length;
  const reportsThisWeek = reportRecords.filter((record) => record.created_at && new Date(record.created_at) >= new Date(week)).length;
  const recentReports = [...reportRecords]
    .sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0))
    .slice(0, 8);

  const [
    unreadNotifications,
    recentNotifications,
    quotesThisWeek,
    quotesPdfPending,
    recentQuotes,
    warehouseItems,
    lowStockSourceRows,
    recentMovements,
    pendingSurveys,
  ] = await Promise.all([
    userEmail && !hasTechnicianFilter
      ? captureDashboardQuery(
          () => countRows("notifications", (query) => query.ilike("recipient_email", userEmail).eq("read", false)),
          null, errors, "notificaciones"
        )
      : null,
    userEmail && !hasTechnicianFilter
      ? captureDashboardQuery(
          () =>
            listRows("notifications", "id, title, message, read, created_at", (query) =>
              query.ilike("recipient_email", userEmail).order("created_at", { ascending: false }).limit(5)
            ),
          [], errors, "actividad de notificaciones"
        )
      : [],
    hasTechnicianFilter ? null : captureDashboardQuery(() => countRows("vehicle_service_quotes", (query) => query.gte("created_at", week)), null, errors, "cotizaciones de la semana"),
    hasTechnicianFilter ? null : captureDashboardQuery(() => countRows("vehicle_service_quotes", (query) => query.eq("status", "pdf_pendiente")), null, errors, "PDF de cotizaciones"),
    hasTechnicianFilter
      ? []
      : captureDashboardQuery(
          () =>
            listRows("vehicle_service_quotes", "id, quote_number, client, reference, status, created_at, updated_at", (query) =>
              query.order("updated_at", { ascending: false }).limit(5)
            ),
          [], errors, "actividad de cotizaciones"
        ),
    hasTechnicianFilter ? null : captureDashboardQuery(() => countRows("warehouse_inventory"), null, errors, "inventario de bodega"),
    hasTechnicianFilter
      ? null
      : captureDashboardQuery(
          () =>
            listAllRows("warehouse_inventory", "id, product_code, description, physical_stock, stock_minimum, updated_at", (query) =>
              query.not("stock_minimum", "is", null)
            ),
          null, errors, "stock mínimo"
        ),
    hasTechnicianFilter
      ? []
      : captureDashboardQuery(
          () =>
            listRows("warehouse_item_movements", "id, movement_type, related_party, service_ref, document_ref, notes, created_at", (query) =>
              query.order("created_at", { ascending: false }).limit(6)
            ),
          [], errors, "movimientos de bodega"
        ),
    hasTechnicianFilter
      ? null
      : captureDashboardQuery(
          () => countRows("customer_satisfaction_surveys", (query) => query.in("status", ["pendiente", "enviada", "requiere_seguimiento"])),
          null, errors, "encuestas"
        ),
  ]);

  const allLowStockRows = lowStockSourceRows?.filter((row) => Number(row.physical_stock) <= Number(row.stock_minimum));
  const lowStockRows = allLowStockRows?.slice(0, 6) || [];

  const metrics = {
    reportsToday,
    reportsThisWeek,
    draftReports,
    unreadNotifications,
    quotesThisWeek,
    quotesPdfPending,
    warehouseItems,
    lowStockItems: allLowStockRows?.length ?? null,
    pendingSurveys,
  };

  return {
    metrics,
    activity: buildActivity({
      reports: recentReports,
      quotes: recentQuotes,
      movements: recentMovements,
      notifications: recentNotifications,
    }),
    alerts: buildAlerts(metrics, lowStockRows),
    lowStockItems: lowStockRows,
    errors,
    loadedAt: new Date().toISOString(),
  };
}
