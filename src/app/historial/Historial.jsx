import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "@utils/historyStorage";
import { FORM_STATE_STYLES, FORM_STATE_LABELS } from "@utils/formStates";

export default function Historial() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("todos");
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const filtered = items.filter((i) =>
    filter === "todos" ? true : i.estado === filter
  );

  const goToItem = (item) => {
    if (item.tipo === "informe") navigate("/informes/general");
    if (item.tipo === "inspeccion")
      navigate(`/inspeccion/${item.subtipo}`);
    if (item.tipo === "mantenimiento")
      navigate(`/mantenimiento/${item.subtipo}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">
          Historial de registros
        </h1>

        {/* FILTROS */}
        <div className="flex gap-2 text-sm">
          {["todos", "borrador", "completado"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded border ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* LISTA */}
        <div className="bg-white border rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">
              No hay registros aún.
            </p>
          ) : (
            <ul className="divide-y">
              {filtered.map((item) => (
                <li
                  key={item.id}
                  className="p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {item.titulo}
                    </p>
                    <p className="text-xs text-slate-500">
                      Cliente: {item.cliente}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.fecha).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${FORM_STATE_STYLES[item.estado]}`}
                    >
                      {FORM_STATE_LABELS[item.estado]}
                    </span>

                    <button
                      onClick={() => goToItem(item)}
                      className="text-sm text-blue-600 hover:underline"
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
    </div>
  );
}
