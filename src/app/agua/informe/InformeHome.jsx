import SyncStatus from "@/components/SyncStatus";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const informeTipos = {
  bomba: { label: "Informe de bombas" },
  valvula: { label: "Informe de válvulas" },
};

const getInformeTipo = (report) => report?.subtipo || report?.data?.tipoInforme || "bomba";

export default function InformeHome({
  tipo = null,
  area = "agua",
  areaLabel = "Agua",
  basePath = "/agua/informe",
  areaPath = "/area/agua",
}) {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const tipoConfig = tipo ? informeTipos[tipo] : null;

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  const [filters, setFilters] = useState({
    cliente: "",
    pedido: "",
    fecha: "",
    tecnico: "",
  });

  useEffect(() => {
    if (!user?.id) return;

    const loadReports = async () => {
      try {
        let query = supabase
          .from("registros")
          .select("*")
          .eq("area", area)
          .eq("tipo", "informe")
          .order("created_at", { ascending: false });

        if (!isSuperAdmin) {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error:", error);
          setReports([]);
          return;
        }

        const filteredByType = tipo
          ? (data || []).filter((report) => getInformeTipo(report) === tipo)
          : data || [];

        setReports(filteredByType);
      } catch (err) {
        console.error("Error cargando:", err);
        setReports([]);
      }
    };

    loadReports();
  }, [user?.id, isSuperAdmin, tipo, area]);

  const filteredReports = reports.filter((r) => {
    const cliente = r.data?.cliente?.toLowerCase() || "";

    const pedido =
      r.data?.pedidoDemanda?.toLowerCase() ||
      r.data?.referenciaContrato?.toLowerCase() ||
      r.data?.codInf?.toLowerCase() ||
      "";

    const tecnico = r.data?.tecnicoNombre?.toLowerCase() || "";
    const fecha = r.updated_at || r.created_at;

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      cliente.includes((filters.cliente || "").toLowerCase()) &&
      pedido.includes((filters.pedido || "").toLowerCase()) &&
      tecnico.includes((filters.tecnico || "").toLowerCase()) &&
      (!filters.fecha || (fecha && fecha.startsWith(filters.fecha)))
    );
  });

  const openReport = (report) => {
    const reportTipo = getInformeTipo(report);
    navigate(`${basePath}/${reportTipo}/${report.id}`);
  };

  const deleteReport = async (id) => {
    if (!user?.id) {
      alert("Usuario no autenticado");
      return;
    }

    if (!confirm("¿Eliminar este informe?")) return;

    let query = supabase
      .from("registros")
      .delete()
      .eq("id", id)
      .eq("area", area)
      .eq("tipo", "informe");

    if (!isSuperAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { error } = await query;

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          {tipoConfig?.label || `Informes ${areaLabel}`}
        </h1>

        <div className="flex items-center gap-3">
          <SyncStatus />

          <button
            onClick={() => navigate(areaPath)}
            className="border border-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 transition"
          >
            Volver
          </button>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
          Modo super administrador: estás viendo todos los informes de {areaLabel}.
        </div>
      )}

      <button
        onClick={() => navigate(tipo ? `${basePath}/${tipo}/nuevo` : `${basePath}/nuevo`)}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg transition"
      >
        {tipoConfig ? `Nuevo ${tipoConfig.label}` : "Nuevo informe"}
      </button>

      <div className="flex gap-2">
        {["todos", "borrador", "completado"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border rounded text-sm ${
              filter === f
                ? "bg-gray-200 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={filters.cliente}
          onChange={(e) =>
            setFilters((f) => ({ ...f, cliente: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />

        <input
          type="text"
          placeholder="Pedido / Código..."
          value={filters.pedido}
          onChange={(e) =>
            setFilters((f) => ({ ...f, pedido: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />

        <input
          type="date"
          value={filters.fecha}
          onChange={(e) =>
            setFilters((f) => ({ ...f, fecha: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />

        <input
          type="text"
          placeholder="Técnico..."
          value={filters.tecnico}
          onChange={(e) =>
            setFilters((f) => ({ ...f, tecnico: e.target.value }))
          }
          className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded text-sm"
        />
      </div>

      <div className="space-y-3">
        {filteredReports.length === 0 && (
          <div className="bg-gray-50 border rounded-xl p-6 text-gray-500">
            Sin registros
          </div>
        )}

        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="bg-gray-50 border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3"
          >
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">
                {r.data?.cliente || "Sin cliente"}
              </p>

              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <span>
                  Pedido:{" "}
                  <strong className="text-gray-800">
                    {r.data?.pedidoDemanda || "—"}
                  </strong>
                </span>

                <span>
                  Informe:{" "}
                  <strong className="text-gray-800">
                    {r.data?.codInf || "—"}
                  </strong>
                </span>

                <span>
                  Tipo:{" "}
                  <strong className="text-gray-800">
                    {informeTipos[getInformeTipo(r)]?.label || getInformeTipo(r)}
                  </strong>
                </span>
              </div>

              <p className="text-xs text-gray-500 italic">
                {r.data?.referenciaContrato ||
                  r.data?.descripcion ||
                  "Sin descripción"}
              </p>

              <div className="flex flex-wrap justify-between items-center text-xs pt-1 gap-3">
                <span className="text-gray-500">
                  {new Date(r.updated_at || r.created_at).toLocaleString()}
                </span>

               {isSuperAdmin && (
  <span className="text-[11px] text-gray-500">
    Usuario: {r.data?.tecnicoNombre || "Sin técnico"}
  </span>
)}

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    r.estado === "completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {r.estado === "completado" ? "Completado" : "Borrador"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 text-sm shrink-0">
              <button
                onClick={() => openReport(r)}
                className="text-blue-600 hover:underline"
              >
                Abrir
              </button>

              {r.estado === "completado" && (
                <button
                  onClick={() => navigate(`${basePath}/pdf/${r.id}`)}
                  className="text-green-600 hover:underline font-semibold"
                >
                  PDF
                </button>
              )}

              <button
                onClick={() => deleteReport(r.id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
