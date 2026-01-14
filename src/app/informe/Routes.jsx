import { Routes, Route, Navigate } from "react-router-dom";

import InformeHome from "./InformeHome";
import NuevoInforme from "./NuevoInforme";
import InformePDF from "./InformePDF";

export default function InformeRoutes() {
  return (
    <Routes>
      {/* HOME */}
      <Route index element={<InformeHome />} />

      {/* NUEVO INFORME */}
      <Route path="nuevo" element={<NuevoInforme />} />

      {/* PDF */}
      <Route path="pdf/:id" element={<InformePDF />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/informe" replace />} />
    </Routes>
  );
}
