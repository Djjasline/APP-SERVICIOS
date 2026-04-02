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

  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">
          Registro de herramientas
        </h1>

        <button
          onClick={() => navigate("/registro/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition"
        >
          + Nuevo registro
        </button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          placeholder="Buscar herramienta..."
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          placeholder="Código..."
          className="border px-3 py-2 rounded text-sm"
        />
        <input type="date" className="border px-3 py-2 rounded text-sm" />
      </div>

      <div className="bg-gray-50 border rounded-xl p-6 text-gray-500">
        No hay registros disponibles.
      </div>
    </div>
  );
}
