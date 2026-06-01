import { Routes, Route } from "react-router-dom";
import LiberacionHome from "./LiberacionHome";
import LiberacionForm from "./LiberacionForm";
import LiberacionDetalle from "./LiberacionDetalle";
import LiberacionPDF from "./LiberacionPDF";

export default function LiberacionRoutes() {
  return (
    <Routes>
      <Route index element={<LiberacionHome />} />
      <Route path="nuevo" element={<LiberacionForm />} />
      <Route path="pdf/:id" element={<LiberacionPDF />} />
      <Route path=":id" element={<LiberacionDetalle />} />
    </Routes>
  );
}
