import { Routes, Route } from "react-router-dom";

import IndexRegistroHerramientas from "./IndexRegistroHerramientas";
import HojaRegistroHerramientas from "./HojaRegistroHerramientas";

export default function RegistroRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexRegistroHerramientas />} />
      <Route path=":id" element={<HojaRegistroHerramientas />} />
    </Routes>
  );
}
