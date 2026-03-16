import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRegistro, getAllRegistros } from "@/utils/registroStorage";

const StatusBadge = ({ estado }) => {
  const styles = {
    salida: "bg-yellow-100 text-yellow-800",
    completado: "bg-green-100 text-green-800",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[estado] || "bg-gray-100 text-gray-700"
      }`}
    >
      {estado || "—"}
    </span>
  );
};

export default function IndexRegistroHerramientas() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [filter, setFilter] = useState("todas");

 useEffect(() => {
  const loadData = async () => {
    const data = await getAllRegistros();
    const safe = Array.isArray(data) ? data : [];
    setRegistros(safe);
  };

  loadData();
}, []);

  const filtered = registros
    .filter((r) => (filter === "todas" ? true : r.estado === filter))
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt)
    );

 const crearNuevoRegistro = async () => {
  const id = await createRegistro();
  if (!id) return;
  navigate(`/registro-salida/${id}`);
};

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver al panel principal
        </button>

        <h1 className="text-2xl font-semibold">
          Control de salida e ingreso de herramientas
        </h1>

        <button
          onClick={crearNuevoRegistro}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          + Nuevo registro
        </button>

        <div className="flex gap-2 text-xs">
          {["todas", "salida", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded border ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay registros aún.
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {item.data?.detalle || "Sin detalle"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge estado={item.estado} />

                  {item.estado === "completado" && (
                    <button
                      onClick={() =>
                        navigate(`/registro-salida/${item.id}/pdf`)
                      }
                      className="text-green-600 text-xs hover:underline"
                    >
                      PDF
                    </button>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/registro-salida/${item.id}`)
                    }
                    className="text-blue-600 text-xs hover:underline"
                  >
                    Abrir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
