import { Routes, Route, Navigate } from "react-router-dom";

import NuevoInforme from "./NuevoInforme";

export default function InformeRoutes() {
  return (
    <Routes>
      {/* HOME (temporalmente es NuevoInforme) */}
      <Route index element={<NuevoInforme />} />

      {/* CREAR / EDITAR INFORME */}
      <Route path="nuevo" element={<NuevoInforme />} />
      <Route path=":id" element={<NuevoInforme />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/informe" replace />} />
    </Routes>
  );
}
