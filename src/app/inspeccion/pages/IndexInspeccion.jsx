import React from "react";
import { useNavigate } from "react-router-dom";
import { getInspectionHistory } from "../utilidades/inspectionStorage";

function Section({ titulo, tipo, items, navigate }) {
  return (
    <div className="border rounded-xl p-4 space-y-3 bg-white">
      <h2 className="text-lg font-semibold">{titulo}</h2>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay inspecciones registradas.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border rounded-lg px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">
                  Fecha: {item.fecha}
                </p>
                <span
                  className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                    item.estado === "completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.estado === "completado"
                    ? "Completado"
                    : "Borrador"}
                </span>
              </div>

              <button
                onClick={() =>
                  navigate(`/inspeccion/${tipo}/${item.id}`)
                }
                className="text-sm px-3 py-1 rounded-md border hover:bg-slate-50"
              >
                Continuar
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => navigate(`/inspeccion/${tipo}`)}
        className="mt-2 text-sm px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800"
      >
        + Nueva inspección
      </button>
    </div>
  );
}

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const history = getInspectionHistory();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">
          Inspecciones y Valoraciones
        </h1>

        <Section
          titulo="Inspección Hidrosuccionador"
          tipo="hidro"
          items={history.hidro}
          navigate={navigate}
        />

        <Section
          titulo="Inspección Barredora"
          tipo="barredora"
          items={history.barredora}
          navigate={navigate}
        />

        <Section
          titulo="Inspección Cámara (VCAM / Metrotech)"
          tipo="camara"
          items={history.camara}
          navigate={navigate}
        />
      </div>
    </div>
  );
}
