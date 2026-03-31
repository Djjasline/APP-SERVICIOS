import SyncStatus from "@/components/SyncStatus";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InformeHome() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("todos");

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

  // 🎯 FILTRO
const [filters, setFilters] = useState({
  cliente: "",
  pedido: "",
  fecha: "",
});

const filteredReports = reports.filter((r) => {
  const cliente = r.data?.cliente?.toLowerCase() || "";
  const pedido =
    r.data?.referenciaContrato?.toLowerCase() ||
    r.data?.codInf?.toLowerCase() ||
    "";

  const fecha = r.updated_at || r.created_at;

  return (
    // filtro estado
    (filter === "todos" ||
      (filter === "borrador" && r.estado !== "completado") ||
      (filter === "completado" && r.estado === "completado")) &&

    // filtro cliente
    cliente.includes(filters.cliente.toLowerCase()) &&

    // filtro pedido
    pedido.includes(filters.pedido.toLowerCase()) &&

    // filtro fecha
    (!filters.fecha ||
      (fecha && fecha.startsWith(filters.fecha)))
  );
});

  // 📂 ABRIR
const openReport = (report) => {
  navigate(`/informe/${report.id}`);
};

  // 🗑 ELIMINAR
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Informe general</h1>

          <div className="flex items-center gap-3">
            <SyncStatus />
            <button
              onClick={() => navigate("/")}
              className="border px-4 py-1 rounded"
            >
              Volver
            </button>
          </div>
        </div>

        {/* NUEVO */}
        <button
          onClick={() => {
  navigate("/informe/nuevo");
}}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Nuevo informe
        </button>

        {/* FILTROS */}
        <div className="flex gap-2">
          {["todos", "borrador", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 border rounded text-sm ${
                filter === f ? "bg-black text-white" : ""
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* LISTA */}
        <div className="space-y-2">
          {filteredReports.length === 0 && (
            <p className="text-sm text-gray-500">Sin registros</p>
          )}

          {filteredReports.map((r) => (
            <div
              key={r.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <strong>{r.data?.cliente || "Sin cliente"}</strong>

                <div className="text-xs">
                  {new Date(
                    r.updated_at || r.created_at
                  ).toLocaleString()}
                </div>

                <div className="text-xs">
                  Estado:{" "}
                  <strong>
                    {r.estado === "completado"
                      ? "Completado"
                      : "Borrador"}
                  </strong>
                </div>
              </div>

              <div className="flex gap-3 text-sm">
                <button
                  onClick={() => openReport(r)}
                  className="text-blue-600"
                >
                  Abrir
                </button>

                {r.estado === "completado" && (
                  <button
                    onClick={() => navigate(`/informe/pdf/${r.id}`)}
                    className="text-green-600 font-semibold"
                  >
                    PDF
                  </button>
                )}

                <button
                  onClick={() => deleteReport(r.id)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-2">

  <input
    type="text"
    placeholder="Buscar cliente..."
    value={filters.cliente}
    onChange={(e) =>
      setFilters((f) => ({ ...f, cliente: e.target.value }))
    }
    className="border px-3 py-1 rounded text-sm"
  />

  <input
    type="text"
    placeholder="Pedido / Código..."
    value={filters.pedido}
    onChange={(e) =>
      setFilters((f) => ({ ...f, pedido: e.target.value }))
    }
    className="border px-3 py-1 rounded text-sm"
  />

  <input
    type="date"
    value={filters.fecha}
    onChange={(e) =>
      setFilters((f) => ({ ...f, fecha: e.target.value }))
    }
    className="border px-3 py-1 rounded text-sm"
  />

</div>
      </div>
    </div>
  );
}
