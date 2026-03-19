import { Routes, Route } from "react-router-dom";

export default function LiberacionRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <div className="p-6">
            <h1 className="text-2xl font-bold">
              Liberación camioneta
            </h1>
            <p className="text-slate-600 mt-2">
              Módulo en construcción 🚧
            </p>
          </div>
        }
      />
    </Routes>
  );
}
