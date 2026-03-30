// src/app/inspeccion/HistorialInspecciones.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);

  /* =============================
     CARGAR INSPECCIONES
  ============================== */
  useEffect(() => {
    const loadInspections = async () => {
      const { data, error } = await supabase
        .from("registros")
        .select("*")
        .eq("tipo", "inspeccion")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setInspections([]);
        return;
      }

      setInspections(data || []);
    };

    loadInspections();
  }, []);

  /* =============================
     AGRUPAR
  ============================== */
  const safeInspections = Array.isArray(inspections) ? inspections : [];

  const byType = {
    hidro: safeInspections.filter((i) => i.subtipo === "hidro"),
    barredora: safeInspections.filter((i) => i.subtipo === "barredora"),
    camara: safeInspections.filter((i) => i.subtipo === "camara"),
  };

  /* =============================
     ACCIONES
  ============================== */
  const handleOpen = (type, id) => {
    navigate(`/inspeccion/${type}/${id}`);
  };

  const handleGeneratePdf = (inspection) => {
    navigate(`/inspeccion/pdf/${inspection.id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar inspección?")) return;

    const { error } = await supabase
      .from("registros")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Error eliminando ❌");
      return;
    }

    setInspections((prev) => prev.filter((i) => i.id !== id));
  };

  /* =============================
     COMPONENTE CARD
  ============================== */
  const renderCard = (title, desc, type, list) => (
    <div className="bg-white p-5 rounded-xl shadow-md space-y-4 hover:shadow-xl transition">

      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>

      <button
        onClick={() => navigate(`/inspeccion/${type}/new`)}
        className="px-3 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition"
      >
        + Nueva inspección
      </button>

      <div className="space-y-2">
        {list.length === 0 ? (
          <p className="text-xs text-gray-400">
            No hay inspecciones registradas.
          </p>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="border rounded p-3 text-xs flex flex-col gap-2 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">
                  {item.data?.cliente || "Sin cliente"}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    item.estado === "completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.estado}
                </span>
              </div>

              <span className="text-[10px] text-gray-500">
                {new Date(
                  item.updated_at || item.created_at
                ).toLocaleString()}
              </span>

              <div className="flex gap-3 pt-1 text-xs">
                {item.estado === "completado" && (
                  <button
                    onClick={() => handleGeneratePdf(item)}
                    className="text-green-600 hover:underline"
                  >
                    PDF
                  </button>
                )}

                <button
                  onClick={() => handleOpen(type, item.id)}
                  className="text-blue-600 hover:underline"
                >
                  Abrir
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /* =============================
     UI
  ============================== */
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Inspección y valoración
        </h1>

        <button
          onClick={() => navigate("/area/vehiculos")}
          className="bg-white text-black border px-4 py-1 rounded text-sm hover:bg-gray-100"
        >
          ← Volver
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {renderCard(
          "Hidrosuccionador",
          "Inspección general del equipo hidrosuccionador",
          "hidro",
          byType.hidro
        )}

        {renderCard(
          "Barredora",
          "Inspección y valoración de barredoras",
          "barredora",
          byType.barredora
        )}

        {renderCard(
          "Cámara (VCAM / Metrotech)",
          "Inspección con sistema de cámara",
          "camara",
          byType.camara
        )}

      </div>
    </div>
  );
}
