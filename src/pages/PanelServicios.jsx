import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4 space-y-4">

      <h1 className="text-lg font-bold">ASTAP</h1>

      <div className="text-xs text-gray-400 mt-4">
        MENÚ PRINCIPAL
      </div>

      <div className="space-y-2">

        <button
          onClick={() => navigate("/")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          📊 Menú principal
        </button>

        <button
          onClick={() => navigate("/area/vehiculos")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          🚛 Vehículos Especiales
        </button>

        <button
          onClick={() => navigate("/area/agua")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          💧 Agua y Saneamiento
        </button>

        <button
          onClick={() => navigate("/area/petroleo")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          🛢️ Petróleo y Energía
        </button>

        <button
          onClick={() => navigate("/operaciones")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          ⚙️ Operaciones
        </button>

        <button
          onClick={() => navigate("/repositorios")}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700"
        >
          🗂️ Repositorios
        </button>

      </div>
    </div>
  );
}
