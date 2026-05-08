import { Folder } from "lucide-react";
import { MANUALES_TECNICOS } from "@/data/manualesTecnicos";

export default function ManualesTecnicos() {
  const openManual = (url) => {
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Manuales técnicos de vehículos especiales
        </h2>

        <p className="text-sm text-gray-300 mt-1">
          Explorador técnico de manuales, catálogos y documentación especializada.
        </p>
      </div>

      {/* EXPLORADOR */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="divide-y">
          {MANUALES_TECNICOS.map((item, index) => (
            <button
              key={index}
              onClick={() => openManual(item.url)}
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
