import { useNavigate } from "react-router-dom";
import { ExternalLink, ArrowLeft, Database } from "lucide-react";

export default function BaseDatos() {
  const navigate = useNavigate();

  const TEAMDESK_URL =
    "https://www.teamdesk.net/secure/db/53431/overview.aspx?t=381285";

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database size={20} />
            Base de datos
          </h2>

          <p className="text-sm text-gray-300">
            Vista interna de la base empresarial ASTAP en TeamDesk.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/repositorios")}
            className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <button
            type="button"
            onClick={() =>
              window.open(TEAMDESK_URL, "_blank", "noopener,noreferrer")
            }
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
          >
            Abrir externo
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      {/* VISOR INTERNO */}
      <div className="bg-white rounded-xl shadow overflow-hidden h-[78vh] border border-white/10">
        <iframe
          src={TEAMDESK_URL}
          title="Base de datos TeamDesk"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
