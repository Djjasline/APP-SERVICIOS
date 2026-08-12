import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { OPERACIONES_TEXT } from "@/constants/operacionesText";
import { useTheme } from "@/context/ThemeContext";
import { getVehicleReferenceCatalog, getWarehouseInventory, getWarehouseLocations } from "@/services/warehouseInventoryService";
import { AlertTriangle, Database, Package, RefreshCw, Search, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SOURCE_STOCK = "stock";
const SOURCE_VEHICLE_REFERENCE = "vehicle-reference";

function formatNumber(value) {
  return new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(year, month - 1, day));
  }
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value));
}

export default function BodegaHome() {
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [referenceItems, setReferenceItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [source, setSource] = useState(SOURCE_STOCK);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const viewingReference = source === SOURCE_VEHICLE_REFERENCE;

  const loadInventory = async () => {
    setLoading(true);
    setError("");

    try {
      if (viewingReference) {
        const rows = await getVehicleReferenceCatalog({ search: deferredSearch });
        setReferenceItems(rows);
      } else {
        const [inventoryRows, locationRows] = await Promise.all([
          getWarehouseInventory({ search: deferredSearch, location }),
          getWarehouseLocations(),
        ]);

        setItems(inventoryRows);
        setLocations(locationRows);
      }
    } catch (err) {
      console.error("Error cargando inventario de bodega:", err);
      setError(err?.code === "42P01" ? "La tabla requerida aún no existe en Supabase." : "No se pudo cargar la información de bodega.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [deferredSearch, location, source]);

  const summary = useMemo(() => {
    const stock = items.reduce((total, item) => total + (Number(item.physical_stock) || 0), 0);
    const uniqueCodes = new Set(items.map((item) => item.product_code).filter(Boolean)).size;
    const referenceStock = referenceItems.reduce((total, item) => total + (Number(item.reference_stock) || 0), 0);

    return {
      rows: items.length,
      uniqueCodes,
      stock,
      locations: locations.length,
      referenceRows: referenceItems.length,
      referenceStock,
    };
  }, [items, referenceItems, locations.length]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`flex items-center gap-2 text-lg font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>
            <Package size={22} className="text-amber-600" /> {OPERACIONES_TEXT.bodega.title}
          </h2>
          <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-300"}`}>
            {OPERACIONES_TEXT.bodega.description}
          </p>
        </div>
        <button type="button" onClick={() => navigate("/operaciones")} className="btn-volver-orange">
          Volver
        </button>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
        <h3 className="font-semibold">Área privada de bodega</h3>
        <p className="mt-2 text-sm leading-6">
          Acceso reservado para superadministrador y usuarios autorizados. El stock actual sigue separado de la referencia histórica de Vehículos Especiales, que no afecta inventario físico.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Registros" value={formatNumber(summary.rows)} icon={<Database size={18} />} />
        <StatCard title="Códigos únicos" value={formatNumber(summary.uniqueCodes)} icon={<Package size={18} />} />
        <StatCard title="Stock total" value={formatNumber(summary.stock)} icon={<Warehouse size={18} />} />
        <StatCard title="Ref. vehículos" value={formatNumber(summary.referenceRows)} icon={<Package size={18} />} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Inventario y referencia</h3>
            <p className="text-sm text-slate-500">
              {viewingReference
                ? "Consulta histórica de repuestos de Vehículos Especiales para futuras compras o cotizaciones."
                : "Consulta de artículos importados desde la base de bodega actual."}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={viewingReference ? "Buscar código, descripción, proveedor o cliente" : "Buscar código, descripción o ubicación"}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-400 sm:w-80"
              />
            </label>

            <select value={location} onChange={(event) => setLocation(event.target.value)} disabled={viewingReference} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 disabled:bg-slate-100 disabled:text-slate-400">
              <option value="">Todas las ubicaciones</option>
              {locations.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <button type="button" onClick={loadInventory} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3 text-sm">
          <SourceButton active={source === SOURCE_STOCK} onClick={() => setSource(SOURCE_STOCK)}>
            Stock actual
          </SourceButton>
          <SourceButton active={source === SOURCE_VEHICLE_REFERENCE} onClick={() => setSource(SOURCE_VEHICLE_REFERENCE)}>
            Referencia histórica vehículos
          </SourceButton>
        </div>

        {viewingReference && (
          <div className="m-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Esta lista es solo referencial histórica de Vehículos Especiales. No descuenta, suma ni reemplaza stock real de bodega.
          </div>
        )}

        {error && (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} /> {error}</p>
            <p className="mt-2">
              {viewingReference
                ? "Ejecuta primero `supabase/sql/vehicle_reference_catalog.sql` en Supabase y luego importa el inventario referencial."
                : "Ejecuta primero `supabase/sql/warehouse_inventory.sql` en Supabase y luego importa el Excel como CSV."}
            </p>
          </div>
        )}

        <div className="overflow-x-auto p-4">
          {loading && (viewingReference ? referenceItems.length === 0 : items.length === 0) ? (
            <p className="text-sm text-slate-500">Cargando información...</p>
          ) : viewingReference ? (
            referenceItems.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no hay referencia histórica de vehículos importada.</p>
            ) : (
              <VehicleReferenceTable items={referenceItems} />
            )
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no hay inventario actual importado.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-3 py-2 font-semibold">Código</th>
                  <th className="px-3 py-2 font-semibold">Descripción</th>
                  <th className="px-3 py-2 text-right font-semibold">Stock físico</th>
                  <th className="px-3 py-2 font-semibold">Ubicación</th>
                  <th className="px-3 py-2 font-semibold">Fecha corte</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200 odd:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-slate-900">{item.product_code}</td>
                    <td className="px-3 py-2 text-slate-700">{item.description}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatNumber(item.physical_stock)}</td>
                    <td className="px-3 py-2 text-slate-700">{item.physical_location || "-"}</td>
                    <td className="px-3 py-2 text-slate-600">{formatDate(item.cutoff_date)}</td>
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

function SourceButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-semibold ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(value) || 0);
}

function VehicleReferenceTable({ items }) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-blue-950 text-white">
        <tr>
          <th className="px-3 py-2 font-semibold">Código</th>
          <th className="px-3 py-2 font-semibold">Descripción</th>
          <th className="px-3 py-2 text-right font-semibold">Saldo ref.</th>
          <th className="px-3 py-2 text-right font-semibold">Último costo</th>
          <th className="px-3 py-2 font-semibold">Proveedor</th>
          <th className="px-3 py-2 font-semibold">Último cliente</th>
          <th className="px-3 py-2 font-semibold">Origen</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-slate-200 odd:bg-blue-50/40">
            <td className="px-3 py-2 font-semibold text-slate-900">{item.product_code}</td>
            <td className="px-3 py-2 text-slate-700">{item.description}</td>
            <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatNumber(item.reference_stock)}</td>
            <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatMoney(item.last_cost)}</td>
            <td className="px-3 py-2 text-slate-700">{item.last_supplier || "-"}</td>
            <td className="px-3 py-2 text-slate-700">{item.last_client || "-"}</td>
            <td className="px-3 py-2 text-slate-600">{item.sheet_name || item.source_file || "Histórico vehículos"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
