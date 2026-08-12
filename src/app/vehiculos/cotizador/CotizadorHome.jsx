import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calculator, Package, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VEHICULOS_TEXT } from "@/constants/vehiculosText";
import { getVehicleReferenceCatalog, getWarehouseInventory, WAREHOUSE_ITEM_SOURCES } from "@/services/warehouseInventoryService";

const EMPTY_SERVICE = {
  description: "",
  quantity: "1",
  unitPrice: "0",
};

function formatNumber(value) {
  return new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function money(value) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value) || 0);
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
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => lines.reduce((sum, line) => sum + lineTotal(line), 0), [lines]);
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

  return (
    <div className="p-6 space-y-6">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Cotización en preparación</h3>
            <p className="text-sm text-slate-500">MVP operativo: guarda el armado en pantalla; persistencia y PDF quedan para la siguiente iteración.</p>
          </div>
          <div className="rounded-xl bg-slate-900 px-4 py-3 text-right text-white">
            <p className="text-xs text-slate-300">Total referencial</p>
            <p className="text-xl font-bold">{money(total)}</p>
          </div>
        </div>

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
