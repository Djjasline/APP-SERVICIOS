import { Routes, Route } from "react-router-dom";
import InformeHome from "./InformeHome";
import NuevoInforme from "./NuevoInforme";
import InformePDF from "./InformePDF";

export default function InformeRoutes() {
  return (
    <Routes>
      <Route index element={<InformeHome />} />
      <Route path="nuevo" element={<NuevoInforme />} />
      <Route path="pdf/:id" element={<InformePDF />} />
    </Routes>
  );
}
