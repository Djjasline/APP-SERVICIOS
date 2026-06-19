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
  titulo="Informe General de Servicio Técnico"
  descripcion="Este informe se utiliza para servicios técnicos generales; no aplica para inspección ni mantenimiento de equipos."
  ruta="/vehiculos/informe"
  color="bg-blue-600"
  icono={<FileText size={20} />}
/>

<CardModulo
  titulo="Informe de Inspección de Equipos"
  descripcion="Evaluación del estado de equipos como Barredoras, Hidrosuccionadores y Cámaras de inspección."
  ruta="/vehiculos/inspeccion"
  color="bg-yellow-600"
  icono={<ClipboardCheck size={20} />}
/>

<CardModulo
  titulo="Informe de Mantenimiento de Equipos"
  descripcion="Control de mantenimiento preventivo de equipos."
  ruta="/vehiculos/mantenimiento"
  color="bg-green-600"
  icono={<Wrench size={20} />}
/>

      </div>

    </div>
  );
}
