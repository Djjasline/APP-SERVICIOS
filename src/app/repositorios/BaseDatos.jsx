import { ExternalLink, Database } from "lucide-react";

export default function BaseDatos() {
  const TEAMDESK_URL = "https://www.teamdesk.net/secure/db/53431/overview.aspx?t=381285";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Base de datos
        </h2>
        <p className="text-sm text-gray-300">
          Acceso a la base de datos empresarial ASTAP en TeamDesk.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-600 text-white p-3 rounded-lg">
            <Database size={24} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Base de datos ASTAP
            </h3>
            <p className="text-sm text-gray-500">
              Consulta y gestión de información empresarial.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            window.open(TEAMDESK_URL, "_blank", "noopener,noreferrer")
          }
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
        >
          Abrir TeamDesk
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}
