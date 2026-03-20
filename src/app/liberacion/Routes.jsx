import { Routes, Route } from "react-router-dom";
import LiberacionForm from "./LiberacionForm";

export default function LiberacionRoutes() {
  return (
    <Routes>
      {/* HOME */}
      <Route
        index
        element={
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">
              Liberación camioneta
            </h1>

            <button
              onClick={() => window.location.href = "/liberacion/nuevo"}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Nueva liberación
            </button>
          </div>
        }
      />

      {/* FORMULARIO */}
      <Route path="nuevo" element={<LiberacionForm />} />
    </Routes>
  );
}
