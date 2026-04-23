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
          titulo="Documentos"
          descripcion="Gestión de documentos técnicos y manuales."
          ruta="/repositorios/documentos"
          color="bg-blue-600"
          icono={<FileText size={20} />}
        />

        <CardModulo
          titulo="PDF"
          descripcion="Acceso a informes generados en PDF."
          ruta="/repositorios/pdf"
          color="bg-red-600"
          icono={<File size={20} />}
        />

        <CardModulo
          titulo="Archivos"
          descripcion="Almacenamiento general de archivos técnicos."
          ruta="/repositorios/archivos"
          color="bg-green-600"
          icono={<Folder size={20} />}
        />

      </div>
    </div>
  );
}
