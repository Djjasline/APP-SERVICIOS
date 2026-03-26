import { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export default function MainLayout() {
  const [open, setOpen] = useState(true); // 👈 importante

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* BOTÓN */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded"
      >
        <Menu size={18} />
      </button>

      {/* CONTENIDO */}
      <main className="flex-1 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
