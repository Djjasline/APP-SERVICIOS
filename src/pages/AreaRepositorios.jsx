import CardModulo from "@/components/CardModulo";
import { useTheme } from "@/context/ThemeContext";
import { FileText, Database, Tags, GraduationCap } from "lucide-react";
import { recordResourceUsage } from "@/services/resourceUsageService";

const TRAINING_URL = "https://fsu.myfslearning.com/student/catalog";
const TEAMDESK_URL = "https://www.teamdesk.net/secure/db/53431/overview.aspx?t=381285";

export default function AreaRepositorios() {
  const { isLight } = useTheme();

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
          Recursos
        </h2>

        <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
          Gestión y almacenamiento de documentos y archivos técnicos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CardModulo
          titulo="Biblioteca técnica del area de vehiculos especiales"
          descripcion="Acceso a manuales técnicos, catálogos y documentación técnica por marca de equipo."
          ruta="/repositorios/manuales-tecnicos"
          color="bg-blue-600"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Portales de nuestras marcas y productos"
          descripcion="Accesos rápidos a fabricantes, productos y documentación pública de equipos relacionados."
          ruta="/repositorios/marcas-productos"
          color="bg-purple-700"
          icono={<Tags size={20} />}
        />

        <CardModulo
          titulo="Portal de entrenamiento de vehículos especiales"
          descripcion="Portal de entrenamiento de barredoras Elgin e hidrosuccionadores Vactor."
          ruta={TRAINING_URL}
          color="bg-emerald-600"
          icono={<GraduationCap size={20} />}
          onOpen={() => recordResourceUsage({ subtipo: "entrenamiento-vehiculos", label: "Portal de entrenamiento de vehículos especiales", url: TRAINING_URL })}
        />

        <CardModulo
          titulo="Base de datos ASTAP"
          descripcion="Acceso a base de datos empresarial ASTAP en TeamDesk."
          ruta={TEAMDESK_URL}
          color="bg-red-600"
          icono={<Database size={20} />}
          onOpen={() => recordResourceUsage({ subtipo: "base-datos-astap", label: "Base de datos ASTAP", url: TEAMDESK_URL })}
        />
      </div>
    </div>
  );
}
