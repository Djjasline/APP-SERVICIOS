import { Routes, Route, Navigate } from "react-router-dom";
import InspectionList from "./components/InspectionList";
import HojaInspeccionHidro from "./components/HojaInspeccionHidro";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="py-6">
        <Routes>
          <Route path="/" element={<InspectionList />} />
          <Route path="/hoja/:id" element={<HojaInspeccionHidro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
