import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardModulo from "@/components/CardModulo";
import ServiceMenuFrame from "@/components/ServiceMenuFrame";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { ClipboardCheck, ClipboardList, FileCheck2, Gauge, Layers3 } from "lucide-react";
import { PROTOCOLO_MAN_BASE_PATH, PROTOCOLO_MAN_BY_ID, PROTOCOLO_MAN_TIPO, PROTOCOLOS_MAN } from "./protocolosManConfig";

const ICONS = {
  recepcion: ClipboardList,
  entrega: FileCheck2,
  "semanal-proveedor": Layers3,
  "avance-cronograma": Gauge,
};

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ProtocoloManHome() {
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRecords() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("registros")
          .select("id, subtipo, estado, data, created_at, updated_at")
          .eq("area", "operaciones")
          .eq("tipo", PROTOCOLO_MAN_TIPO)
          .order("updated_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        if (mounted) setRecords(data || []);
      } catch (error) {
        console.error("Error cargando protocolos MAN:", error);
        if (mounted) setRecords([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRecords();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ServiceMenuFrame className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">Solo superadministrador</p>
          <h1 className={`mt-1 text-2xl font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Protocolo MAN</h1>
          <p className={`mt-1 max-w-3xl text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Formularios de recepción, entrega, informe semanal y avance basado en cronograma para vehículos y equipos.
          </p>
        </div>
        <button type="button" onClick={() => navigate("/operaciones")} className="btn-volver-orange">
          Volver
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PROTOCOLOS_MAN.map((protocol) => {
          const Icon = ICONS[protocol.id] || ClipboardCheck;
          return (
            <CardModulo
              key={protocol.id}
              titulo={protocol.title}
              descripcion={protocol.description}
              ruta={`${PROTOCOLO_MAN_BASE_PATH}/${protocol.id}`}
              color="bg-blue-700"
              icono={<Icon size={20} />}
              badge={protocol.code}
            />
          );
        })}
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/95 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registros recientes</h2>
            <p className="text-sm text-slate-500">Últimos borradores y formularios cerrados de este módulo.</p>
          </div>
        </div>

        {loading ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Cargando registros...</p>
        ) : records.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Aún no hay formularios guardados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-blue-900">
                <tr>
                  <th className="px-3 py-2">Formulario</th>
                  <th className="px-3 py-2">Proyecto</th>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {records.map((record) => {
                  const protocol = PROTOCOLO_MAN_BY_ID[record.subtipo];
                  const values = record.data?.values || {};
                  return (
                    <tr key={record.id}>
                      <td className="px-3 py-2 font-semibold text-slate-900">{protocol?.code || record.subtipo}</td>
                      <td className="px-3 py-2">{values.proyecto || "-"}</td>
                      <td className="px-3 py-2">{values.cliente || "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${record.estado === "completado" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {record.estado === "completado" ? "Completado" : "Borrador"}
                        </span>
                      </td>
                      <td className="px-3 py-2">{formatDate(record.updated_at || record.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ServiceMenuFrame>
  );
}
