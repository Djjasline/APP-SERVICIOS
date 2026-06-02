// ──────────────────────────────────────────────────────
//  InformeAguaRoutes.jsx
//  Rutas del módulo Agua → Informes EPMAPS
// ──────────────────────────────────────────────────────
import { Route, Routes } from "react-router-dom";
import InformeAgua from "./InformeAgua";
import InformeAguaHome from "./InformeAguaHome";

export default function InformeAguaRoutes() {
  return (
    <Routes>
      <Route index element={<InformeAguaHome />} />
      <Route path="new" element={<InformeAgua />} />
      <Route path=":id" element={<InformeAgua />} />
    </Routes>
  );
}
