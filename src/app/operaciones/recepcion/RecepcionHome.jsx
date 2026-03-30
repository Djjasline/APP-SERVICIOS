import { useNavigate } from "react-router-dom";

export default function RecepcionHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Recepción de equipos
        </h1>

        <button
          onClick={() => navigate("/recepcion/new")}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition"
        >
          + Nueva recepción
        </button>
      </div>

      {/* CONTENEDOR */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">

        {/* FILTROS (opcional futuro) */}
        <div className="flex gap-2 mb-4">
          <button className="px-3 py-1 text-xs bg-black text-white rounded">
            todos
          </button>
          <button className="px-3 py-1 text-xs border border-white/30 rounded">
            borrador
          </button>
          <button className="px-3 py-1 text-xs border border-white/30 rounded">
            completado
          </button>
        </div>

        {/* LISTA VACÍA (por ahora) */}
        <div className="text-sm text-gray-400">
          No hay recepciones registradas.
        </div>

      </div>
    </div>
  );
}
