import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegistroHome() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [filter, setFilter] = useState("todos");

  const [filters, setFilters] = useState({
    herramienta: "",
    codigo: "",
    fecha: "",
  });

  // 🔄 CARGAR DATA
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("registros_herramientas")
        .select("*")
        .order("created_at", { ascending: false });

      setRegistros(data || []);
    };

    load();
  }, []);

  // 🎯 FILTROS
  const filtered = registros.filter((r) => {
    const herramienta = r.data?.herramienta?.toLowerCase() || "";
    const codigo = r.data?.codigo?.toLowerCase() || "";
    const fecha = r.updated_at || r.created_at;

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      herramienta.includes(filters.herramienta.toLowerCase()) &&
      codigo.includes(filters.codigo.toLowerCase()) &&
      (!filters.fecha || (fecha && fecha.startsWith(filters.fecha)))
    );
  });

  const open = (r) => navigate(`/registro/${r.id}`);

  const remove = async (id) => {
    if (!confirm("¿Eliminar registro?")) return;

    await supabase
      .from("registros_herramientas")
      .delete()
      .eq("id", id);

    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          Registro de herramientas
        </h1>

        <button
          onClick={() => navigate("/registro/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
        >
          + Nuevo registro
        </button>
      </div>

      {/* FILTROS */}
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

      {/* INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          placeholder="Buscar herramienta..."
          value={filters.herramienta}
          onChange={(e) =>
            setFilters((f) => ({ ...f, herramienta: e.target.value }))
          }
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          placeholder="Código..."
          value={filters.codigo}
          onChange={(e) =>
            setFilters((f) => ({ ...f, codigo: e.target.value }))
          }
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          type="date"
          value={filters.fecha}
          onChange={(e) =>
            setFilters((f) => ({ ...f, fecha: e.target.value }))
          }
          className="border px-3 py-2 rounded text-sm"
        />
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">

          {/* HEADER */}
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-2">Herramienta</th>
              <th className="text-left px-4 py-2">Código</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-right px-4 py-2">Acciones</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No hay registros disponibles
                </td>
              </tr>
            )}

            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">

                <td className="px-4 py-2 font-medium text-gray-900">
                  {r.data?.herramienta || "—"}
                </td>

                <td className="px-4 py-2 text-gray-600">
                  {r.data?.codigo || "—"}
                </td>

                {/* ESTADO */}
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      r.estado === "completado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.estado === "completado"
                      ? "Completado"
                      : "Borrador"}
                  </span>
                </td>

                <td className="px-4 py-2 text-gray-500">
                  {new Date(
                    r.updated_at || r.created_at
                  ).toLocaleDateString()}
                </td>

                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => open(r)}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </button>

                  <button
                    onClick={() => remove(r.id)}
                    className="text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
