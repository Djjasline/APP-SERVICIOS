import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionHistory, markInspectionCompleted } from "@utils/inspectionStorage";

export default function FirmaInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const guardarFirma = () => {
    const firma = canvasRef.current.toDataURL("image/png");

    const history = getInspectionHistory();

    history.hidro = history.hidro.map((i) =>
      i.id === id ? { ...i, firmaCliente: firma } : i
    );

    localStorage.setItem("inspectionHistory", JSON.stringify(history));
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
        className="border w-full rounded touch-none"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
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
