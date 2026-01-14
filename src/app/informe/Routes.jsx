import { Routes, Route } from "react-router-dom";
import IndexInforme from "./IndexInforme";
import NuevoInforme from "./NuevoInforme";
import InformePDF from "./InformePDF";

export default function InformeRoutes() {
  return (
    <Routes>
      <Route index element={<IndexInforme />} />
      <Route path="nuevo" element={<NuevoInforme />} />
      <Route path="pdf" element={<InformePDF />} />
    </Routes>
  );
}
