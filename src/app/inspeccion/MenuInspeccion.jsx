import { useNavigate } from "react-router-dom";

export default function MenuInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white shadow-lg rounded-2xl p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">
        Inspección y valoración
      </h1>

      {/* HIDROSUCCIONADOR */}
      <section className="border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-sm">
          Hidrosuccionador
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* NUEVA INSPECCIÓN */}
          <button
            onClick={() => navigate("/inspeccion/hidro")}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white text-sm"
          >
            Nueva inspección
          </button>

          {/* HISTORIAL */}
          <button
            onClick={() => navigate("/inspeccion/hidro/historial")}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white text-sm"
          >
            Historial de inspecciones
          </button>
        </div>
      </section>

      {/* AQUÍ PUEDEN IR OTROS TIPOS */}
      {/* Barredora, Cámara, etc. */}
    </div>
  );
}
