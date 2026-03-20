import { Routes, Route } from "react-router-dom";
import LiberacionHome from "./LiberacionHome";
import LiberacionForm from "./LiberacionForm";

export default function LiberacionRoutes() {
  return (
    <Routes>
      <Route index element={<LiberacionHome />} />
      <Route path="nuevo" element={<LiberacionForm />} />
    </Routes>
  );
}
