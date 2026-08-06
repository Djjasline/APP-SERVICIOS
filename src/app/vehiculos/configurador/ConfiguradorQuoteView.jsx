import { useEffect, useMemo, useState } from "react";
import { Download, Eye, EyeOff, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getConfiguratorQuoteById } from "@/services/configuratorQuoteService";
import { downloadConfiguratorPdf, downloadStoredConfiguratorPdf } from "./configuratorPdf";

const VACTOR_LINE_IMAGE = "/vactor-linea.png.png";
const SPRITE_COLUMNS = 4;
const SPRITE_ROWS = 2;

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function formatImpact(value) {
  return typeof value === "number" ? money(value) : "Por definir";
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const MODEL_SPRITES = {
  "2100i": { col: 0, row: 0 },
  "water-recycler": { col: 1, row: 0 },
  impact: { col: 2, row: 0 },
  "2100i-cb": { col: 3, row: 0 },
  "ramjet-truck": { col: 0, row: 1 },
  "ramjet-trailer": { col: 1, row: 1 },
  ace: { col: 2, row: 1 },
  truvac: { col: 3, row: 1 },
};

function PriorityBadge({ priority }) {
  if (!priority) return null;

  return <span className="ml-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-200">{priority}</span>;
}

function ModelPreviewImage({ model }) {
  const [imageSrc, setImageSrc] = useState("");
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!model?.sprite) {
      setFallback(true);
      return;
    }

    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      const cellWidth = image.naturalWidth / SPRITE_COLUMNS;
      const cellHeight = image.naturalHeight / SPRITE_ROWS;
      const cropHeight = cellHeight * (model.sprite.row === 0 ? 0.72 : 0.6);
      const canvas = document.createElement("canvas");
      canvas.width = cellWidth;
      canvas.height = cropHeight;
      const context = canvas.getContext("2d");

      context.drawImage(
        image,
        model.sprite.col * cellWidth,
        model.sprite.row * cellHeight,
        cellWidth,
        cropHeight,
        0,
        0,
        cellWidth,
        cropHeight
      );

      setImageSrc(canvas.toDataURL("image/png"));
      setFallback(false);
    };

    image.onerror = () => {
      if (!cancelled) setFallback(true);
    };

    setImageSrc("");
    setFallback(false);
    image.src = VACTOR_LINE_IMAGE;

    return () => {
      cancelled = true;
    };
  }, [model?.sprite?.col, model?.sprite?.row]);

  return (
    <div className="flex h-40 items-center justify-center rounded-xl bg-white p-3 ring-1 ring-slate-200">
      {fallback ? (
        <img src={model?.fallbackImage || "/hidro-base.png"} alt={model?.name || "Equipo Vactor"} className="h-full w-full object-contain" />
      ) : imageSrc ? (
        <img src={imageSrc} alt={model?.name || "Equipo Vactor"} className="h-full w-full object-contain" />
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
      )}
    </div>
  );
}

function buildPdfPayload(quote, hideValues) {
  return {
    quote: {
      number: quote.quote_number || "cotizacion-vactor",
      customer: quote.customer || "Cliente por definir",
      endCustomer: quote.end_customer || "Cliente final",
      salesPerson: quote.sales_person || "ASTAP",
    },
    selectedModelId: quote.model_id,
    selectedModel: {
      id: quote.model_id,
      name: quote.model_name || "Vactor",
      family: quote.model_family || "Vactor",
      fallbackImage: "/hidro-base.png",
      sprite: MODEL_SPRITES[quote.model_id],
    },
    config: quote.config || {},
    toggles: quote.toggles || {},
    priceSummary: quote.price_summary || {},
    items: quote.items || [],
    hideValues,
  };
}

export default function ConfiguradorQuoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hideValues, setHideValues] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadQuote() {
      setLoading(true);
      setError("");

      try {
        const row = await getConfiguratorQuoteById(id);
        if (cancelled) return;
        if (!row) {
          setError("No se encontró la cotización.");
          setQuote(null);
          return;
        }
        setQuote(row);
      } catch (err) {
        console.error("Error cargando cotización del configurador:", err);
        if (!cancelled) setError("No se pudo cargar la cotización.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const pdfPayload = useMemo(() => (quote ? buildPdfPayload(quote, hideValues) : null), [hideValues, quote]);

  const downloadPdf = async () => {
    if (!pdfPayload) return;
    setDownloading(true);
    setError("");

    try {
      await downloadConfiguratorPdf(pdfPayload);
    } catch (err) {
      console.error("Error generando PDF desde vista de configurador:", err);
      setError("No se pudo generar el PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadSavedPdf = async () => {
    if (!quote?.pdf_url) return;
    setDownloading(true);
    setError("");

    try {
      await downloadStoredConfiguratorPdf(quote.pdf_url, quote.quote_number);
    } catch (err) {
      console.error("Error descargando PDF guardado del configurador:", err);
      setError(err?.message || "No se pudo descargar el PDF guardado.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Cargando cotización...</div>;
  }

  if (error && !quote) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm font-semibold text-red-700">{error}</p>
        <button type="button" onClick={() => navigate("/vehiculos/configurador")} className="btn-volver-orange mt-4">
          Volver
        </button>
      </div>
    );
  }

  const items = quote.items || [];
  const priceSummary = quote.price_summary || {};
  const selectedModel = pdfPayload?.selectedModel;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <FileText size={20} className="text-blue-600" /> Cotización Vactor
          </h1>
          <p className="text-sm text-slate-500">Vista previa tipo PDF de la cotización guardada.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setHideValues((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              hideValues ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {hideValues ? <EyeOff size={16} /> : <Eye size={16} />}
            {hideValues ? "Valores ocultos" : "Ocultar valores"}
          </button>
          {quote.pdf_url && (
            <button type="button" onClick={downloadSavedPdf} disabled={downloading} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60">
              <Download size={16} /> PDF guardado
            </button>
          )}
          <button type="button" onClick={downloadPdf} disabled={downloading} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            <Download size={16} /> {downloading ? "Generando..." : "Descargar PDF"}
          </button>
          <button type="button" onClick={() => navigate("/vehiculos/configurador")} className="btn-volver-orange">
            Volver
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{error}</p>}

      <section className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col gap-2 bg-slate-900 px-6 py-5 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Cotización técnica Vactor</h2>
            <p className="mt-2 text-sm text-slate-300">No. {quote.quote_number || "-"}</p>
          </div>
          <div className="text-sm text-slate-300 md:text-right">
            <p>{formatDate(quote.created_at)}</p>
            <p>Estado: {quote.status || "guardada"}</p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Info label="Cliente" value={quote.customer} />
              <Info label="Cliente final" value={quote.end_customer} />
              <Info label="Vendedor" value={quote.sales_person} />
              <Info label="Modelo" value={`${quote.model_name || "Vactor"} (${quote.model_family || "Vactor"})`} />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[300px_1fr] lg:items-center">
              <ModelPreviewImage model={selectedModel} />
              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm font-bold text-slate-900">{hideValues ? "Resumen técnico" : "Resumen económico"}</p>
                {hideValues ? (
                  <>
                    <p className="mt-2 text-sm text-slate-600">Documento visual sin valores comerciales.</p>
                    <p className="text-sm text-slate-600">Incluye características y opciones seleccionadas.</p>
                  </>
                ) : (
                  <div className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
                    <p>Base: <strong>{money(priceSummary.base)}</strong></p>
                    <p>Opciones: <strong>{money(priceSummary.options)}</strong></p>
                    <p>Total: <strong>{money(priceSummary.total)}</strong></p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-bold text-slate-900">Configuración seleccionada</h3>
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Sin opciones adicionales seleccionadas.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Detalle</th>
                    <th className="px-3 py-2 font-semibold">Valor</th>
                    {!hideValues && <th className="px-3 py-2 text-right font-semibold">Impacto</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.key}-${item.value}`} className="border-b border-slate-200 odd:bg-slate-50">
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {item.label}
                        <PriorityBadge priority={item.priority} />
                        {item.info && <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{item.info.reference}</span>}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{item.value}</td>
                      {!hideValues && <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatImpact(item.price)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>

          <div className="border-t border-slate-200 pt-4 text-sm text-slate-500">
            {hideValues ? "Documento visual sin valores comerciales. Características sujetas a validación técnica y disponibilidad." : "Valores referenciales sujetos a validación de catálogo, reglas técnicas, disponibilidad y precios finales."}
          </div>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}
