// ──────────────────────────────────────────────────────
//  InformeAguaRoutes.jsx
//  Rutas del módulo Agua → Informes EPMAPS
// ──────────────────────────────────────────────────────
import { Route, Routes } from "react-router-dom";
import InformeAgua from "./InformeAgua";
import InformeAguaHome from "./InformeAguaHome";
import InformeAguaPDF from "./InformeAguaPDF";
import RecordPermissionRoute from "@/components/RecordPermissionRoute";

export default function InformeAguaRoutes() {
  return (
    <Routes>
      <Route index element={<InformeAguaHome />} />
      <Route path="new" element={<InformeAgua />} />
      <Route path="ver/:id" element={<RecordPermissionRoute action="view" fallback="/agua/recorrido/informe"><InformeAguaPDF allowDownload={false} /></RecordPermissionRoute>} />
      <Route path=":id" element={<RecordPermissionRoute action="edit" fallback="/agua/recorrido/informe"><InformeAgua /></RecordPermissionRoute>} />
      <Route path="pdf/:id" element={<RecordPermissionRoute action="download" fallback="/agua/recorrido/informe"><InformeAguaPDF /></RecordPermissionRoute>} />
    </Routes>
  );
}
