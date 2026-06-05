import { useState } from "react";
import { Folder, X } from "lucide-react";
import { MANUALES_TECNICOS } from "@/data/manualesTecnicos";

export default function ManualesTecnicos() {
  const [modalUrl, setModalUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const openManual = (url) => {
    if (!url) return;
    // Abrir en modal dentro de la app
    setLoading(true);
    setModalUrl(url);
    // body overflow lock to avoid background scroll
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalUrl(null);
    setLoading(true);
    document.body.style.overflow = ""; // restore
  };

  const onIframeLoad = () => {
    setLoading(false);
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

      {/* MODAL IFRAME */}
      {modalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />

          {/* modal box */}
          <div className="relative w-[95%] md:w-4/5 lg:w-3/4 h-[85%] bg-white rounded-2xl shadow-lg overflow-hidden z-10">
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="text-sm font-semibold">Visor - Documentación</div>

              <div className="flex items-center gap-2">
                {/* abrir en nueva pestaña */}
                <button
                  onClick={() => window.open(modalUrl, "_blank", "noopener,noreferrer")}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Abrir en nueva pestaña
                </button>

                {/* cerrar */}
                <button
                  onClick={closeModal}
                  aria-label="Cerrar"
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* contenido: spinner mientras carga + iframe */}
            <div className="w-full h-full bg-gray-50 relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
                    <div className="text-sm text-gray-600">Cargando documento...</div>
                  </div>
                </div>
              )}

              <iframe
                title="Manual técnico"
                src={modalUrl}
                onLoad={onIframeLoad}
                className="w-full h-full border-0"
                sandbox="" /* no sandbox to allow normal behavior; set if you need stricter rules */
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
