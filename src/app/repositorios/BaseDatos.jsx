import { useNavigate } from "react-router-dom";
import { ExternalLink, ArrowLeft, Database } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function BaseDatos() {
  const navigate = useNavigate();
  const { isLight } = useTheme();

  const TEAMDESK_URL =
    "https://www.teamdesk.net/secure/db/53431/overview.aspx?t=381285";

  const openTeamDesk = () => {
    window.open(TEAMDESK_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className={`text-xl font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            <Database size={22} />
            Base de datos
          </h2>

          <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Acceso a la base de datos empresarial ASTAP en TeamDesk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/repositorios")}
          className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition inline-flex items-center gap-2 w-fit"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      {/* TARJETA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow overflow-hidden max-w-2xl">
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <Database size={28} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Base de datos ASTAP
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                TeamDesk se abrirá en una pestaña segura del navegador.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800">
            Por seguridad, algunas plataformas externas no permiten mostrarse
            dentro de la app. Usa el botón inferior para acceder directamente.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/repositorios")}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={openTeamDesk}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              Abrir TeamDesk
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
