import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { markInspectionCompleted } from "../utils/inspectionStorage";
import { useNavigate } from "react-router-dom";

export default function HojaInspeccionCamara() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (id) {
      const stored = getInspectionById("camara", id);
      if (stored) setData(stored);
    }
  }, [id]);

  const handleSave = () => {
    const inspection = {
      id: id || Date.now().toString(),
      type: "hidro",
      status: "borrador",
      cliente: data?.cliente || "",
      updatedAt: new Date().toISOString(),
      ...data,
    };

    saveInspection("camara", inspection);
    alert("Inspección guardada");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white border rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">
          Hoja de Inspección – Camara
        </h1>

        <input
          className="border px-3 py-2 w-full"
          placeholder="Cliente"
          value={data?.cliente || ""}
          onChange={(e) =>
            setData({ ...data, cliente: e.target.value })
          }
        />

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-slate-900 text-white rounded"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
