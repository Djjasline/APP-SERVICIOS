// src/app/inspeccion/Rutas.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import IndexInspeccion from "./paginas/IndexInspeccion";
import Hidro from "./paginas/hidro";
import Barredora from "./paginas/barredora";
import Camara from "./paginas/camara";

export default function InspeccionRoutes() {
  return (
    <Routes>
      <Route index element={<IndexInspeccion />} />
      <Route path="hidro" element={<Hidro />} />
      <Route path="barredora" element={<Barredora />} />
      <Route path="camara" element={<Camara />} />
    </Routes>
  );
}
