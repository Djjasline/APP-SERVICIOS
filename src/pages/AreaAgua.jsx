import CardModulo from "@/components/CardModulo";
import { FileText, ClipboardCheck } from "lucide-react";

export default function AreaAgua() {
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Agua y Saneamiento
        </h2>
        <p className="text-sm text-gray-300">
          Gestión de sistemas hidráulicos y servicios de saneamiento.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <CardModulo
          titulo="Informes"
          descripcion="Reportes técnicos de sistemas hidráulicos."
          ruta="/informe"
          color="bg-blue-600"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Inspección"
          descripcion="Evaluación de redes y equipos hidráulicos."
          ruta="/inspeccion"
          color="bg-yellow-600"
          icono={<ClipboardCheck size={20} />}
        />

      </div>
    </div>
  );
}
