import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Wrench,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
    {
      name: "Informes",
      icon: <FileText size={20} />,
      path: "/informe",
    },
    {
      name: "Inspección",
      icon: <ClipboardCheck size={20} />,
      path: "/inspeccion",
    },
    {
      name: "Mantenimiento",
      icon: <Wrench size={20} />,
      path: "/mantenimiento",
    },
    {
      name: "Herramientas",
      icon: <Package size={20} />,
      path: "/registro-salida",
    },
    {
      name: "Recepción",
      icon: <Truck size={20} />,
      path: "/recepcion",
    },
    {
      name: "Liberación",
      icon: <CheckCircle size={20} />,
      path: "/liberacion",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-5 space-y-4">
        <h1 className="text-xl font-bold mb-6">ASTAP</h1>

        {menu.map((item, i) => {
          const active = location.pathname.startsWith(item.path);

          return (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition
              ${
                active
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          );
        })}
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
