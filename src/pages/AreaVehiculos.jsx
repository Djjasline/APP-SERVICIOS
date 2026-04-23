import CardModulo from "@/components/CardModulo";
import { FileText, ClipboardCheck, Wrench } from "lucide-react";

export default function AreaVehiculos() {
  return (
    <div className="p-6 space-y-6">

      {/* 🔥 HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Vehículos Especiales
        </h2>
        <p className="text-sm text-gray-300">
          Gestión de equipos y servicios especializados.
        </p>
      </div>

      {/* 🔥 GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        <CardModulo
          titulo="Informe General"
          descripcion="Registro técnico de trabajos realizados."
          ruta="/informe"
          color="bg-blue-600"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Inspección"
          descripcion="Evaluación del estado de equipos como Barredoras, Hidrosuccionadores y Cámaras de inspección."
          ruta="/inspeccion"
          color="bg-yellow-600"
          icono={<ClipboardCheck size={20} />}
        />

        <CardModulo
          titulo="Mantenimiento"
          descripcion="Control de mantenimiento preventivo de equipos."
          ruta="/mantenimiento"
          color="bg-green-600"
          icono={<Wrench size={20} />}
        />

      </div>

    </div>
  );
}
