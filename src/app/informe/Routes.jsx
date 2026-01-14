import { Routes, Route, Navigate } from "react-router-dom";

import InformeHome from "./InformeHome";
import NuevoInforme from "./NuevoInforme";

export default function InformeRoutes() {
  return (
    <Routes>
      <Route index element={<InformeHome />} />
      <Route path="nuevo" element={<NuevoInforme />} />
      <Route path=":id" element={<NuevoInforme />} />
      <Route path="*" element={<Navigate to="/informe" replace />} />
    </Routes>
  );
}
