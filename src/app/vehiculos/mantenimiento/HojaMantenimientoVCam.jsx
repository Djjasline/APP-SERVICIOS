import { useNavigate } from "react-router-dom";

export default function HojaMantenimientoVCam() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto my-16 bg-white shadow rounded-xl p-10 text-center space-y-6">

      <div className="text-6xl">🚧</div>

      <h1 className="text-2xl font-bold text-gray-800">
        Mantenimiento Cámara V-Cam6
      </h1>

      <p className="text-gray-500">
        Este formulario está en construcción. Próximamente disponible.
      </p>

      <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-4 py-2 rounded-full">
        EN CONSTRUCCIÓN
      </div>

      <div>
        <button
          onClick={() => navigate("/mantenimiento")}
          className="mt-4 border px-6 py-2 rounded hover:bg-gray-50 text-sm"
        >
          ← Volver a Mantenimientos
        </button>
      </div>

    </div>
  );
}
