import { Routes, Route } from "react-router-dom";
import RegistroHome from "./RegistroHome";
import HojaRegistroHerramientas from "./HojaRegistroHerramientas";
import RegistroPDF from "./RegistroPDF";

export default function RegistroRoutes() {
  return (
    <Routes>
      <Route index element={<RegistroHome />} />
      <Route path="pdf/:id" element={<RegistroPDF />} />
      <Route path=":id" element={<HojaRegistroHerramientas />} />
    </Routes>
  );
}
