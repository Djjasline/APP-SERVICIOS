// ──────────────────────────────────────────────────────
//  InformeAguaRoutes.jsx
//  Rutas del módulo Agua → Informes EPMAPS
// ──────────────────────────────────────────────────────
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import InformeAgua from "./InformeAgua";
import InformeAguaHome from "./InformeAguaHome";
import RecordPermissionRoute from "@/components/RecordPermissionRoute";

const InformeAguaPDF = lazy(() => import("./InformeAguaPDF"));

export default function InformeAguaRoutes() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-500">Cargando...</div>}>
    <Routes>
      <Route index element={<InformeAguaHome />} />
      <Route path="new" element={<InformeAgua />} />
      <Route path="ver/:id" element={<RecordPermissionRoute action="view" fallback="/agua/recorrido/informe"><InformeAguaPDF allowDownload={false} /></RecordPermissionRoute>} />
      <Route path=":id" element={<RecordPermissionRoute action="edit" fallback="/agua/recorrido/informe"><InformeAgua /></RecordPermissionRoute>} />
      <Route path="pdf/:id" element={<RecordPermissionRoute action="download" fallback="/agua/recorrido/informe"><InformeAguaPDF /></RecordPermissionRoute>} />
    </Routes>
    </Suspense>
  );
}
