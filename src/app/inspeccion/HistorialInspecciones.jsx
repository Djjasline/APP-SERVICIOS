import { useNavigate } from "react-router-dom";

export default function HistorialInspecciones() {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Inspección y valoración
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          ← Volver
        </button>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* ================= HIDRO ================= */}
        <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">

          <h2 className="font-semibold text-gray-900">
            Hidrosuccionador
          </h2>

          <p className="text-sm text-gray-600">
            Inspección general del equipo hidrosuccionador
          </p>

          <button className="bg-black text-white px-3 py-1 rounded text-sm">
            + Nueva inspección
          </button>

          {/* LISTA */}
          <div className="border rounded p-3 text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-900">prueba1</span>
              <span className="text-green-600 text-xs">
                completado
              </span>
            </div>

            <div className="text-xs text-gray-500">
              4/3/2026, 12:05:29
            </div>

            <div className="flex gap-3 text-xs">
              <span className="text-green-600 cursor-pointer">PDF</span>
              <span className="text-blue-600 cursor-pointer">Abrir</span>
              <span className="text-red-600 cursor-pointer">Eliminar</span>
            </div>
          </div>

        </div>

        {/* ================= BARREDORA ================= */}
        <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">

          <h2 className="font-semibold text-gray-900">
            Barredora
          </h2>

          <p className="text-sm text-gray-600">
            Inspección y valoración de barredoras
          </p>

          <button className="bg-black text-white px-3 py-1 rounded text-sm">
            + Nueva inspección
          </button>

          <p className="text-sm text-gray-400">
            No hay inspecciones registradas.
          </p>

        </div>

        {/* ================= CÁMARA ================= */}
        <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">

          <h2 className="font-semibold text-gray-900">
            Cámara (VCAM / Metrotech)
          </h2>

          <p className="text-sm text-gray-600">
            Inspección con sistema de cámara
          </p>

          <button className="bg-black text-white px-3 py-1 rounded text-sm">
            + Nueva inspección
          </button>

          <p className="text-sm text-gray-400">
            No hay inspecciones registradas.
          </p>

        </div>

      </div>

    </div>
  );
}
