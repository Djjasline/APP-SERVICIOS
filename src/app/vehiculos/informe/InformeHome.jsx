import SyncStatus from "@/components/SyncStatus";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

  // 🔥 FIX: agregado tecnico
  const [filters, setFilters] = useState({
    cliente: "",
    pedido: "",
    fecha: "",
    tecnico: "",
  });

  /* ===========================
     CARGAR DATA
  =========================== */
  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data, error } = await supabase
          .from("registros")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error:", error);
          setReports([]);
          return;
        }

        setReports(data || []);
      } catch (err) {
        console.error("Error cargando:", err);
        setReports([]);
      }
    };

    loadReports();
  }, []);

  /* ===========================
     FILTROS
  =========================== */
  const filteredReports = reports.filter((r) => {
    const cliente = r.data?.cliente?.toLowerCase() || "";
    const pedido =
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

  /* ===========================
     ABRIR
  =========================== */
  const openReport = (report) => {
    navigate(`/informe/${report.id}`);
  };

  /* ===========================
     ELIMINAR
  =========================== */
  const deleteReport = async (id) => {
    if (!confirm("¿Eliminar este informe?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          Informe general
        </h1>

        <div className="flex items-center gap-3">
          <SyncStatus />

          <button
            onClick={() => navigate("/")}
            className="border border-gray-300 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 transition"
          >
            Volver
          </button>
        </div>
      </div>

      {/* NUEVO */}
      <button
        onClick={() => navigate("/informe/nuevo")}
        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg transition"
      >
        Nuevo informe
      </button>

      {/* FILTRO ESTADO */}
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

      {/* FILTROS INPUT */}
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

      {/* LISTADO */}
      <div className="space-y-3">

        {filteredReports.length === 0 && (
          <div className="bg-gray-50 border rounded-xl p-6 text-gray-500">
            Sin registros
          </div>
        )}

        {filteredReports.map((r) => (
          <div
            key={r.id}
            className="bg-gray-50 border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
  <p className="font-semibold text-gray-900">
    {r.data?.cliente || "Sin cliente"}
  </p>

  {/* 🔥 FIX PEDIDO */}
  <p className="text-xs text-gray-600">
  Pedido:{" "}
  <strong>
    {r.data?.pedidoDemanda ||
      r.data?.referenciaContrato ||
      r.data?.codInf ||
      "—"}
  </strong>
</p>

  <p className="text-xs text-gray-500">
    {new Date(
      r.updated_at || r.created_at
    ).toLocaleString()}
  </p>

  <p className="text-xs text-gray-600">
    Estado:{" "}
    <strong className="text-gray-900">
      {r.estado === "completado"
        ? "Completado"
        : "Borrador"}
    </strong>
  </p>
</div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => openReport(r)}
                className="text-blue-600 hover:underline"
              >
                Abrir
              </button>

              {r.estado === "completado" && (
                <button
                  onClick={() => navigate(`/informe/pdf/${r.id}`)}
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
