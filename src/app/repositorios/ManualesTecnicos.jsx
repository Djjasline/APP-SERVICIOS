import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, ExternalLink, ArrowLeft, FileText, Search } from "lucide-react";
import { MANUALES_TECNICOS } from "@/data/manualesTecnicos";
import { useTheme } from "@/context/ThemeContext";
import { openExternalResource } from "@/services/resourceUsageService";
import { formatManualFileSize, getMatchingPartNumbers, loadTechnicalManualIndex, searchTechnicalManualIndex } from "@/services/technicalManualIndexService";

export default function ManualesTecnicos() {
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const [manualIndex, setManualIndex] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    loadTechnicalManualIndex().then((index) => {
      if (mounted) setManualIndex(index);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const openManual = (item) => {
    if (!item?.url) return;
    openExternalResource({
      subtipo: "manuales-tecnicos",
      label: item.nombre,
      url: item.url,
    });
  };

  const searchResults = searchTechnicalManualIndex(manualIndex, query);
  const indexReady = manualIndex?.available;
  const indexLoading = manualIndex === null;

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
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Buscador inteligente de referencia técnica</h3>
              <p className="text-sm text-slate-500">
                Encuentra referencias, repuestos, códigos de parte, manuales, equipos y páginas relacionadas dentro de la biblioteca técnica disponible.
              </p>
            </div>
            {indexReady && (
              <p className="text-xs font-semibold text-slate-500">
                Índice: {manualIndex.totalFiles || 0} archivos · {manualIndex.totalPdfFiles || 0} PDFs
              </p>
            )}
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={20} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
                placeholder="Ej. 40029-30, 1091795, bomba, Vactor, Piquersa, aceite hidráulico"
            />
          </label>

          {indexLoading && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Cargando índice técnico de manuales...
            </div>
          )}

          {!indexLoading && !indexReady && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No se pudo cargar el índice de búsqueda publicado. Usa Recargar para limpiar caché e intenta de nuevo.
              {manualIndex?.attempts?.length > 0 && (
                <span className="mt-1 block text-xs">
                  Rutas probadas: {manualIndex.attempts.map((attempt) => `${attempt.url} (${attempt.status})`).join(", ")}
                </span>
              )}
            </div>
          )}

          {indexReady && query.trim().length >= 2 && (
            <div className="mt-4 space-y-3">
              {searchResults.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No se encontraron coincidencias para “{query}”.
                </p>
              ) : (
                searchResults.map(({ entry, pageMatches }) => (
                  <button
                    key={entry.id || entry.path}
                    type="button"
                    onClick={() => openManual({ nombre: entry.name, url: entry.webUrl })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <h4 className="truncate text-sm font-bold text-slate-900">{entry.name}</h4>
                          <span className="text-xs font-semibold uppercase text-slate-400">{entry.extension || "archivo"} · {formatManualFileSize(entry.size)}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{entry.folder}</p>
                        {pageMatches.length > 0 ? (
                          <div className="mt-2 space-y-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                            {pageMatches.slice(0, 3).map((page) => {
                              const partNumbers = getMatchingPartNumbers(page, query);
                              return (
                                <div key={`${entry.id || entry.path}-${page.page}`}>
                                  <p className="font-bold">
                                    Página {page.page || "detectada"}{partNumbers.length > 0 ? ` · ${partNumbers.slice(0, 6).join(", ")}` : ""}
                                  </p>
                                  {page.text && <p className="mt-1 line-clamp-2 text-emerald-700">{page.text}</p>}
                                </div>
                              );
                            })}
                            {pageMatches.length > 3 && <p className="font-semibold">+ {pageMatches.length - 3} coincidencias adicionales</p>}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">Coincidencia por nombre, carpeta o metadatos. La página exacta estará disponible cuando se genere el índice de texto por página.</p>
                        )}
                      </div>
                      <ExternalLink size={18} className="shrink-0 text-slate-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

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
