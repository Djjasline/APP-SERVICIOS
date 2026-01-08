import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignaturePad from "@/components/SignaturePad";
import { getInspectionHistory, saveInspectionHistory } from "@utils/inspectionStorage";

export default function HojaFirma() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [firmaCliente, setFirmaCliente] = useState(null);

  const guardarFirma = () => {
    if (!firmaCliente) {
      alert("El cliente debe firmar para finalizar el servicio.");
      return;
    }

    const history = getInspectionHistory();
    const idx = history.hidro.findIndex((i) => i.id === id);

    if (idx === -1) {
      alert("Inspección no encontrada.");
      return;
    }

    history.hidro[idx] = {
      ...history.hidro[idx],
      firmaCliente,
      estado: "completada",
      fechaCompletada: new Date().toISOString(),
    };

    saveInspectionHistory(history);
    navigate("/inspeccion");
  };

  return (
    <div className="max-w-xl mx-auto my-8 bg-white shadow rounded-xl p-6 space-y-6">
      <h1 className="text-lg font-semibold text-center">
        Firma del Cliente
      </h1>

      <SignaturePad
        label="Firma de conformidad"
        required
        value={firmaCliente}
        onChange={setFirmaCliente}
      />

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          onClick={guardarFirma}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Finalizar servicio
        </button>
      </div>
    </div>
  );
}
