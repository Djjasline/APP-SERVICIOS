import { Route, Routes } from "react-router-dom";

import HojaRecepcion from "./HojaRecepcion";
import RecepcionHome from "./RecepcionHome";
import RecepcionPDF from "./RecepcionPDF";

export default function RecepcionRoutes() {
  return (
    <Routes>
      <Route index element={<RecepcionHome />} />
      <Route path="new" element={<HojaRecepcion />} />
      <Route path=":id" element={<HojaRecepcion />} />
      <Route path=":id/pdf" element={<RecepcionPDF />} />
    </Routes>
  );
}
