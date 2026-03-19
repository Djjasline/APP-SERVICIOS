import { useState } from "react";
import { Menu } from "lucide-react";
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

  const [open, setOpen] = useState(false); // 🔥 control sidebar

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

      {/* 🔥 SIDEBAR */}
      <aside
        className={`
        fixed lg:static top-0 left-0 h-full w-64 bg-slate-900 text-white p-5 space-y-4 z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <h1 className="text-xl font-bold mb-6">ASTAP</h1>

        {menu.map((item, i) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");

          return (
            <button
              key={i}
              onClick={() => {
                navigate(item.path);
                setOpen(false); // 🔥 cierra en móvil
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition w-full
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

      {/* 🔥 OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* 🔥 CONTENT */}
      <main className="flex-1 p-6">

        {/* 🔥 BOTÓN MENU (solo móvil/tablet) */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 bg-slate-800 text-white rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
