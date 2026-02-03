import { Routes, Route, Navigate } from "react-router-dom";

import InformeHome from "./InformeHome";
import NuevoInforme from "./NuevoInforme";
import InformePDF from "./InformePDF";

export default function InformeRoutes() {
  return (
    <Routes>
      {/* LISTADO */}
      <Route index element={<InformeHome />} />

      {/* NUEVO */}
      <Route path="nuevo" element={<NuevoInforme />} />

      {/* PDF (SIEMPRE ANTES DE :id) */}
      <Route path=":id/pdf" element={<InformePDF />} />

      {/* ABRIR / EDITAR */}
      <Route path=":id" element={<NuevoInforme />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/informe" replace />} />
    </Routes>
  );
}
