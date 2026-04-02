import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecepcionHome() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [filter, setFilter] = useState("todos");

  const [filters, setFilters] = useState({
    equipo: "",
    codigo: "",
    fecha: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("recepciones")
        .select("*")
        .order("created_at", { ascending: false });

      setRegistros(data || []);
    };

    load();
  }, []);

  const filtered = registros.filter((r) => {
    const equipo = r.data?.equipo?.toLowerCase() || "";
    const codigo = r.data?.codigo?.toLowerCase() || "";
    const fecha = r.updated_at || r.created_at;

    return (
      (filter === "todos" ||
        (filter === "borrador" && r.estado !== "completado") ||
        (filter === "completado" && r.estado === "completado")) &&
      equipo.includes(filters.equipo.toLowerCase()) &&
      codigo.includes(filters.codigo.toLowerCase()) &&
      (!filters.fecha || (fecha && fecha.startsWith(filters.fecha)))
    );
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          Recepción de equipos
        </h1>

        <button
          onClick={() => navigate("/recepcion/new")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition"
        >
          + Nueva recepción
        </button>
      </div>

      {/* FILTROS ESTADO */}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Buscar equipo..."
          value={filters.equipo}
          onChange={(e) =>
            setFilters((f) => ({ ...f, equipo: e.target.value }))
          }
          className="border px-3 py-2 rounded text-sm"
        />

        <input
          type="text"
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

      {/* LISTADO */}
      <div className="space-y-3">

        {filtered.length === 0 && (
          <div className="bg-gray-50 border rounded-xl p-6 text-gray-500">
            No hay recepciones registradas.
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {r.data?.equipo || "Sin equipo"}
              </p>

              <p className="text-xs text-gray-500">
                {new Date(
                  r.updated_at || r.created_at
                ).toLocaleString()}
              </p>

              <p className="text-xs text-gray-700">
                Estado:{" "}
                <strong>
                  {r.estado === "completado"
                    ? "Completado"
                    : "Borrador"}
                </strong>
              </p>
            </div>

            <div className="flex gap-3 text-sm">
              <button
                onClick={() => navigate(`/recepcion/${r.id}`)}
                className="text-blue-600 hover:underline"
              >
                Abrir
              </button>

              <button
                onClick={() => setRegistros((prev) => prev.filter(x => x.id !== r.id))}
                className="text-red-500 hover:underline"
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
