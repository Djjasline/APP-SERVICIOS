import { useNavigate } from "react-router-dom";

export default function RegistroHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Registro de herramientas
        </h1>

        <button
          onClick={() => navigate("/registro/new")}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition"
        >
          + Nuevo registro
        </button>
      </div>

      {/* CONTENEDOR */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">

        {/* FILTROS */}
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

        {/* LISTA VACÍA */}
        <div className="text-sm text-gray-400">
          No hay registros disponibles.
        </div>

      </div>
    </div>
  );
}
