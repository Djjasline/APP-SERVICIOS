import { Routes, Route } from "react-router-dom";
import IndexInforme from "./IndexInforme";
import NuevoInforme from "./NuevoInforme";

export default function InformeRoutes() {
  return (
    <Routes>
      <Route index element={<IndexInforme />} />
      <Route path="nuevo" element={<NuevoInforme />} />
    </Routes>
  );
}
