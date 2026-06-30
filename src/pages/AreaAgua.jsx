import CardModulo from "@/components/CardModulo";
import { useTheme } from "@/context/ThemeContext";
import { FileText, ClipboardCheck } from "lucide-react";

export default function AreaAgua() {
  const { isLight } = useTheme();

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
          Agua y Saneamiento
        </h2>
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
          Gestión de sistemas hidráulicos y servicios de saneamiento.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <CardModulo
          titulo="Informe de bombas"
          descripcion="Informe para levantamiento de estado actual, instalación o inspección de bombas"
          ruta="/agua/informe/bomba"
          color="bg-blue-600"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Informe de válvulas"
          descripcion="Informe para levantamiento de estado actual, instalación o inspección de válvulas"
          ruta="/agua/informe/valvula"
          color="bg-cyan-600"
          icono={<FileText size={20} />}
        />

       <CardModulo
  titulo="Informe de recorrido"
  descripcion="Registro de recorrido e inspección de sistemas hidráulicos."
  ruta="/agua/recorrido/informe"
  color="bg-yellow-600"
  icono={<ClipboardCheck size={20} />}
/>

      </div>
    </div>
  );
}
