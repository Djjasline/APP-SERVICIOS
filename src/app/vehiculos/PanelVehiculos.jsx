import { useNavigate } from "react-router-dom";
import { FileText, Wrench, Settings } from "lucide-react";

export default function PanelVehiculos() {
  const navigate = useNavigate();

  const Card = ({ icon: Icon, title, desc, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow border border-gray-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition duration-200"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">{desc}</p>

      <button className="text-sm text-blue-600 font-medium hover:underline">
        Ir →
      </button>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <h1 className="text-xl font-semibold text-gray-900">
        Panel ASTAP
      </h1>

      {/* CONTENEDOR */}
      <div className="bg-white rounded-2xl p-6 shadow">

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Vehículos Especiales
        </h2>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          <Card
            icon={FileText}
            title="Informe General"
            desc="Registro técnico de trabajos realizados."
            onClick={() => navigate("/informe")}
          />

          <Card
            icon={Wrench}
            title="Inspección"
            desc="Evaluación del estado de equipos y sistemas."
            onClick={() => navigate("/inspeccion")}
          />

          <Card
            icon={Settings}
            title="Mantenimiento"
            desc="Control de mantenimiento preventivo y correctivo."
            onClick={() => navigate("/mantenimiento")}
          />

        </div>
      </div>
    </div>
  );
}
