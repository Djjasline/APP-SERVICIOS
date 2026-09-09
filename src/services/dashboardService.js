import { supabase } from "@/lib/supabase";

const ZERO_METRICS = {
  reportsToday: 0,
  reportsThisWeek: 0,
  draftReports: 0,
  unreadNotifications: 0,
  quotesThisWeek: 0,
  quotesPdfPending: 0,
  warehouseItems: 0,
  lowStockItems: 0,
  pendingSurveys: 0,
};

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

async function safeQuery(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.warn("No se pudo cargar una sección del dashboard:", error?.message || error);
    return fallback;
  }
}

async function countRows(table, applyFilters = (query) => query) {
  const query = applyFilters(supabase.from(table).select("id", { count: "exact", head: true }));
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

async function listRows(table, columns, applyFilters = (query) => query) {
  const query = applyFilters(supabase.from(table).select(columns));
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
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

function getRecordUrl(record) {
  if (record.area === "operaciones" && record.tipo === "recepcion") return `/operaciones/recepcion/${record.id}`;
  if (record.area === "operaciones" && record.tipo === "registro") return `/operaciones/registro/${record.id}`;
  if (record.area === "operaciones" && record.tipo === "liberacion") return `/operaciones/liberacion/${record.id}`;
  if (record.area === "agua") return `/agua/informe/${record.id}`;
  if (record.area === "industria") return `/industria/informe/${record.id}`;
  if (record.area === "petroleo") return `/petroleo/informe/${record.id}`;
  if (record.tipo === "capacitacion") return `/vehiculos/capacitacion/${record.id}`;
  return `/vehiculos/informe/${record.id}`;
}

function getRecordSummary(record) {
  const data = record.data || {};
  return data.cliente || data.empresa || data.equipo || data.conductor || data.codInf || data.codigo || record.estado || "Sin referencia";
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
    date: normalizeDate(record.updated_at || record.created_at),
    url: getRecordUrl(record),
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
      url: "/vehiculos/informe",
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

export async function getGeneralDashboard({ email } = {}) {
  const today = startOfToday();
  const week = startOfWeek();
  const userEmail = String(email || "").trim();

  const [
    reportsToday,
    reportsThisWeek,
    draftReports,
    recentReports,
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
    safeQuery(() => countRows("registros", (query) => query.gte("created_at", today)), 0),
    safeQuery(() => countRows("registros", (query) => query.gte("created_at", week)), 0),
    safeQuery(() => countRows("registros", (query) => query.eq("estado", "borrador")), 0),
    safeQuery(
      () =>
        listRows("registros", "id, area, tipo, subtipo, estado, data, created_at, updated_at", (query) =>
          query.order("updated_at", { ascending: false }).limit(8)
        ),
      []
    ),
    userEmail
      ? safeQuery(
          () => countRows("notifications", (query) => query.ilike("recipient_email", userEmail).eq("read", false)),
          0
        )
      : 0,
    userEmail
      ? safeQuery(
          () =>
            listRows("notifications", "id, title, message, read, created_at", (query) =>
              query.ilike("recipient_email", userEmail).order("created_at", { ascending: false }).limit(5)
            ),
          []
        )
      : [],
    safeQuery(() => countRows("vehicle_service_quotes", (query) => query.gte("created_at", week)), 0),
    safeQuery(() => countRows("vehicle_service_quotes", (query) => query.eq("status", "pdf_pendiente")), 0),
    safeQuery(
      () =>
        listRows("vehicle_service_quotes", "id, quote_number, client, reference, status, created_at, updated_at", (query) =>
          query.order("updated_at", { ascending: false }).limit(5)
        ),
      []
    ),
    safeQuery(() => countRows("warehouse_inventory"), 0),
    safeQuery(
      () =>
        listRows("warehouse_inventory", "id, product_code, description, physical_stock, stock_minimum, updated_at", (query) =>
          query.not("stock_minimum", "is", null).order("updated_at", { ascending: false }).limit(200)
        ),
      []
    ),
    safeQuery(
      () =>
        listRows("warehouse_item_movements", "id, movement_type, related_party, service_ref, document_ref, notes, created_at", (query) =>
          query.order("created_at", { ascending: false }).limit(6)
        ),
      []
    ),
    safeQuery(
      () => countRows("customer_satisfaction_surveys", (query) => query.in("status", ["pendiente", "enviada", "requiere_seguimiento"])),
      0
    ),
  ]);

  const lowStockRows = lowStockSourceRows
    .filter((row) => Number(row.physical_stock) <= Number(row.stock_minimum))
    .slice(0, 6);

  const metrics = {
    ...ZERO_METRICS,
    reportsToday,
    reportsThisWeek,
    draftReports,
    unreadNotifications,
    quotesThisWeek,
    quotesPdfPending,
    warehouseItems,
    lowStockItems: lowStockRows.length,
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
    loadedAt: new Date().toISOString(),
  };
}
