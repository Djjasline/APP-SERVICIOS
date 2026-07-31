import { OPERACIONES_TEXT } from "@/constants/operacionesText";
import { useTheme } from "@/context/ThemeContext";
import { ClipboardList, Package, ShieldCheck, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

const acciones = [
  {
    title: "Inventario",
    description: "Base para registrar materiales, repuestos, herramientas y consumibles.",
    icon: <Warehouse size={20} />,
  },
  {
    title: "Movimientos",
    description: "Base para controlar ingresos, salidas, devoluciones y ajustes de bodega.",
    icon: <ClipboardList size={20} />,
  },
  {
    title: "Acceso restringido",
    description: "Módulo visible únicamente para superadministrador mientras se define el flujo operativo.",
    icon: <ShieldCheck size={20} />,
  },
];

export default function BodegaHome() {
  const { isLight } = useTheme();
  const navigate = useNavigate();

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
          El acceso quedó creado dentro de Operaciones y protegido para superadministrador. Desde aquí se puede desarrollar el flujo completo de inventario cuando se definan campos, permisos y reportes.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {acciones.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              {item.icon}
            </div>
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
