import { useNavigate } from "react-router-dom";

export default function MenuInspeccion() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">Inspección y valoración</h1>

      <div className="grid md:grid-cols-3 gap-6">

        {/* HIDRO */}
        <section className="border rounded-xl p-4 bg-white space-y-3">
          <h2 className="font-semibold">Hidrosuccionador</h2>
          <p className="text-sm text-gray-500">
            Inspección del equipo hidrosuccionador.
          </p>
          <button
            onClick={() => navigate("/inspeccion/hidro")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Abrir
          </button>
        </section>

        {/* BARREDORA */}
        <section className="border rounded-xl p-4 bg-white space-y-3">
          <h2 className="font-semibold">Barredora</h2>
          <p className="text-sm text-gray-500">
            Inspección y valoración de barredoras.
          </p>
          <button
            onClick={() => navigate("/inspeccion/barredora")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Abrir
          </button>
        </section>

        {/* CÁMARA */}
        <section className="border rounded-xl p-4 bg-white space-y-3">
          <h2 className="font-semibold">Cámara (VCAM / Metrotech)</h2>
          <p className="text-sm text-gray-500">
            Inspección con sistema de cámara.
          </p>
          <button
            onClick={() => navigate("/inspeccion/camara")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Abrir
          </button>
        </section>

      </div>
    </div>
  );
}
