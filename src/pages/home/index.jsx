// APP-SERVICIOS/src/pages/home/index.jsx

import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow space-y-6">

        <h1 className="text-2xl font-bold text-center text-slate-800">
          Sistema de Informes Técnicos
        </h1>

        {/* NUEVO INFORME */}
        <button
          onClick={() => {
            // 🔥 CLAVE: limpiar informe actual
            localStorage.removeItem("currentReport");

            navigate("/service-report-creation");
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded text-lg font-semibold"
        >
          Nuevo Informe
        </button>

        {/* HISTORIAL */}
        <button
          onClick={() => navigate("/service-report-history")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded text-lg font-semibold"
        >
          Historial de Informes
        </button>

      </div>
    </div>
  );
}
