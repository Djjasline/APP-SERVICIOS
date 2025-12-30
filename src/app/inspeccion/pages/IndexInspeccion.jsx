import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInspectionHistory } from "../utilidades/inspectionStorage";

function Card({ titulo, descripcion, tipo, historial, onNuevo, onAbrir }) {
  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-slate-800">{titulo}</h2>
      <p className="text-sm text-slate-600">{descripcion}</p>

      {/* HISTORIAL */}
      {historial.length === 0 ? (
        <div className="text-sm text-slate-400">
          No hay inspecciones registradas.
        </div>
      ) : (
        <ul className="space-y-2 text-sm">
          {historial.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center border rounded px-3 py-2"
            >
              <span>
                {item.fecha} — {item.estado}
              </span>
              <button
                onClick={() => onAbrir(tipo)}
                className="text-xs text-blue-600 hover:underline"
              >
                Abrir
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => onNuevo(tipo)}
        className="w-full px-4 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
      >
        + Nueva inspección
      </button>
    </div>
  );
}

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const [history, setHistory] = useState({
    hidro: [],
    barredora: [],
    camara: [],
  });

  useEffect(() => {
    setHistory(getInspectionHistory());
  }, []);

  const handleNuevo = (tipo) => {
    navigate(`/inspeccion/${tipo}`);
  };

  const handleAbrir = (tipo) => {
    navigate(`/inspeccion/${tipo}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Inspección y valoración de equipos
          </h1>
          <p className="text-sm text-slate-600">
            Historial y creación de inspecciones por tipo de equipo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            titulo="Hidrosuccionadora"
            descripcion="Inspecciones a equipos hidrosuccionadores."
            tipo="hidro"
            historial={history.hidro}
            onNuevo={handleNuevo}
            onAbrir={handleAbrir}
          />

          <Card
            titulo="Barredora"
            descripcion="Inspecciones a equipos barredores."
            tipo="barredora"
            historial={history.barredora}
            onNuevo={handleNuevo}
            onAbrir={handleAbrir}
          />

          <Card
            titulo="Cámara (VCAM / Metrotech)"
            descripcion="Inspecciones con cámara de tuberías."
            tipo="camara"
            historial={history.camara}
            onNuevo={handleNuevo}
            onAbrir={handleAbrir}
          />
        </div>
      </div>
    </div>
  );
}
