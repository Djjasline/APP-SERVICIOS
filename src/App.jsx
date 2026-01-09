import { Routes, Route } from "react-router-dom";
import InspectionRoutes from "./app/inspeccion/Routes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/inspeccion/*" element={<InspectionRoutes />} />
      {/* otras rutas si existen */}
    </Routes>
  );
}
