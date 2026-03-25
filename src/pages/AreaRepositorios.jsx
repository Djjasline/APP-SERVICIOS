import { useNavigate } from "react-router-dom";

export default function AreaRepositorios() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-xl font-bold">
        Repositorios
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* DOCUMENTOS */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Documentos</h2>
          <p className="text-sm text-gray-500">
            Gestión de documentos técnicos y manuales.
          </p>
          <button
            onClick={() => navigate("/repositorios/documentos")}
            className="mt-2 bg-blue-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

        {/* PDF */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">PDF</h2>
          <p className="text-sm text-gray-500">
            Acceso a informes generados en PDF.
          </p>
          <button
            onClick={() => navigate("/repositorios/pdf")}
            className="mt-2 bg-red-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

        {/* ARCHIVOS */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Archivos</h2>
          <p className="text-sm text-gray-500">
            Almacenamiento general de archivos técnicos.
          </p>
          <button
            onClick={() => navigate("/repositorios/archivos")}
            className="mt-2 bg-green-600 text-white px-3 py-2 rounded"
          >
            Ir
          </button>
        </div>

      </div>

    </div>
  );
}
