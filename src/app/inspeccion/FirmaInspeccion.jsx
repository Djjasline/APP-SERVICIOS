import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionHistory, saveInspectionHistory } from "@utils/inspectionStorage";

export default function FirmaInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const startDraw = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const endDraw = () => setDrawing(false);

  const guardarFirma = () => {
    const firmaBase64 = canvasRef.current.toDataURL("image/png");

    const history = getInspectionHistory();
    history.hidro = history.hidro.map((i) =>
      i.id === id ? { ...i, firmaCliente: firmaBase64 } : i
    );

    saveInspectionHistory(history);
    navigate("/inspeccion");
  };

  return (
    <div className="max-w-xl mx-auto my-10 bg-white shadow rounded-xl p-6 space-y-4">
      <h1 className="text-lg font-semibold text-center">
        Firma del Cliente
      </h1>

      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="border w-full touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={(e) => startDraw(e.touches[0])}
        onTouchMove={(e) => draw(e.touches[0])}
        onTouchEnd={endDraw}
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate("/inspeccion")}
          className="border px-4 py-2 rounded"
        >
          Cancelar
        </button>
        <button
          onClick={guardarFirma}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar firma
        </button>
      </div>
    </div>
  );
}
