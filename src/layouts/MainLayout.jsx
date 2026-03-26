import { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export default function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="flex min-h-screen">

      {showSidebar && <Sidebar />}

      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-4 left-4 z-50 bg-indigo-600 text-white p-3 rounded-full"
      >
        <Menu size={20} />
      </button>

      <main className="flex-1 bg-gray-100">
        <Outlet />
      </main>

    </div>
  );
}
