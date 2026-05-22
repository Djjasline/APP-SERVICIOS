import { Routes, Route } from "react-router-dom";

import RecepcionHome from "./RecepcionHome";
import HojaRecepcion from "./HojaRecepcion";
import HojaRecepcionPDF from "./HojaRecepcionPDF";

export default function RecepcionRoutes() {
  return (
    <Routes>

      {/* HOME */}
      <Route index element={<RecepcionHome />} />

      {/* FORMULARIO */}
      <Route path="new" element={<HojaRecepcion />} />
      <Route path=":id" element={<HojaRecepcion />} />

      {/* PDF */}
      <Route path=":id/pdf" element={<HojaRecepcionPDF />} />

    </Routes>
  );
}
