import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const DOCUMOTO_ELGIN_URL = "https://documoto.digabit.com/ui/home";

export default function DocumotoElgin() {
  const navigate = useNavigate();
  const { isLight } = useTheme();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className={`text-xl font-semibold flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            <BookOpen size={22} />
            Documoto - Elgin
          </h2>
          <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Portal externo de documentación técnica Documoto para equipos Elgin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/repositorios")}
          className="btn-volver-orange gap-2 w-fit"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden max-w-2xl">
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0">
              <BookOpen size={28} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Documoto - Elgin</h3>
              <p className="text-sm text-gray-500 mt-1">
                El portal se abrirá en una pestaña segura del navegador.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            Por seguridad, algunos portales externos no permiten mostrarse dentro de la app. Usa el botón inferior para acceder directamente.
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
              onClick={() => window.open(DOCUMOTO_ELGIN_URL, "_blank", "noopener,noreferrer")}
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              Abrir Documoto - Elgin
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
