import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Eye, EyeOff, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getConfiguratorQuoteById } from "@/services/configuratorQuoteService";
import { downloadConfiguratorPdf } from "./configuratorPdf";

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <FileText size={20} className="text-blue-600" /> Cotización Vactor
          </h1>
          <p className="text-sm text-slate-500">Vista de solo lectura similar a los formularios.</p>
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
            <a href={quote.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              <ExternalLink size={16} /> PDF guardado
            </a>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Cotización" value={quote.quote_number} />
          <Info label="Cliente" value={quote.customer} />
          <Info label="Cliente final" value={quote.end_customer} />
          <Info label="Vendedor" value={quote.sales_person} />
          <Info label="Modelo" value={`${quote.model_name || "Vactor"} (${quote.model_family || "Vactor"})`} />
          <Info label="Estado" value={quote.status || "guardada"} />
          <Info label="Creada" value={formatDate(quote.created_at)} />
          <Info label="Actualizada" value={formatDate(quote.updated_at)} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Configuración seleccionada</h2>
            <p className="text-sm text-slate-500">Características técnicas guardadas para esta cotización.</p>
          </div>
          <div className="rounded-xl bg-slate-900 px-4 py-3 text-white">
            <p className="text-xs text-slate-300">{hideValues ? "Modo visual" : "Total"}</p>
            <p className="font-bold">{hideValues ? "Sin valores" : money(priceSummary.total)}</p>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Sin opciones adicionales seleccionadas.</p>
          ) : (
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
                    <td className="px-3 py-2 font-semibold text-slate-900">{item.label}</td>
                    <td className="px-3 py-2 text-slate-700">{item.value}</td>
                    {!hideValues && <td className="px-3 py-2 text-right font-semibold text-slate-900">{money(item.price)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 text-sm text-slate-500">
          {hideValues ? "Modo visual activo: la vista y el PDF descargado desde aquí no muestran importes." : <>Base: <strong>{money(priceSummary.base)}</strong> | Opciones: <strong>{money(priceSummary.options)}</strong></>}
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
