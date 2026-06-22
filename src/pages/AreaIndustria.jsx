import CardModulo from "@/components/CardModulo";
import { FileText } from "lucide-react";

export default function AreaIndustria() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Industria</h2>
        <p className="text-sm text-gray-300">
          Gestión técnica de equipos industriales, bombas y válvulas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CardModulo
          titulo="Informe de bombas"
          descripcion="Creación e historial de informes técnicos de bombas industriales."
          ruta="/industria/informe/bomba"
          color="bg-slate-700"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Informe de válvulas"
          descripcion="Creación e historial de informes técnicos de válvulas industriales."
          ruta="/industria/informe/valvula"
          color="bg-orange-600"
          icono={<FileText size={20} />}
        />
      </div>
    </div>
  );
}
