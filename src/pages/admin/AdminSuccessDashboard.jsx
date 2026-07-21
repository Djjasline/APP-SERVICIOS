import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightFromLine,
  CalendarDays,
  CheckSquare,
  Clock3,
  Download,
  FileText,
  ShieldCheck,
  Star,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";

const FORM_AREA_META = {
  vehiculos: { label: "Vehículos Especiales", color: "#0f55ff" },
  agua: { label: "Agua y Saneamiento", color: "#1e88e5" },
  industria: { label: "Industria", color: "#64748b" },
  operaciones: { label: "Operaciones", color: "#16a34a" },
  petroleo: { label: "Petróleo y Energía", color: "#f97316" },
};

const RESOURCE_AREA = "repositorios";

const STATUS_META = {
  completado: { label: "Completados", color: "#16a34a" },
  borrador: { label: "Borradores", color: "#f59e0b" },
  salida: { label: "Salidas", color: "#7c3aed" },
};

const PERIODS = [
  { value: "all", label: "Todo el periodo" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
  { value: "180", label: "Últimos 180 días" },
];

const emptyCounts = () => ({ completado: 0, borrador: 0, salida: 0, total: 0 });

function getRecordDate(record) {
  return record.updated_at || record.created_at || null;
}

function getStatus(record) {
  if (record.estado === "completado") return "completado";
  if (record.estado === "salida") return "salida";
  return "borrador";
}

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function shortDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

function fullDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
}

function percent(value, total) {
  if (!total) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-EC").format(value || 0);
}

function getPeriodStart(period) {
  if (period === "all") return null;
  const days = Number(period);
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildLinePath(points, width, height) {
  if (!points.length) return "";
  const max = Math.max(...points.map((item) => item.count), 1);
  return points
    .map((item, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - (item.count / max) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminSuccessDashboard() {
  const { isLight } = useTheme();
  const [records, setRecords] = useState([]);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data, error: loadError } = await supabase
          .from("registros")
          .select("id, user_id, area, tipo, subtipo, estado, data, created_at, updated_at")
          .order("created_at", { ascending: true });

        if (loadError) throw loadError;
        setRecords(data || []);
      } catch (err) {
        console.error("Error cargando dashboard administrativo:", err);
        setError("No se pudo cargar el dashboard administrativo.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const dashboard = useMemo(() => {
    const start = getPeriodStart(period);
    const filtered = records.filter((record) => {
      const value = getRecordDate(record);
      if (!value) return false;
      if (!start) return true;
      return new Date(value) >= start;
    });

    const formRecords = filtered.filter((record) => record.area !== RESOURCE_AREA && record.tipo !== "uso_recurso");
    const resourceRecords = filtered.filter((record) => record.area === RESOURCE_AREA || record.tipo === "uso_recurso");

    const totals = emptyCounts();
    const areaCounts = Object.fromEntries(Object.keys(FORM_AREA_META).map((area) => [area, emptyCounts()]));
    const dailyMap = new Map();

    formRecords.forEach((record) => {
      if (!areaCounts[record.area]) return;

      const status = getStatus(record);
      totals[status] += 1;
      totals.total += 1;
      areaCounts[record.area][status] += 1;
      areaCounts[record.area].total += 1;

      const key = dateKey(getRecordDate(record));
      if (key) dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    });

    const resourceUsers = new Set(resourceRecords.map((record) => record.user_id).filter(Boolean));
    const resourceMap = new Map();

    resourceRecords.forEach((record) => {
      const label = record.data?.recurso || record.subtipo || "Recurso";
      resourceMap.set(label, (resourceMap.get(label) || 0) + 1);
    });

    const resourceRows = [...resourceMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    const daily = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const dates = formRecords.map((record) => getRecordDate(record)).filter(Boolean).sort();
    const firstDate = dates[0] || null;
    const lastDate = dates[dates.length - 1] || null;
    const periodDays = firstDate && lastDate
      ? Math.max(1, Math.ceil((new Date(lastDate) - new Date(firstDate)) / 86400000) + 1)
      : 0;
    const bestDay = daily.reduce((best, item) => (item.count > (best?.count || 0) ? item : best), null);

    return {
      records: formRecords,
      totals,
      areaRows: Object.entries(areaCounts).map(([area, counts]) => ({ area, ...FORM_AREA_META[area], ...counts })),
      resourceUsage: {
        total: resourceRecords.length,
        users: resourceUsers.size,
        rows: resourceRows,
      },
      daily,
      firstDate,
      lastDate,
      periodDays,
      bestDay,
      activeAreas: Object.values(areaCounts).filter((counts) => counts.total > 0).length,
      averageDaily: periodDays ? totals.total / periodDays : 0,
    };
  }, [records, period]);

  const exportReport = () => {
    const rows = [
      ["Caso de éxito APP SERVICIOS ASTAP"],
      ["Periodo", `${fullDate(dashboard.firstDate)} - ${fullDate(dashboard.lastDate)}`],
      ["Informes totales", dashboard.totals.total],
      ["Completados", dashboard.totals.completado],
      ["Borradores", dashboard.totals.borrador],
      ["Salidas", dashboard.totals.salida],
      ["Accesos a Recursos", dashboard.resourceUsage.total],
      ["Usuarios en Recursos", dashboard.resourceUsage.users],
      [],
      ["Área", "Completados", "Borradores", "Salidas", "Total", "Participación"],
      ...dashboard.areaRows.map((row) => [
        row.label,
        row.completado,
        row.borrador,
        row.salida,
        row.total,
        percent(row.total, dashboard.totals.total),
      ]),
    ];
    downloadCsv("dashboard-app-servicios-astap.csv", rows);
  };

  const cardClass = isLight ? "bg-white border-slate-200 text-slate-900" : "bg-white/10 border-white/10 text-white";

  if (loading) {
    return <div className={`${cardClass} rounded-3xl border p-6 shadow`}>Cargando dashboard administrativo...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 shadow">{error}</div>;
  }

  return (
    <section className={`${cardClass} rounded-3xl border p-6 shadow space-y-5`}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-blue-700 md:text-4xl">
            CASO DE ÉXITO APP SERVICIOS ASTAP
          </h2>
          <p className={isLight ? "text-slate-600" : "text-white/70"}>
            Transformación digital que impulsa eficiencia, control y productividad en las operaciones.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="text-sm font-semibold text-slate-700">
            <span className="mb-1 flex items-center gap-2"><CalendarDays size={16} /> Periodo seleccionado</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-full rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm"
            >
              {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={exportReport}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            <Download size={16} /> Exportar reporte
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard icon={FileText} label="Informes totales" value={dashboard.totals.total} detail="100% del total" color="bg-blue-600" />
        <MetricCard icon={CheckSquare} label="Completados" value={dashboard.totals.completado} detail={`${percent(dashboard.totals.completado, dashboard.totals.total)} del total`} color="bg-green-600" />
        <MetricCard icon={FileText} label="Borradores" value={dashboard.totals.borrador} detail={`${percent(dashboard.totals.borrador, dashboard.totals.total)} del total`} color="bg-amber-500" />
        <MetricCard icon={ArrowRightFromLine} label="Salidas" value={dashboard.totals.salida} detail={`${percent(dashboard.totals.salida, dashboard.totals.total)} del total`} color="bg-violet-600" />
        <MetricCard icon={Users} label="Áreas activas" value={dashboard.activeAreas} detail="En uso de la plataforma" color="bg-blue-700" />
        <MetricCard icon={Users} label="Usuarios Recursos" value={dashboard.resourceUsage.users} detail={`${formatNumber(dashboard.resourceUsage.total)} accesos`} color="bg-purple-700" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1.15fr_0.85fr]">
        <Panel title="1. Distribución por área y estado">
          <AreaTable rows={dashboard.areaRows} total={dashboard.totals.total} />
        </Panel>
        <Panel title="2. Evolución de informes en el tiempo">
          <LineChart data={dashboard.daily} />
        </Panel>
        <Panel title="3. Distribución por estado">
          <DonutChart
            items={[
              { label: STATUS_META.completado.label, value: dashboard.totals.completado, color: STATUS_META.completado.color },
              { label: STATUS_META.borrador.label, value: dashboard.totals.borrador, color: STATUS_META.borrador.color },
              { label: STATUS_META.salida.label, value: dashboard.totals.salida, color: STATUS_META.salida.color },
            ]}
            total={dashboard.totals.total}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_0.9fr_1.15fr_0.8fr]">
        <Panel title="4. Uso de Recursos">
          <ResourceUsageTable usage={dashboard.resourceUsage} />
        </Panel>
        <Panel title="5. Informes por área">
          <DonutChart items={dashboard.areaRows.map((row) => ({ label: row.label, value: row.total, color: row.color }))} total={dashboard.totals.total} />
        </Panel>
        <Panel title="6. Actividad diaria de informes">
          <BarChart data={dashboard.daily} />
        </Panel>
        <Panel title="7. Resumen de impacto">
          <ImpactList />
        </Panel>
      </div>

      <div className="grid gap-4 rounded-2xl border border-blue-100 bg-white p-5 text-slate-900 md:grid-cols-[1fr_1.4fr]">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Trophy size={30} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-blue-800">8. Conclusión</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              La App Servicios ASTAP permite digitalizar y estandarizar la gestión de informes técnicos, logrando mayor control, eficiencia y trazabilidad en las operaciones.
            </p>
          </div>
        </div>
        <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
          <SummaryItem icon={CalendarDays} label="Periodo analizado" value={`${fullDate(dashboard.firstDate)} - ${fullDate(dashboard.lastDate)}`} />
          <SummaryItem icon={CalendarDays} label="Días del periodo" value={`${dashboard.periodDays} días`} />
          <SummaryItem icon={Timer} label="Promedio diario" value={`${dashboard.averageDaily.toFixed(2)} informes/día`} />
          <SummaryItem icon={Star} label="Mejor día" value={dashboard.bestDay ? `${fullDate(dashboard.bestDay.date)} (${dashboard.bestDay.count})` : "-"} />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color} text-white`}>
          <Icon size={30} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-blue-700">{label}</p>
          <p className="text-3xl font-black text-slate-900">{formatNumber(value)}</p>
          <p className="text-xs text-slate-600">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-black uppercase text-blue-900">{title}</h3>
      {children}
    </div>
  );
}

function AreaTable({ rows, total }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-xs text-slate-700">
        <thead className="text-[10px] uppercase text-blue-900">
          <tr>
            <th className="py-2 pr-3">Área</th>
            <th className="py-2 pr-3 text-green-600">Completados</th>
            <th className="py-2 pr-3 text-orange-600">Borradores</th>
            <th className="py-2 pr-3 text-violet-600">Salidas</th>
            <th className="py-2 pr-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.area} className="border-t border-slate-100">
              <td className="py-2 pr-3 font-medium">{row.label}</td>
              <td className="py-2 pr-3 text-green-600">{row.completado}</td>
              <td className="py-2 pr-3 text-orange-600">{row.borrador}</td>
              <td className="py-2 pr-3 text-violet-600">{row.salida}</td>
              <td className="py-2 pr-3 font-bold">{row.total} <span className="font-normal text-slate-400">{percent(row.total, total)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourceUsageTable({ usage }) {
  const rows = usage?.rows || [];

  return (
    <div className="space-y-4 text-sm text-slate-700">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-purple-50 p-3">
          <p className="text-[10px] font-black uppercase text-purple-700">Usuarios</p>
          <p className="text-2xl font-black text-slate-900">{formatNumber(usage?.users)}</p>
        </div>
        <div className="rounded-xl bg-purple-50 p-3">
          <p className="text-[10px] font-black uppercase text-purple-700">Accesos</p>
          <p className="text-2xl font-black text-slate-900">{formatNumber(usage?.total)}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500">
          Sin accesos a recursos registrados en el periodo.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.slice(0, 5).map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2">
              <span className="truncate text-xs font-semibold text-slate-700">{row.label}</span>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                {formatNumber(row.count)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LineChart({ data }) {
  const width = 420;
  const height = 170;
  const path = buildLinePath(data, width, height);
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line key={ratio} x1="0" x2={width} y1={height * ratio} y2={height * ratio} stroke="#e2e8f0" />
        ))}
        <path d={path} fill="none" stroke="#0f55ff" strokeWidth="2.5" />
        {data.map((item, index) => {
          const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
          const y = height - (item.count / max) * (height - 12) - 6;
          return <circle key={item.date} cx={x} cy={y} r="3" fill="#0f55ff" />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>{shortDate(data[0]?.date)}</span>
        <span>{shortDate(data[Math.floor(data.length / 2)]?.date)}</span>
        <span>{shortDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div className="flex h-56 items-end gap-1 border-b border-slate-200 px-2">
      {data.slice(-80).map((item) => (
        <div key={item.date} title={`${fullDate(item.date)}: ${item.count}`} className="flex flex-1 items-end">
          <div className="w-full rounded-t bg-blue-600" style={{ height: `${Math.max(3, (item.count / max) * 190)}px` }} />
        </div>
      ))}
    </div>
  );
}

function DonutChart({ items, total }) {
  let offset = 25;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row">
      <svg viewBox="0 0 100 100" className="h-48 w-48 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        {items.map((item) => {
          const length = total ? (item.value / total) * circumference : 0;
          const dash = `${length} ${circumference - length}`;
          const circle = (
            <circle
              key={item.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
          );
          offset -= length;
          return circle;
        })}
      </svg>
      <div className="space-y-2 text-sm">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-slate-500">{item.value} ({percent(item.value, total)})</span>
          </div>
        ))}
        <p className="pt-2 text-center font-semibold text-blue-900">Total: {formatNumber(total)} informes</p>
      </div>
    </div>
  );
}

function ImpactList() {
  const items = [
    { icon: Clock3, title: "Mayor eficiencia operativa", text: "Reducción de tiempos en elaboración y entrega de informes.", color: "text-green-600" },
    { icon: ShieldCheck, title: "Ahorro en costos", text: "Menos uso de papel, impresión y almacenamiento físico.", color: "text-orange-600" },
    { icon: FileText, title: "Digitalización total", text: "Información centralizada y accesible para administración.", color: "text-violet-600" },
    { icon: Users, title: "Control y trazabilidad", text: "Seguimiento en tiempo real del estado de cada informe.", color: "text-blue-600" },
  ];
  return (
    <div className="divide-y divide-slate-100">
      {items.map(({ icon: Icon, title, text, color }) => (
        <div key={title} className="flex gap-3 py-3 first:pt-0">
          <Icon className={color} size={26} />
          <div>
            <p className={`text-sm font-bold ${color}`}>{title}</p>
            <p className="text-xs text-slate-600">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="border-slate-200 sm:border-r sm:pr-3 last:border-r-0">
      <div className="flex items-center gap-2 text-xs text-blue-900"><Icon size={18} /> {label}</div>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
