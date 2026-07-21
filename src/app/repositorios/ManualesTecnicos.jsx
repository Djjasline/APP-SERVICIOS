import { useNavigate } from "react-router-dom";
import { Folder, ExternalLink, ArrowLeft } from "lucide-react";
import { MANUALES_TECNICOS } from "@/data/manualesTecnicos";
import { useTheme } from "@/context/ThemeContext";
import { openExternalResource } from "@/services/resourceUsageService";

export default function ManualesTecnicos() {
  const navigate = useNavigate();
  const { isLight } = useTheme();

  const openManual = (item) => {
    if (!item?.url) return;
    openExternalResource({
      subtipo: "manuales-tecnicos",
      label: item.nombre,
      url: item.url,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className={`text-xl font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            Biblioteca técnica del area de vehiculos especiales
          </h2>

          <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            Explorador técnico de manuales, catálogos y documentación especializada.
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

      {/* EXPLORADOR */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="divide-y">
          {MANUALES_TECNICOS.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => openManual(item)}
              className="
                w-full
                flex
                items-center
                gap-4
                px-6
                py-5
                hover:bg-gray-50
                transition
                text-left
              "
            >
              {/* ICONO */}
              <div
                className={`
                  w-12
                  h-12
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-white
                  shrink-0
                  ${item.color}
                `}
              >
                <Folder size={24} />
              </div>

              {/* INFO */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">
                  {item.nombre}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Abrir documentación técnica
                </p>
              </div>

              <ExternalLink size={18} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
