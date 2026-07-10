import CardModulo from "@/components/CardModulo";
import { useTheme } from "@/context/ThemeContext";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AreaIndustria() {
  const { isLight } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Industria</h2>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Gestión técnica de equipos industriales, bombas y válvulas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn-volver-orange"
        >
          Volver
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CardModulo
          titulo="Informe de bombas"
          descripcion="Informe para levantamiento de estado actual, instalación o inspección de bombas"
          ruta="/industria/informe/bomba"
          color="bg-slate-700"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Informe de válvulas"
          descripcion="Informe para levantamiento de estado actual, instalación o inspección de válvulas"
          ruta="/industria/informe/valvula"
          color="bg-orange-600"
          icono={<FileText size={20} />}
        />
      </div>
    </div>
  );
}
