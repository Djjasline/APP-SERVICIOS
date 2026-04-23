import CardModulo from "@/components/CardModulo";
import { FileText, ClipboardCheck, Wrench } from "lucide-react";

export default function AreaPetroleo() {
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Petróleo y Energía
        </h2>
        <p className="text-sm text-gray-300">
          Gestión de equipos y servicios especializados para el sector energético.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <CardModulo
          titulo="Informes"
          descripcion="Registro técnico de trabajos realizados en equipos del sector energético."
          ruta="/informe"
          color="bg-blue-600"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Inspección"
          descripcion="Evaluación del estado operativo de equipos en ambientes industriales."
          ruta="/inspeccion"
          color="bg-yellow-600"
          icono={<ClipboardCheck size={20} />}
        />

        <CardModulo
          titulo="Mantenimiento"
          descripcion="Gestión de mantenimiento preventivo y correctivo."
          ruta="/mantenimiento"
          color="bg-green-600"
          icono={<Wrench size={20} />}
        />

      </div>
    </div>
  );
}
