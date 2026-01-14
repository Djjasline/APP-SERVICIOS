import { Routes, Route, Navigate } from "react-router-dom";

import InformeHome from "./InformeHome";
import NuevoInforme from "./NuevoInforme";
// ⚠️ PDF deshabilitado temporalmente
// import InformePDF from "./InformePDF";

export default function InformeRoutes() {
  return (
    <Routes>
      {/* HOME */}
      <Route index element={<InformeHome />} />

      {/* CREAR / EDITAR INFORME */}
      <Route path="nuevo" element={<NuevoInforme />} />
      <Route path=":id" element={<NuevoInforme />} />

      {/* PDF (SE AGREGA LUEGO) */}
      {/*
      <Route path="pdf/:id" element={<InformePDF />} />
      */}

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/informe" replace />} />
    </Routes>
  );
}
