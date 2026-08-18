import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Calculator, FileText, History, Package, Plus, Printer, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";
import ClientReferenceInput from "@/components/ClientReferenceInput";
import SignatureCanvas from "@/components/SignatureCanvasField";
import { getVehicleReferenceCatalog, getWarehouseInventory, WAREHOUSE_ITEM_SOURCES } from "@/services/warehouseInventoryService";
import { getVehicleServiceQuoteById, getVehicleServiceQuoteHistory, regenerateVehicleServiceQuotePdf, saveVehicleServiceQuote, updateVehicleServiceQuote } from "@/services/vehicleServiceQuoteService";

const EMPTY_SERVICE = {
  description: "",
  quantity: "1",
  unitPrice: "0",
};

const DEFAULT_CPC_CODE = "871410018";
const DEFAULT_CPC_DESCRIPTION = "SERVICIOS DE MANTENIMIENTO CORRECTIVO Y REPARACION DE VEHICULOS DE MOTOR";

const EMPTY_OFFER = {
  proformaNo: "",
  client: "",
  ruc: "",
  phone: "",
  attention: "",
  reference: "",
  validityDays: "60",
  date: new Date().toISOString().slice(0, 10),
  intro: "Tenemos el agrado de cotizar a ustedes los repuestos y servicios requeridos.",
  cpcCode: DEFAULT_CPC_CODE,
  cpcDescription: DEFAULT_CPC_DESCRIPTION,
  amountInWords: "",
  delivery: "120 días a partir del pago del anticipo.",
  payment: "70% en calidad de anticipo, restante contraentrega.",
  warranty: "Seis meses contra defectos de materiales e instalación.",
  notes: "Los precios ofertados son por la TOTALIDAD de la oferta; en caso de adjudicación parcial los precios serán revisados.",
  preparedBy: "",
  approvedBy: "",
  acceptedBy: "",
  signatures: {
    prepared: "",
    approved: "",
    accepted: "",
  },
};

function formatNumber(value) {
  return new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function money(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("es-EC").format(new Date(year, month - 1, day));
}

function quoteSqlErrorMessage(err, fallback) {
  return ["42P01", "42703", "23514"].includes(err?.code)
    ? "Falta ejecutar o actualizar supabase/sql/vehicle_service_quotes.sql."
    : fallback;
}

function buildLineFromItem(item, source) {
  const isReference = source === WAREHOUSE_ITEM_SOURCES.vehicleReference;
  const availableQuantity = Number(isReference ? item.reference_stock : item.physical_stock) || 0;

  return {
    id: `${source}-${item.id}-${Date.now()}`,
    source,
    itemId: item.id,
    productCode: item.product_code,
    description: item.description,
    supplier: item.last_supplier || "",
    location: isReference ? "" : item.physical_location || "",
    availability: isReference ? "Solo referencia histórica" : availableQuantity > 0 ? "Disponible en bodega" : "Sin stock físico",
    availableQuantity,
    unit: item.unit || "u",
    quantity: "1",
    unitPrice: isReference && item.last_cost ? String(item.last_cost) : "0",
    approvalRequired: true,
  };
}

function lineTotal(line) {
  return (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
}

export default function CotizadorHome() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [stockItems, setStockItems] = useState([]);
  const [referenceItems, setReferenceItems] = useState([]);
  const [lines, setLines] = useState([]);
  const [offer, setOffer] = useState(EMPTY_OFFER);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [savingQuote, setSavingQuote] = useState(false);
  const [loadingQuoteId, setLoadingQuoteId] = useState("");
  const [regeneratingPdfId, setRegeneratingPdfId] = useState("");
  const [editingQuoteId, setEditingQuoteId] = useState("");
  const [message, setMessage] = useState("");

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + lineTotal(line), 0), [lines]);
  const iva = subtotal * 0.12;
  const total = subtotal + iva;
  const approvalCount = useMemo(() => lines.filter((line) => line.approvalRequired).length, [lines]);

  const loadItems = async () => {
    setLoading(true);
    setError("");

    try {
      const [stockRows, referenceRows] = await Promise.all([
        getWarehouseInventory({ search: deferredSearch, limit: 80 }),
        getVehicleReferenceCatalog({ search: deferredSearch, limit: 80 }),
      ]);
      setStockItems(stockRows);
      setReferenceItems(referenceRows);
    } catch (err) {
      console.error("Error cargando datos para cotizador:", err);
      setError("No se pudo consultar Bodega. Revisa permisos o conexión con Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [deferredSearch]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    setHistoryError("");

    try {
      const rows = await getVehicleServiceQuoteHistory();
      setHistory(rows);
    } catch (err) {
      console.error("Error cargando historial de cotizador:", err);
      setHistoryError(quoteSqlErrorMessage(err, "No se pudo cargar el historial de cotizaciones."));
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const addWarehouseLine = (item, source) => {
    setLines((current) => [buildLineFromItem(item, source), ...current]);
  };

  const addServiceLine = () => {
    if (!serviceForm.description.trim()) return;
    setLines((current) => [{
      id: `service-${Date.now()}`,
      source: "service",
      productCode: "SERVICIO",
      description: serviceForm.description.trim(),
      supplier: "ASTAP",
      location: "",
      availability: "Servicio",
      availableQuantity: null,
      unit: "u",
      quantity: serviceForm.quantity || "1",
      unitPrice: serviceForm.unitPrice || "0",
      approvalRequired: false,
    }, ...current]);
    setServiceForm(EMPTY_SERVICE);
  };

  const updateLine = (id, field, value) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  };

  const removeLine = (id) => {
    setLines((current) => current.filter((line) => line.id !== id));
  };

  const updateOffer = (field, value) => {
    setOffer((current) => ({ ...current, [field]: value }));
  };

  const updateSignature = (field, value) => {
    setOffer((current) => ({ ...current, signatures: { ...(current.signatures || {}), [field]: value } }));
  };

  const quotePayload = () => ({
    offer,
    lines,
    totals: { subtotal, iva, total },
  });

  const saveQuote = async () => {
    setSavingQuote(true);
    setMessage("");
    setHistoryError("");

    try {
      const saved = editingQuoteId
        ? await updateVehicleServiceQuote(editingQuoteId, quotePayload())
        : await saveVehicleServiceQuote(quotePayload());
      setEditingQuoteId(saved.id);
      setHistory((current) => [saved, ...current.filter((item) => item.id !== saved.id)].slice(0, 50));
      if (saved.status === "pdf_pendiente") {
        setMessage("Cotización guardada. El PDF quedó pendiente; puedes reintentarlo desde el historial.");
      } else {
        setMessage(editingQuoteId ? "Cotización actualizada en historial con PDF." : "Cotización guardada en historial con PDF.");
      }
    } catch (err) {
      console.error("Error guardando cotización de servicios:", err);
      setHistoryError(quoteSqlErrorMessage(err, err?.message || "No se pudo guardar la cotización."));
    } finally {
      setSavingQuote(false);
    }
  };

  const loadQuoteAsBase = async (id, edit = false) => {
    setLoadingQuoteId(id);
    setMessage("");
    setHistoryError("");

    try {
      const row = await getVehicleServiceQuoteById(id);
      if (!row) {
        setHistoryError("No se encontró la cotización seleccionada.");
        return;
      }
      setOffer({ ...EMPTY_OFFER, ...(row.offer || {}), signatures: { ...EMPTY_OFFER.signatures, ...(row.offer?.signatures || {}) } });
      setLines(row.lines || []);
      setEditingQuoteId(edit ? row.id : "");
      setMessage(edit ? "Cotización cargada para edición." : "Cotización cargada como base nueva.");
    } catch (err) {
      console.error("Error cargando cotización de servicios:", err);
      setHistoryError("No se pudo cargar la cotización seleccionada.");
    } finally {
      setLoadingQuoteId("");
    }
  };

  const resetQuote = () => {
    setOffer(EMPTY_OFFER);
    setLines([]);
    setEditingQuoteId("");
    setMessage("Cotización reiniciada.");
  };

  const retryPdf = async (id) => {
    setRegeneratingPdfId(id);
    setMessage("");
    setHistoryError("");

    try {
      const updated = await regenerateVehicleServiceQuotePdf(id);
      setHistory((current) => current.map((quote) => (quote.id === updated.id ? updated : quote)));
      setMessage(updated.status === "pdf_pendiente" ? "El PDF sigue pendiente. Intenta nuevamente más tarde." : "PDF generado correctamente.");
    } catch (err) {
      console.error("Error regenerando PDF del cotizador:", err);
      setHistoryError(quoteSqlErrorMessage(err, err?.message || "No se pudo regenerar el PDF."));
    } finally {
      setRegeneratingPdfId("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <style>{`@media print { body * { visibility: hidden; } .offer-print, .offer-print * { visibility: visible; } .offer-print { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Vehículos Especiales</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-900">
            <Calculator size={22} className="text-amber-600" /> {VEHICULOS_TEXT.cotizador.title}
          </h2>
          <p className="text-sm text-slate-500">{VEHICULOS_TEXT.cotizador.description}</p>
        </div>
        <button type="button" onClick={() => navigate("/area/vehiculos")} className="btn-volver-orange">
          Volver
        </button>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Cotizador independiente del configurador de equipos nuevos.</p>
        <p className="mt-1">Los repuestos se cruzan con Bodega. Cualquier salida, reserva o uso de stock deberá pasar por aprobación antes de afectar inventario.</p>
      </section>

      <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Datos de la oferta final</h3>
            <p className="text-sm text-slate-500">Estos campos alimentan el formato de entrega al cliente.</p>
          </div>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Printer size={16} /> Imprimir oferta
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <OfferField label="Proforma No." value={offer.proformaNo} onChange={(value) => updateOffer("proformaNo", value)} />
          <OfferField label="Fecha" type="date" value={offer.date} onChange={(value) => updateOffer("date", value)} />
          <OfferField label="Validez días" type="number" value={offer.validityDays} onChange={(value) => updateOffer("validityDays", value)} />
          <ClientOfferField
            label="Cliente"
            value={offer.client}
            onChange={(value) => updateOffer("client", value)}
            onSelect={(client) => {
              updateOffer("client", client.name || "");
              updateOffer("ruc", client.tax_id || "");
            }}
          />
          <OfferField label="RUC" value={offer.ruc} onChange={(value) => updateOffer("ruc", value)} />
          <OfferField label="Teléfono" value={offer.phone} onChange={(value) => updateOffer("phone", value)} />
          <OfferField label="Atención" value={offer.attention} onChange={(value) => updateOffer("attention", value)} />
          <OfferField label="Referencia" value={offer.reference} onChange={(value) => updateOffer("reference", value)} />
          <OfferField label="Preparado por" value={offer.preparedBy} onChange={(value) => updateOffer("preparedBy", value)} />
          <OfferField label="Aprobado por" value={offer.approvedBy} onChange={(value) => updateOffer("approvedBy", value)} />
          <OfferField label="Aceptación cliente" value={offer.acceptedBy} onChange={(value) => updateOffer("acceptedBy", value)} />
          <OfferField label="CPC" value={offer.cpcCode} onChange={(value) => updateOffer("cpcCode", value)} />
          <OfferField label="Descripción CPC" value={offer.cpcDescription} onChange={(value) => updateOffer("cpcDescription", value)} />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <OfferField multiline label="Introducción" value={offer.intro} onChange={(value) => updateOffer("intro", value)} />
          <OfferField multiline label="Son" value={offer.amountInWords} onChange={(value) => updateOffer("amountInWords", value)} placeholder="Valor en letras más IVA" />
          <OfferField multiline label="Entrega" value={offer.delivery} onChange={(value) => updateOffer("delivery", value)} />
          <OfferField multiline label="Forma de pago" value={offer.payment} onChange={(value) => updateOffer("payment", value)} />
          <OfferField multiline label="Garantía" value={offer.warranty} onChange={(value) => updateOffer("warranty", value)} />
          <OfferField multiline label="Notas" value={offer.notes} onChange={(value) => updateOffer("notes", value)} />
        </div>
        <div className="mt-4 grid items-stretch gap-4 md:grid-cols-3">
          <SignatureField label="Firma preparado por" name={offer.preparedBy} signature={offer.signatures.prepared} onSignatureChange={(value) => updateSignature("prepared", value)} />
          <SignatureField label="Firma aprobado por" name={offer.approvedBy} signature={offer.signatures.approved} onSignatureChange={(value) => updateSignature("approved", value)} />
          <SignatureField label="Firma aceptación cliente" name={offer.acceptedBy} signature={offer.signatures.accepted} onSignatureChange={(value) => updateSignature("accepted", value)} />
        </div>
      </section>

      <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Buscar repuestos</h3>
            <p className="text-sm text-slate-500">Consulta stock real y referencia histórica. Las imágenes quedan para una fase futura.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar código, descripción o proveedor" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-400 sm:w-96" />
            </label>
            <button type="button" onClick={loadItems} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>
        </div>

        {error && <p className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"><AlertTriangle size={16} /> {error}</p>}

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <ResultPanel title="Stock real de bodega" rows={stockItems} source={WAREHOUSE_ITEM_SOURCES.stock} empty="Sin coincidencias en stock real." onAdd={addWarehouseLine} />
          <ResultPanel title="Referencia histórica" rows={referenceItems} source={WAREHOUSE_ITEM_SOURCES.vehicleReference} empty="Sin coincidencias en referencia histórica." onAdd={addWarehouseLine} />
        </div>
      </section>

      <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">Agregar servicio manual</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_140px_160px_auto]">
          <input value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descripción del servicio" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400" />
          <input type="number" value={serviceForm.quantity} onChange={(event) => setServiceForm((current) => ({ ...current, quantity: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400" />
          <input type="number" value={serviceForm.unitPrice} onChange={(event) => setServiceForm((current) => ({ ...current, unitPrice: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400" />
          <button type="button" onClick={addServiceLine} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            <Plus size={16} /> Agregar
          </button>
        </div>
      </section>

      <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Cotización en preparación</h3>
            <p className="text-sm text-slate-500">Guarda el borrador en historial, edítalo cuando sea necesario o úsalo como base para una nueva oferta.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button type="button" onClick={saveQuote} disabled={savingQuote} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              <Save size={16} /> {savingQuote ? "Guardando..." : editingQuoteId ? "Actualizar historial" : "Guardar historial"}
            </button>
            <button type="button" onClick={resetQuote} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Nueva cotización
            </button>
            <div className="rounded-xl bg-slate-900 px-4 py-3 text-right text-white">
              <p className="text-xs text-slate-300">Total referencial</p>
              <p className="text-xl font-bold">{money(total)}</p>
            </div>
          </div>
        </div>

        {message && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</p>}
        {historyError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{historyError}</p>}

        {approvalCount > 0 && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{approvalCount} línea(s) requieren aprobación antes de generar salida, reserva o uso de stock.</p>}

        <div className="mt-4 overflow-x-auto">
          {lines.length === 0 ? (
            <p className="text-sm text-slate-500">Agrega repuestos desde Bodega o servicios manuales para comenzar.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-3 py-2 font-semibold">Código</th>
                  <th className="px-3 py-2 font-semibold">Descripción</th>
                  <th className="px-3 py-2 font-semibold">Estado</th>
                  <th className="px-3 py-2 font-semibold">Un.</th>
                  <th className="px-3 py-2 text-right font-semibold">Cantidad</th>
                  <th className="px-3 py-2 text-right font-semibold">Precio unit.</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                  <th className="px-3 py-2 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b border-slate-200 odd:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-900">{line.productCode}</td>
                    <td className="px-3 py-2 text-slate-700">{line.description}</td>
                    <td className="px-3 py-2 text-slate-600">{line.availability}</td>
                    <td className="px-3 py-2"><input value={line.unit} onChange={(event) => updateLine(line.id, "unit", event.target.value)} className="w-16 rounded-lg border border-slate-200 px-2 py-1" /></td>
                    <td className="px-3 py-2 text-right"><input type="number" value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", event.target.value)} className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right" /></td>
                    <td className="px-3 py-2 text-right"><input type="number" value={line.unitPrice} onChange={(event) => updateLine(line.id, "unitPrice", event.target.value)} className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right" /></td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{money(lineTotal(line))}</td>
                    <td className="px-3 py-2"><button type="button" onClick={() => removeLine(line.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"><Trash2 size={14} /> Quitar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <HistoryPanel history={history} loading={loadingHistory} loadingQuoteId={loadingQuoteId} regeneratingPdfId={regeneratingPdfId} error={historyError} onRefresh={loadHistory} onEdit={(id) => loadQuoteAsBase(id, true)} onUseAsBase={(id) => loadQuoteAsBase(id, false)} onRetryPdf={retryPdf} />

      <OfferPreview offer={offer} lines={lines} subtotal={subtotal} iva={iva} total={total} />
    </div>
  );
}

function OfferField({ label, value, onChange, type = "text", multiline = false, placeholder = "" }) {
  const className = "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400";

  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} placeholder={placeholder} className={className} />
      ) : (
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />
      )}
    </label>
  );
}

function ClientOfferField({ label, value, onChange, onSelect }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <ClientReferenceInput
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400"
        value={value}
        onValueChange={onChange}
        onSelect={onSelect}
      />
    </label>
  );
}

function SignatureField({ label, name, signature, onSignatureChange }) {
  const signatureRef = useRef(null);
  const loadedSignatureRef = useRef("");

  useEffect(() => {
    if (!signatureRef.current) return;
    if ((signature || "") === loadedSignatureRef.current) return;
    signatureRef.current.clear();
    if (signature) signatureRef.current.fromDataURL(signature);
    loadedSignatureRef.current = signature || "";
  }, [signature]);

  const handleEnd = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) return;
    const dataUrl = signatureRef.current.toDataURL("image/png");
    loadedSignatureRef.current = dataUrl;
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    loadedSignatureRef.current = "";
    onSignatureChange("");
  };

  return (
    <div className="flex h-full min-h-[152px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-xs text-slate-500">{name || "Nombre pendiente"}</p>
        </div>
        <button type="button" onClick={clearSignature} className="text-xs font-semibold text-red-600 hover:underline">Borrar firma</button>
      </div>
      <div className="mt-2 h-20 min-h-0 overflow-hidden rounded-lg border border-slate-300 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          minWidth={0.5}
          maxWidth={1.8}
          onEnd={handleEnd}
          canvasProps={{ className: "block h-full w-full" }}
        />
      </div>
    </div>
  );
}

function HistoryPanel({ history, loading, loadingQuoteId, regeneratingPdfId, error, onRefresh, onEdit, onUseAsBase, onRetryPdf }) {
  return (
    <section className="no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-slate-900"><History size={18} className="text-blue-600" /> Historial de cotizaciones</h3>
          <p className="text-sm text-slate-500">Cotizaciones de repuestos y servicios guardadas en Supabase.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto">
        {loading && history.length === 0 ? (
          <p className="text-sm text-slate-500">Cargando historial...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay cotizaciones guardadas.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-3 py-2 font-semibold">Proforma</th>
                <th className="px-3 py-2 font-semibold">Cliente</th>
                <th className="px-3 py-2 font-semibold">Referencia</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
                <th className="px-3 py-2 font-semibold">Fecha</th>
                <th className="px-3 py-2 font-semibold">PDF</th>
                <th className="px-3 py-2 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.map((quote) => (
                <tr key={quote.id} className="border-b border-slate-200 odd:bg-slate-50">
                  <td className="px-3 py-2 font-semibold text-slate-900">{quote.quote_number || "Por definir"}</td>
                  <td className="px-3 py-2 text-slate-700">{quote.client || "-"}</td>
                  <td className="px-3 py-2 text-slate-700">{quote.reference || "-"}</td>
                  <td className="px-3 py-2 text-right font-semibold text-slate-900">{money(quote.totals?.total)}</td>
                  <td className="px-3 py-2 text-slate-600">{formatDate(String(quote.created_at || "").slice(0, 10))}</td>
                  <td className="px-3 py-2">
                    {quote.pdf_url ? (
                      <a href={quote.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
                        <FileText size={14} /> PDF
                      </a>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-amber-700">Pendiente</span>
                        {quote.pdf_error && <p className="max-w-56 text-xs text-slate-500">{quote.pdf_error}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => onEdit(quote.id)} disabled={loadingQuoteId === quote.id} className="font-semibold text-blue-700 hover:underline disabled:opacity-60">
                        {loadingQuoteId === quote.id ? "Cargando..." : "Editar"}
                      </button>
                      <button type="button" onClick={() => onUseAsBase(quote.id)} disabled={loadingQuoteId === quote.id} className="font-semibold text-emerald-700 hover:underline disabled:opacity-60">
                        Usar como base
                      </button>
                      <button type="button" onClick={() => onRetryPdf(quote.id)} disabled={regeneratingPdfId === quote.id} className="font-semibold text-amber-700 hover:underline disabled:opacity-60">
                        {regeneratingPdfId === quote.id ? "Generando..." : "Reintentar PDF"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function OfferPreview({ offer, lines, subtotal, iva, total }) {
  return (
    <section className="offer-print rounded-2xl border border-slate-300 bg-white p-5 shadow-sm print:rounded-none print:border-0 print:shadow-none">
      <div className="flex items-start justify-between gap-4 border-b border-slate-300 pb-3 text-xs text-slate-700">
        <div>
          <p className="text-lg font-bold text-slate-900">ASTAP</p>
          <p>www.astap.com</p>
          <p>Telf: 2262-154 - Fax: 2462-160 - astap@astap.com</p>
          <p>Naciones Unidas 1084 y Amazonas - Quito, Ecuador</p>
          <p>RUC: 1790027740001</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Proforma No.</p>
          <p>{offer.proformaNo || "Por definir"}</p>
          <p className="mt-2">Fecha: {formatDate(offer.date)}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-1 text-sm md:grid-cols-2">
        <p><strong>Cliente:</strong> {offer.client || "-"}</p>
        <p><strong>RUC:</strong> {offer.ruc || "-"}</p>
        <p><strong>Teléf:</strong> {offer.phone || "-"}</p>
        <p><strong>Atención:</strong> {offer.attention || "-"}</p>
        <p><strong>Referencia:</strong> {offer.reference || "-"}</p>
        <p><strong>Validez:</strong> {offer.validityDays || "-"} días</p>
      </div>

      <p className="mt-4 text-sm leading-6">{offer.intro}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="border border-slate-400 px-2 py-1">Item</th>
              <th className="border border-slate-400 px-2 py-1">CPC</th>
              <th className="border border-slate-400 px-2 py-1">Descripción del CPC</th>
              <th className="border border-slate-400 px-2 py-1">Descripción del producto</th>
              <th className="border border-slate-400 px-2 py-1">Un.</th>
              <th className="border border-slate-400 px-2 py-1 text-right">Cant.</th>
              <th className="border border-slate-400 px-2 py-1 text-right">P. Unitario</th>
              <th className="border border-slate-400 px-2 py-1 text-right">P. Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr><td colSpan={8} className="border border-slate-300 px-2 py-3 text-center text-slate-500">Sin ítems agregados.</td></tr>
            ) : (
              lines.map((line, index) => (
                <tr key={line.id} className="align-top">
                  <td className="border border-slate-300 px-2 py-1 text-center">{index + 1}</td>
                  <td className="border border-slate-300 px-2 py-1">{offer.cpcCode}</td>
                  <td className="border border-slate-300 px-2 py-1 uppercase">{offer.cpcDescription}</td>
                  <td className="border border-slate-300 px-2 py-1 uppercase">{line.description}</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">{line.unit || "u"}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right">{formatNumber(line.quantity)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right">{money(line.unitPrice)}</td>
                  <td className="border border-slate-300 px-2 py-1 text-right font-semibold">{money(lineTotal(line))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ml-auto mt-3 w-full max-w-xs text-sm">
        <div className="flex justify-between border-b border-slate-200 py-1"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        <div className="flex justify-between border-b border-slate-200 py-1"><span>12% IVA</span><strong>{money(iva)}</strong></div>
        <div className="flex justify-between bg-slate-900 px-2 py-2 text-white"><span>Total</span><strong>{money(total)}</strong></div>
      </div>

      <div className="mt-5 text-sm leading-6">
        <h3 className="font-bold">Términos de negociación:</h3>
        <p><strong>Son:</strong> {offer.amountInWords || "Valor en letras pendiente."}</p>
        <p><strong>Entrega:</strong> {offer.delivery}</p>
        <p><strong>Forma de pago:</strong> {offer.payment}</p>
        <p><strong>Garantía:</strong> {offer.warranty}</p>
        <p><strong>Notas:</strong> {offer.notes}</p>
        <p className="mt-2">Esta oferta se rige por los Términos de Venta Generales de ASTAP, a menos que se especifique de otra manera en esta propuesta.</p>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-6 text-center text-sm">
        <OfferSignature label="Preparado por" name={offer.preparedBy} signature={offer.signatures?.prepared} />
        <OfferSignature label="Aprobado por" name={offer.approvedBy} signature={offer.signatures?.approved} />
        <OfferSignature label="Aceptación Cliente" name={offer.acceptedBy} signature={offer.signatures?.accepted} />
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">Desde 1941 suministrando productos y servicios para aplicaciones petroleras, de agua potable, generación de energía, medio ambiente e industria</p>
    </section>
  );
}

function OfferSignature({ label, name, signature }) {
  return (
    <div className="pt-2">
      <div className="flex h-16 items-end justify-center">
        {signature && <img src={signature} alt={`Firma ${label}`} className="max-h-16 max-w-full object-contain" />}
      </div>
      <div className="border-t border-slate-500 pt-2">{label}: {name || "-"}</div>
    </div>
  );
}

function ResultPanel({ title, rows, source, empty, onAdd }) {
  const isReference = source === WAREHOUSE_ITEM_SOURCES.vehicleReference;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <div className="mt-3 max-h-96 overflow-auto rounded-lg bg-white">
        {rows.length === 0 ? (
          <p className="p-3 text-sm text-slate-500">{empty}</p>
        ) : (
          rows.map((item) => (
            <div key={`${source}-${item.id}`} className="border-b border-slate-100 p-3 text-sm last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.product_code}</p>
                  <p className="mt-1 text-slate-600">{item.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {isReference
                      ? `Ref: ${formatNumber(item.reference_stock)} · ${item.last_supplier || "Proveedor no definido"} · ${item.last_cost ? money(item.last_cost) : "Costo por definir"}`
                      : `Stock: ${formatNumber(item.physical_stock)} · ${item.physical_location || "Sin ubicación"}`}
                  </p>
                </div>
                <button type="button" onClick={() => onAdd(item, source)} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <Package size={14} /> Agregar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
