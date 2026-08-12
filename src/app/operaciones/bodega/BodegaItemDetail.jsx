import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ImageIcon, Package, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getWarehouseItemDetail, updateWarehouseItemMetadata, WAREHOUSE_ITEM_SOURCES } from "@/services/warehouseInventoryService";

const SOURCE_LABELS = {
  [WAREHOUSE_ITEM_SOURCES.stock]: "Stock actual",
  [WAREHOUSE_ITEM_SOURCES.vehicleReference]: "Referencia histórica vehículos",
};

const EMPTY_FORM = {
  area: "",
  image_url: "",
  unit: "",
  weight_kg: "",
  brand: "",
  model: "",
  category: "",
  system: "",
  compatible_equipment: "",
  technical_specs: "",
  internal_notes: "",
};

function formatNumber(value) {
  return new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value) || 0);
}

function toForm(item) {
  return Object.keys(EMPTY_FORM).reduce((acc, key) => {
    acc[key] = item?.[key] ?? "";
    return acc;
  }, {});
}

export default function BodegaItemDetail() {
  const navigate = useNavigate();
  const { source, id } = useParams();
  const { isSuperAdmin } = useAuth();
  const [item, setItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const sourceLabel = SOURCE_LABELS[source] || "Bodega";
  const isReference = source === WAREHOUSE_ITEM_SOURCES.vehicleReference;
  const canEdit = isSuperAdmin;

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      setLoading(true);
      setError("");

      try {
        const row = await getWarehouseItemDetail({ source, id });
        if (cancelled) return;
        setItem(row);
        setForm(toForm(row));
      } catch (err) {
        console.error("Error cargando detalle de bodega:", err);
        if (cancelled) return;
        setError(err?.code === "42703" ? "Falta ejecutar el SQL de metadatos de bodega en Supabase." : "No se pudo cargar la ficha del artículo.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadItem();
    return () => {
      cancelled = true;
    };
  }, [source, id]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateWarehouseItemMetadata({ source, id, payload: form });
      setItem(updated);
      setForm(toForm(updated));
      setMessage("Ficha actualizada correctamente.");
    } catch (err) {
      console.error("Error guardando detalle de bodega:", err);
      setError(err?.code === "42703" ? "Falta ejecutar el SQL de metadatos de bodega en Supabase." : "No se pudo guardar la ficha del artículo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{sourceLabel}</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-900">
            <Package size={22} className="text-amber-600" /> Ficha de artículo
          </h2>
          <p className="text-sm text-slate-500">Información técnica, comercial y visual para cotizaciones, compras y soporte.</p>
        </div>
        <button type="button" onClick={() => navigate("/operaciones/bodega")} className="btn-volver-orange">
          Volver
        </button>
      </div>

      {loading ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Cargando ficha...</p>
      ) : error && !item ? (
        <ErrorBox message={error} />
      ) : item ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row">
                <ImagePreview imageUrl={form.image_url} description={item.description} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Código</p>
                  <h3 className="break-words text-2xl font-bold text-slate-900">{item.product_code}</h3>
                  <p className="mt-3 text-base font-semibold text-slate-800">{item.description}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {isReference ? (
                      <>
                        <InfoCard label="Saldo referencial" value={formatNumber(item.reference_stock)} />
                        <InfoCard label="Último costo" value={formatMoney(item.last_cost)} />
                        <InfoCard label="Proveedor" value={item.last_supplier || "-"} />
                        <InfoCard label="Último cliente" value={item.last_client || "-"} />
                      </>
                    ) : (
                      <>
                        <InfoCard label="Stock físico" value={formatNumber(item.physical_stock)} />
                        <InfoCard label="Ubicación" value={item.physical_location || "-"} />
                        <InfoCard label="Fecha corte" value={item.cutoff_date || "-"} />
                        <InfoCard label="Origen" value={item.source_file || "-"} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900 shadow-sm">
              <h3 className="font-semibold">Uso de la ficha</h3>
              <p className="mt-2 leading-6">
                Estos datos complementan el artículo para identificarlo mejor por área, preparar compras, cotizaciones y futuras reservas. No modifican cantidades de stock ni saldos históricos.
              </p>
              {!canEdit && <p className="mt-3 font-semibold">Tu acceso actual permite consultar, pero no editar esta ficha.</p>}
            </div>
          </section>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Datos complementarios</h3>
                <p className="text-sm text-slate-500">Imagen, clasificación, compatibilidad y notas técnicas del artículo.</p>
              </div>
              {canEdit && (
                <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                  <Save size={16} /> {saving ? "Guardando..." : "Guardar ficha"}
                </button>
              )}
            </div>

            {error && <div className="mt-4"><ErrorBox message={error} /></div>}
            {message && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Área / unidad de negocio" value={form.area} onChange={(value) => updateField("area", value)} disabled={!canEdit} placeholder="Vehículos, Agua, Petróleo, Industria" />
              <Field label="URL de imagen de referencia" value={form.image_url} onChange={(value) => updateField("image_url", value)} disabled={!canEdit} placeholder="https://..." />
              <Field label="Unidad" value={form.unit} onChange={(value) => updateField("unit", value)} disabled={!canEdit} placeholder="unidad, kit, m, galón" />
              <Field label="Peso kg" type="number" value={form.weight_kg} onChange={(value) => updateField("weight_kg", value)} disabled={!canEdit} placeholder="0.00" />
              <Field label="Marca" value={form.brand} onChange={(value) => updateField("brand", value)} disabled={!canEdit} />
              <Field label="Modelo / parte" value={form.model} onChange={(value) => updateField("model", value)} disabled={!canEdit} />
              <Field label="Categoría" value={form.category} onChange={(value) => updateField("category", value)} disabled={!canEdit} placeholder="Filtro, válvula, manguera..." />
              <Field label="Sistema" value={form.system} onChange={(value) => updateField("system", value)} disabled={!canEdit} placeholder="Hidráulico, agua, vacío..." />
              <Field label="Equipo compatible" value={form.compatible_equipment} onChange={(value) => updateField("compatible_equipment", value)} disabled={!canEdit} placeholder="Vactor 2100i, VCam..." />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field multiline label="Datos técnicos" value={form.technical_specs} onChange={(value) => updateField("technical_specs", value)} disabled={!canEdit} placeholder="Medidas, material, presión, voltaje, equivalencias..." />
              <Field multiline label="Notas internas" value={form.internal_notes} onChange={(value) => updateField("internal_notes", value)} disabled={!canEdit} placeholder="Observaciones de compra, uso, cliente o proveedor..." />
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
}

function ImagePreview({ imageUrl, description }) {
  return (
    <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 md:w-72">
      {imageUrl ? (
        <img src={imageUrl} alt={description || "Artículo de bodega"} className="h-full w-full object-contain" />
      ) : (
        <div className="text-center text-slate-400">
          <ImageIcon size={34} className="mx-auto mb-2" />
          <p className="text-sm font-semibold">Sin imagen</p>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, disabled, multiline = false, type = "text", placeholder = "" }) {
  const className = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-500";

  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder={placeholder} rows={5} className={className} />
      ) : (
        <input type={type} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder={placeholder} className={className} />
      )}
    </label>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} /> {message}</p>
    </div>
  );
}
