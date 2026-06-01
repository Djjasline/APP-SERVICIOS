import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generarPDFRecepcion } from "./generarPDFRecepcion";

export default function RecepcionHome() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    conductor: "",
    placa: "",
    pedido: "",
    fecha: "",
  });

  const loadRegistros = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("tipo", "recepcion")
      .eq("subtipo", "control_vehicular")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando controles vehiculares:", error);
      setRegistros([]);
    } else {
      setRegistros(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRegistros();
  }, []);

  const filtered = registros.filter((r) => {
    const d = r.data || {};
    const fecha = d.fecha || r.updated_at || r.created_at || "";

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      (d.conductor || "").toLowerCase().includes(filters.conductor.toLowerCase()) &&
      (d.placa || "").toLowerCase().includes(filters.placa.toLowerCase()) &&
      (d.pedidoDemanda || "").toLowerCase().includes(filters.pedido.toLowerCase()) &&
      (!filters.fecha || fecha.startsWith(filters.fecha))
    );
  });

  const remove = async (id) => {
    if (!confirm("¿Eliminar control vehicular?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id)
      .eq("tipo", "recepcion")
      .eq("subtipo", "control_vehicular");

    if (error) {
      console.error("Error eliminando control vehicular:", error);
      alert("No se pudo eliminar el registro.");
      return;
    }

    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">
          Control vehicular
        </h1>

        <button
          onClick={() => navigate("/operaciones/recepcion/new")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
        >
          + Nuevo control
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
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
          placeholder="Buscar conductor..."
          value={filters.conductor}
          onChange={(e) => setFilters((f) => ({ ...f, conductor: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          placeholder="Placa..."
          value={filters.placa}
          onChange={(e) => setFilters((f) => ({ ...f, placa: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          placeholder="Pedido / demanda..."
          value={filters.pedido}
          onChange={(e) => setFilters((f) => ({ ...f, pedido: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          type="date"
          value={filters.fecha}
          onChange={(e) => setFilters((f) => ({ ...f, fecha: e.target.value }))}
          className="border px-3 py-2 rounded text-sm"
        />
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-2">Conductor</th>
              <th className="text-left px-4 py-2">Placa</th>
              <th className="text-left px-4 py-2">Pedido/Demanda</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Cargando controles vehiculares...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No hay controles vehiculares registrados
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((r) => {
                const d = r.data || {};
                const fecha = d.fecha || r.updated_at || r.created_at;

                return (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {d.conductor || "-"}
                    </td>

                    <td className="px-4 py-2 text-gray-600">
                      {d.placa || "-"}
                    </td>

                    <td className="px-4 py-2 text-gray-600">
                      {d.pedidoDemanda || "-"}
                    </td>

                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          r.estado === "completado"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {r.estado === "completado" ? "Completado" : "Borrador"}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-gray-500">
                      {fecha ? new Date(fecha).toLocaleDateString() : "-"}
                    </td>

                    <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/operaciones/recepcion/${r.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Abrir
                      </button>

                      <button
                        onClick={() => generarPDFRecepcion(d)}
                        className="text-green-600 hover:underline"
                      >
                        PDF
                      </button>

                      <button
                        onClick={() => remove(r.id)}
                        className="text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
