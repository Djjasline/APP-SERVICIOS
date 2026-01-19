import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInspections,
  createInspection,
} from "@/utils/inspectionStorage";

export default function IndexInspeccion() {
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState("todas");
  const [inspections, setInspections] = useState([]);

  /* =============================
     CARGA HISTORIAL
  ============================= */
  useEffect(() => {
    setInspections(getInspections("hidro"));
  }, []);

  /* =============================
     NUEVA INSPECCIÓN
  ============================= */
  const handleNueva = () => {
    const id = Date.now().toString();
    createInspection("hidro", id);
    navigate(`/inspeccion/hidro/${id}`);
  };

  /* =============================
     FILTRO
  ============================= */
  const filtradas = inspections.filter((i) => {
    if (filtro === "todas") return true;
    return i.estado === filtro;
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">

      {/* ================= BOTÓN VOLVER ================= */}
      <button
        onClick={() => navigate("/inspeccion")}
        className="text-sm border px-3 py-1 rounded hover:bg-gray-100"
      >
        ← Volver
     but would loop; actually this page is /inspeccion/hidro index? Wait menu shows only hidro card; but there are other cards earlier page likely /inspeccion. Actually IndexInspeccion.jsx is the menu with cards; going back should go to previous page showing multiple cards maybe /inspeccion/home. Hm.

User says button returns to main initial and not show other inspection options. That implies IndexInspeccion.jsx is nested route like /inspeccion/hidro; parent menu is /inspeccion. So back should navigate(-1) or to "/inspeccion". But currently this file already is /inspeccion? The screenshot shows only hidro card, but earlier there were 3 cards. Maybe this IndexInspeccion.jsx was changed to only hidro. To show others need different component. However question is button returns wrong. Simpler: use navigate(-1). That will go back to previous route which showed all options.

So set onClick={() => navigate(-1)}.

Need correct code; but my partial got cut. I'll redo full file with navigate(-1).

