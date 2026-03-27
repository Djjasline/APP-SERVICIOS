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
     UI
  ============================== */
  return (
    <div className="space-y-6 text-gray-900">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">
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

        {/* HIDRO */}
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              Hidrosuccionador
            </h2>
            <p className="text-xs text-gray-500">
              Inspección general del equipo hidrosuccionador
            </p>
          </div>

          <button
            onClick={() => navigate(`/inspeccion/hidro/new`)}
            className="px-3 py-2 bg-black text-white rounded text-sm"
          >
            + Nueva inspección
          </button>

          <div className="space-y-2">
            {byType.hidro.length === 0 ? (
              <p className="text-xs text-gray-400">
                No hay inspecciones registradas.
              </p>
            ) : (
              byType.hidro.map((item) => (
                <div
                  key={item.id}
                  className="border rounded p-3 text-xs flex flex-col gap-2 bg-gray-50"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
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

                  <span className="text-[10px] text-gray-500">
                    {new Date(
                      item.updated_at || item.created_at
                    ).toLocaleString()}
                  </span>

                  <div className="flex gap-3 pt-1">
                    {item.estado === "completado" && (
                      <button
                        onClick={() => handleGeneratePdf(item)}
                        className="text-green-600 hover:underline"
                      >
                        PDF
                      </button>
                    )}

                    <button
                      onClick={() => handleOpen("hidro", item.id)}
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

        {/* BARREDORA */}
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              Barredora
            </h2>
            <p className="text-xs text-gray-500">
              Inspección y valoración de barredoras
            </p>
          </div>

          <button
            onClick={() => navigate(`/inspeccion/barredora/new`)}
            className="px-3 py-2 bg-black text-white rounded text-sm"
          >
            + Nueva inspección
          </button>

          <div className="space-y-2">
            {byType.barredora.length === 0 ? (
              <p className="text-xs text-gray-400">
                No hay inspecciones registradas.
              </p>
            ) : (
              byType.barredora.map((item) => (
                <div
                  key={item.id}
                  className="border rounded p-3 text-xs flex flex-col gap-2 bg-gray-50"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
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

                  <span className="text-[10px] text-gray-500">
                    {new Date(
                      item.updated_at || item.created_at
                    ).toLocaleString()}
                  </span>

                  <div className="flex gap-3 pt-1">
                    {item.estado === "completado" && (
                      <button
                        onClick={() => handleGeneratePdf(item)}
                        className="text-green-600 hover:underline"
                      >
                        PDF
                      </button>
                    )}

                    <button
                      onClick={() => handleOpen("barredora", item.id)}
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

        {/* CAMARA */}
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              Cámara (VCAM / Metrotech)
            </h2>
            <p className="text-xs text-gray-500">
              Inspección con sistema de cámara
            </p>
          </div>

          <button
            onClick={() => navigate(`/inspeccion/camara/new`)}
            className="px-3 py-2 bg-black text-white rounded text-sm"
          >
            + Nueva inspección
          </button>

          <div className="space-y-2">
            {byType.camara.length === 0 ? (
              <p className="text-xs text-gray-400">
                No hay inspecciones registradas.
              </p>
            ) : (
              byType.camara.map((item) => (
                <div
                  key={item.id}
                  className="border rounded p-3 text-xs flex flex-col gap-2 bg-gray-50"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">
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

                  <span className="text-[10px] text-gray-500">
                    {new Date(
                      item.updated_at || item.created_at
                    ).toLocaleString()}
                  </span>

                  <div className="flex gap-3 pt-1">
                    {item.estado === "completado" && (
                      <button
                        onClick={() => handleGeneratePdf(item)}
                        className="text-green-600 hover:underline"
                      >
                        PDF
                      </button>
                    )}

                    <button
                      onClick={() => handleOpen("camara", item.id)}
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

      </div>
    </div>
  );
}
