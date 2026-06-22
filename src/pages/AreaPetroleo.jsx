import CardModulo from "@/components/CardModulo";
import { useTheme } from "@/context/ThemeContext";
import { FileText, ClipboardCheck, Wrench } from "lucide-react";

export default function AreaPetroleo() {
  const { isLight } = useTheme();

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
          Petróleo y Energía
        </h2>
        <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
          Gestión de equipos y servicios especializados para el sector energético.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <CardModulo
  titulo="Informe general de bombas y válvulas"
  descripcion="(informe general para levantamiento o inspección de bombas y válvulas)"
  ruta="/petroleo/informe"
  color="bg-blue-600"
  icono={<FileText size={20} />}
/>
      </div>
    </div>
  );
}
