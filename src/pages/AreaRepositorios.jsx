import CardModulo from "@/components/CardModulo";
import { FileText, File, Folder } from "lucide-react";

export default function AreaRepositorios() {
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-lg font-semibold text-white">
          Repositorios
        </h2>
        <p className="text-sm text-gray-300">
          Gestión y almacenamiento de documentos y archivos técnicos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <CardModulo
          titulo="Manuales técnicos de vehículos especiales"
          descripcion="Acceso a manuales técnicos, catalogos y documentación técnica por marca de equipo"
          ruta="/repositorios/Manuales-tecnicos-de-vehiculos-especiales"
          color="bg-blue-600"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="Base de datos"
          descripcion="Acceso a base de datos empresarial."
          ruta="/repositorios/Base-de-datos"
          color="bg-red-600"
          icono={<File size={20} />}
        />

             </div>
    </div>
  );
}
