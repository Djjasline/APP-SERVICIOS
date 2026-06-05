import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, X, ExternalLink, ArrowLeft } from "lucide-react";
import { MANUALES_TECNICOS } from "@/data/manualesTecnicos";

export default function ManualesTecnicos() {
  const navigate = useNavigate();

  const [selectedManual, setSelectedManual] = useState(null);

  const openManual = (item) => {
    if (!item?.url) return;
    setSelectedManual(item);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedManual(null);
    document.body.style.overflow = "";
  };

  const openExternal = () => {
    if (!selectedManual?.url) return;
    window.open(selectedManual.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Manuales técnicos de vehículos especiales
          </h2>

          <p className="text-sm text-gray-300 mt-1">
            Explorador técnico de manuales, catálogos y documentación especializada.
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

      {/* MODAL SIN IFRAME */}
      {selectedManual && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeModal}
          />

          {/* modal box */}
          <div className="relative w-[92%] max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden z-10">
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {selectedManual.nombre}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  SharePoint no permite vista previa interna. Ábrelo desde el botón inferior.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar"
                className="p-2 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* contenido */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                Este documento se abrirá en una pestaña segura de SharePoint.
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={openExternal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                  Abrir documento
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
