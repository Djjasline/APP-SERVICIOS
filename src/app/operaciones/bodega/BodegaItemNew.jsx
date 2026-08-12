import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, PackagePlus, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createWarehouseItem, WAREHOUSE_ITEM_SOURCES } from "@/services/warehouseInventoryService";

const AREA_OPTIONS = ["Vehículos", "Agua", "Petróleo", "Industria", "Operaciones"];

const EMPTY_FORM = {
  source: WAREHOUSE_ITEM_SOURCES.stock,
  product_code: "",
  description: "",
  area: "Vehículos",
  physical_stock: "0",
  physical_location: "",
  cutoff_date: "",
  reference_stock: "0",
  last_cost: "",
  last_supplier: "",
  last_client: "",
  sheet_name: "Carga manual",
  source_file: "Carga manual",
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

export default function BodegaItemNew() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isReference = form.source === WAREHOUSE_ITEM_SOURCES.vehicleReference;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isSuperAdmin) return;

    setSaving(true);
    setError("");

    try {
      const created = await createWarehouseItem({ source: form.source, payload: form, userId: user?.id });
      navigate(`/operaciones/bodega/${form.source}/${created.id}`);
    } catch (err) {
      console.error("Error creando artículo de bodega:", err);
      setError(err?.message || "No se pudo crear el artículo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Bodega multiárea</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-900">
            <PackagePlus size={22} className="text-amber-600" /> Nuevo artículo
          </h2>
          <p className="text-sm text-slate-500">Carga manual para stock real o referencia histórica, separada por área.</p>
        </div>
        <button type="button" onClick={() => navigate("/operaciones/bodega")} className="btn-volver-orange">
          Volver
        </button>
      </div>

      {!isSuperAdmin ? (
        <ErrorBox message="Solo el superadministrador puede crear nuevos artículos de bodega." />
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Datos principales</h3>
              <p className="text-sm text-slate-500">Define si el artículo entra al stock físico o solo a la referencia histórica.</p>
            </div>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
              <Save size={16} /> {saving ? "Creando..." : "Crear artículo"}
            </button>
          </div>

          {error && <div className="mt-4"><ErrorBox message={error} /></div>}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Fuente
              <select value={form.source} onChange={(event) => updateField("source", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400">
                <option value={WAREHOUSE_ITEM_SOURCES.stock}>Stock real de bodega</option>
                <option value={WAREHOUSE_ITEM_SOURCES.vehicleReference}>Referencia histórica</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Área / unidad de negocio
              <select value={form.area} onChange={(event) => updateField("area", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400">
                {AREA_OPTIONS.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </label>
            <Field label="Código" value={form.product_code} onChange={(value) => updateField("product_code", value)} required />
            <Field label="Descripción" value={form.description} onChange={(value) => updateField("description", value)} required />

            {isReference ? (
              <>
                <Field label="Saldo referencial" type="number" value={form.reference_stock} onChange={(value) => updateField("reference_stock", value)} />
                <Field label="Último costo" type="number" value={form.last_cost} onChange={(value) => updateField("last_cost", value)} />
                <Field label="Proveedor" value={form.last_supplier} onChange={(value) => updateField("last_supplier", value)} />
                <Field label="Último cliente" value={form.last_client} onChange={(value) => updateField("last_client", value)} />
                <Field label="Origen / hoja" value={form.sheet_name} onChange={(value) => updateField("sheet_name", value)} />
              </>
            ) : (
              <>
                <Field label="Stock físico" type="number" value={form.physical_stock} onChange={(value) => updateField("physical_stock", value)} />
                <Field label="Ubicación física" value={form.physical_location} onChange={(value) => updateField("physical_location", value)} />
                <Field label="Fecha corte" type="date" value={form.cutoff_date} onChange={(value) => updateField("cutoff_date", value)} />
                <Field label="Origen" value={form.source_file} onChange={(value) => updateField("source_file", value)} />
              </>
            )}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5">
            <h3 className="font-semibold text-slate-900">Ficha complementaria</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="URL de imagen de referencia" value={form.image_url} onChange={(value) => updateField("image_url", value)} placeholder="https://..." />
              <Field label="Unidad" value={form.unit} onChange={(value) => updateField("unit", value)} placeholder="unidad, kit, m, galón" />
              <Field label="Peso kg" type="number" value={form.weight_kg} onChange={(value) => updateField("weight_kg", value)} />
              <Field label="Marca" value={form.brand} onChange={(value) => updateField("brand", value)} />
              <Field label="Modelo / parte" value={form.model} onChange={(value) => updateField("model", value)} />
              <Field label="Categoría" value={form.category} onChange={(value) => updateField("category", value)} />
              <Field label="Sistema" value={form.system} onChange={(value) => updateField("system", value)} />
              <Field label="Equipo compatible" value={form.compatible_equipment} onChange={(value) => updateField("compatible_equipment", value)} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field multiline label="Datos técnicos" value={form.technical_specs} onChange={(value) => updateField("technical_specs", value)} />
              <Field multiline label="Notas internas" value={form.internal_notes} onChange={(value) => updateField("internal_notes", value)} />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange, multiline = false, type = "text", placeholder = "", required = false }) {
  const className = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400";

  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={5} className={className} />
      ) : (
        <input type={type} step={type === "number" ? "0.01" : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className={className} />
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
