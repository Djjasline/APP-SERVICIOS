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

  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  const menu = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
    { name: "Informes", icon: <FileText size={20} />, path: "/informe" },
    { name: "Inspección", icon: <ClipboardCheck size={20} />, path: "/inspeccion" },
    { name: "Mantenimiento", icon: <Wrench size={20} />, path: "/mantenimiento" },
    { name: "Herramientas", icon: <Package size={20} />, path: "/registro-salida" },
    { name: "Recepción", icon: <Truck size={20} />, path: "/recepcion" },
    { name: "Liberación", icon: <CheckCircle size={20} />, path: "/liberacion" },
  ];

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">

        {/* SIDEBAR */}
        <aside
          className={`
          fixed lg:static top-0 left-0 h-full w-64 p-5 space-y-4 z-50
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          bg-white dark:bg-slate-900 text-slate-900 dark:text-white
        `}
        >
          <h1 className="text-xl font-bold mb-2">ASTAP</h1>

          {/* DARK MODE */}
          <button
            onClick={() => setDark(!dark)}
            className="mb-4 w-full bg-slate-200 dark:bg-slate-700 py-2 rounded-lg text-sm"
          >
            {dark ? "Modo claro ☀️" : "Modo oscuro 🌙"}
          </button>

          {menu.map((item, i) => {
            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");

            return (
              <button
                key={i}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 px-5 py-4 text-base rounded-xl w-full transition
                ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-[1.02]"
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </aside>

        {/* OVERLAY */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}

        {/* CONTENT */}
        <main className="flex-1 p-6">

          {/* BOTÓN MENU */}
          <div className="mb-4 lg:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="p-3 bg-slate-800 text-white rounded-lg shadow-lg"
            >
              <Menu size={22} />
            </button>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
