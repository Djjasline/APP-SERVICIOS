import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function IndexInspeccion() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);

  /* =============================
     CARGAR INSPECCIONES (SUPABASE)
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
     AGRUPAR POR TIPO
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
     RENDER COLUMNAS
  ============================== */
  const renderColumn = (title, type, description) => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-xs text-gray-500">{description}</p>

      <button
        onClick={() => navigate(`/inspeccion/${type}/new`)}
        className="px-3 py-2 bg-black text-white rounded text-sm"
      >
        + Nueva inspección
      </button>

      <div className="space-y-2">
        {byType[type].length === 0 ? (
          <p className="text-xs text-gray-400">
            No hay inspecciones registradas.
          </p>
        ) : (
          byType[type].map((item) => (
            <div
              key={item.id}
              className="border rounded p-2 text-xs flex flex-col gap-1"
            >
              {/* HEADER */}
              <div className="flex justify-between">
                <span className="font-medium">
                  {item.data?.cliente || "Sin cliente"}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    item.estado === "completado"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.estado}
                </span>
              </div>

              {/* FECHA */}
              <span className="text-[10px] text-gray-500">
                {new Date(
                  item.updated_at || item.created_at
                ).toLocaleString()}
              </span>

              {/* ACCIONES */}
              <div className="flex gap-3 pt-1">
                {item.estado === "completado" && (
                  <button
                    type="button"
                    onClick={() => handleGeneratePdf(item)}
                    className="text-green-600 hover:underline"
                  >
                    PDF
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpen(type, item.id)}
                  className="text-blue-600 hover:underline"
                >
                  Abrir
                </button>

                <button
                  type="button"
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
     UI PRINCIPAL
  ============================== */
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">Inspección y valoración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn(
          "Hidrosuccionador",
          "hidro",
          "Inspección general del equipo hidrosuccionador"
        )}

        {renderColumn(
          "Barredora",
          "barredora",
          "Inspección y valoración de barredoras"
        )}

        {renderColumn(
          "Cámara (VCAM / Metrotech)",
          "camara",
          "Inspección con sistema de cámara"
        )}
      </div>
    </div>
  );
}
