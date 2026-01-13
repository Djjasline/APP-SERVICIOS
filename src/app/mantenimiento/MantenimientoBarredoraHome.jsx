import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MantenimientoBarredoraHome() {
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState("todos");
  const [mantenimientos, setMantenimientos] = useState([]);

  /* =============================
     CARGA DESDE LOCAL STORAGE
  ============================== */
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("mantenimiento-barredora") || "[]"
    );
    setMantenimientos(stored);
  }, []);

  /* =============================
     FILTRO (todos | borrador | completado)
  ============================== */
  const mantenimientosFiltrados =
    filtro === "todos"
      ? mantenimientos
      : mantenimientos.filter((m) => m.estado === filtro);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Mantenimiento Barredora</h1>
        <button
          onClick={() => navigate("/mantenimiento")}
          className="text-sm border px-3 py-1 rounded"
        >
          Volver
        </button>
      </div>

      {/* CREAR */}
      <button
        onClick={() => navigate("/mantenimiento/barredora/crear")}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Crear mantenimiento
      </button>

      {/* FILTROS */}
      <div className="flex gap-2 text-xs">
        {[
          { id: "todos", label: "Todos" },
          { id: "borrador", label: "Borrador" },
          { id: "completado", label: "Completado" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`px-3 py-1 border rounded ${
              filtro === f.id ? "bg-black text-white" : "bg-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* HISTÓRICO */}
      <div className="space-y-2">
        {mantenimientosFiltrados.length === 0 && (
          <p className="text-xs text-gray-400">
            No hay mantenimientos registrados.
          </p>
        )}

        {mantenimientosFiltrados.map((item) => (
          <div
            key={item.id}
            className="border rounded p-3 cursor-pointer hover:bg-gray-50"
            onClick={() =>
              navigate(`/mantenimiento/barredora/${item.id}`)
            }
          >
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">
                {item.codInf || "Sin código"}
              </div>
              <span className="text-xs px-2 py-1 border rounded">
                {item.estado}
              </span>
            </div>

            <div className="text-xs text-gray-500">
              {item.fechaServicio || "Sin fecha"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
