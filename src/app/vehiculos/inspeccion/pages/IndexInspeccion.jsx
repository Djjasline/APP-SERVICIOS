import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInspections, createInspection } from "@/utils/inspectionStorage";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";

/* =========================
   Badge visual de estado
========================= */
const StatusBadge = ({ estado }) => {
  const styles = {
    borrador: "bg-yellow-100 text-yellow-800",
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

/* =========================
   Card reutilizable
========================= */
const Card = ({ title, type, description }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("todas");
  const [inspections, setInspections] = useState([]);

  // 🔥 Cargar desde Supabase correctamente
  React.useEffect(() => {
    const loadData = async () => {
      const data = await getAllInspections();
      const safe = Array.isArray(data) ? data : [];

      const filteredByType = safe.filter(
        (i) => i.type === type
      );

      setInspections(filteredByType);
    };

    loadData();
  }, [type]);

  const filteredInspections = inspections
    .filter((i) => (filter === "todas" ? true : i.estado === filter))
    .sort(
      (a, b) =>
        new Date(b.fecha || b.createdAt) -
        new Date(a.fecha || a.createdAt)
    );

 const crearNuevaInspeccion = async () => {
  const id = await createInspection(type);
  navigate(`/inspeccion/${type}/${id}`);
};

  const eliminarInspeccion = async (item) => {
    if (!confirm("¿Eliminar esta inspección?")) return;

    const data = await getAllInspections();
    const safe = Array.isArray(data) ? data : [];

    const next = safe.filter(
      (i) => !(i.id === item.id && i.type === type)
    );

    setInspections(next);
  };

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-white shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      <button
        onClick={crearNuevaInspeccion}
        className="px-3 py-2 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800"
      >
        + Nueva inspección
      </button>

      <div className="flex gap-2 text-xs">
        {["todas", "borrador", "completado"].map((f) => (
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

      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">
          Historial
        </p>

        {filteredInspections.length === 0 ? (
          <p className="text-xs text-slate-400">
            No hay inspecciones aún.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {filteredInspections.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border rounded px-2 py-2"
              >
                <div className="flex flex-col">
                  <span className="font-medium truncate">
                    {item.data?.cliente || "Sin cliente"}
                  </span>

                  <span className="text-xs text-slate-500">
                    {new Date(
                      item.fecha || item.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge estado={item.estado} />

                  {item.estado === "completado" && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/inspeccion/${type}/${item.id}/pdf`
                        )
                      }
                      className="text-xs text-green-600 hover:underline"
                    >
                      PDF
                    </button>
                  )}

                  <button
                    onClick={() =>
                      navigate(`/inspeccion/${type}/${item.id}`)
                    }
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Abrir
                  </button>

                  <button
                    onClick={() => eliminarInspeccion(item)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* =========================
   INDEX INSPECCIÓN (MENÚ)
========================= */
export default function IndexInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/")}
          className="btn-volver-orange"
        >
          ← Volver al panel principal
        </button>

        <h1 className="text-2xl font-semibold text-slate-900">
          {VEHICULOS_TEXT.inspeccion.title}
        </h1>
        <p className="text-sm text-slate-600">
          {VEHICULOS_TEXT.inspeccion.description}
        </p>

        <div className="grid md:grid-cols-5 gap-6">
          <Card
            title="Hidrosuccionador"
            type="hidro"
            description="Inspección técnica del módulo hidrosuccionador y sus sistemas, no incluye servicios de chasis."
          />

          <Card
            title="Barredora Pelican"
            type="barredora"
            description="Inspección del módulo de barrido incluye motor de combustión interna."
          />

          <Card
            title="Barredora Road Wizard"
            type="barredora-road-wizard"
            description="Inspección del módulo barredora Road Wizard incluye motor auxiliar, no incluye servicio de chasis."
          />

          <Card
            title="Barredora Piquersa BA-2300-H"
            type="barredora-piquersa-ba-2300h"
            description="Inspección técnica de motor Kubota V1505, sistema hidrostático, barrido, tolva y riego."
          />

          <Card
            title="Cámara (VCAM / Metrotech)"
            type="camara"
            description="Inspección con sistema de cámara."
          />
        </div>
      </div>
    </div>
  );
}
