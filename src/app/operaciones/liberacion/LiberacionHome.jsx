import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/ui/PageContainer";

export default function LiberacionHome() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [filter, setFilter] = useState("todos");

  const [filters, setFilters] = useState({
    equipo: "",
    codigo: "",
    fecha: "",
  });

  // 🔄 CARGAR DATA
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("liberaciones")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setRegistros([]);
        return;
      }

      setRegistros(data || []);
    };

    load();
  }, []);

  // 🎯 FILTROS
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

  // 📂 ABRIR
  const open = (r) => {
    navigate(`/liberacion/${r.id}`);
  };

  // 🗑 ELIMINAR
  const remove = async (id) => {
    if (!confirm("¿Eliminar liberación?")) return;

    const { error } = await supabase
      .from("liberaciones")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error eliminando ❌");
      return;
    }

    setRegistros((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <PageContainer
      title="Historial de liberaciones"
      button={
        <button
          onClick={() => navigate("/liberacion/nuevo")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          + Nueva liberación
        </button>
      }
    >
      {/* FILTROS ESTADO */}
      <div className="flex gap-2">
        {["todos", "borrador", "completado"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 border rounded text-sm ${
              filter === f
                ? "bg-white text-gray-900"
                : "text-white/70 hover:bg-white/10"
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
          className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded text-sm placeholder-white/50"
        />

        <input
          type="text"
          placeholder="Código..."
          value={filters.codigo}
          onChange={(e) =>
            setFilters((f) => ({ ...f, codigo: e.target.value }))
          }
          className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded text-sm placeholder-white/50"
        />

        <input
          type="date"
          value={filters.fecha}
          onChange={(e) =>
            setFilters((f) => ({ ...f, fecha: e.target.value }))
          }
          className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded text-sm"
        />
      </div>

      {/* LISTADO */}
      <div className="space-y-3">

        {filtered.length === 0 && (
          <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-white/60">
            Sin registros
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white/10 border border-white/20 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-white">
                {r.data?.equipo || "Sin equipo"}
              </p>

              <p className="text-xs text-white/50">
                {new Date(
                  r.updated_at || r.created_at
                ).toLocaleString()}
              </p>

              <p className="text-xs text-white/70">
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
                onClick={() => open(r)}
                className="text-blue-400 hover:underline"
              >
                Abrir
              </button>

              <button
                onClick={() => remove(r.id)}
                className="text-red-400 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
