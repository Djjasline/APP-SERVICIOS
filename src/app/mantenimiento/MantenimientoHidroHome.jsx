import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MantenimientoHidroHome() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("todos");
  const [data, setData] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("mantenimiento-hidro") || "[]"
    );
    setData(stored);
  }, []);

  const filtrados =
    filtro === "todos"
      ? data
      : data.filter((i) => i.estado === filtro);

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/mantenimiento/hidro/crear")}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Crear mantenimiento
      </button>

      <div className="flex gap-2 text-xs">
        {["todos", "borrador", "completado"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1 border rounded ${
              filtro === f ? "bg-black text-white" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 && (
          <p className="text-xs text-gray-400">No hay registros</p>
        )}

        {filtrados.map((item) => (
          <div
            key={item.id}
            className="border rounded p-2 cursor-pointer hover:bg-gray-50"
            onClick={() =>
              navigate(`/mantenimiento/hidro/${item.id}`)
            }
          >
            <div className="flex justify-between text-sm">
              <span>{item.codInf || "Sin código"}</span>
              <span className="text-xs">{item.estado}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
