import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionHistory } from "@utils/inspectionStorage";

export default function FirmaInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const getPosition = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];

    return {
      x: (touch ? touch.clientX : e.clientX) - rect.left,
      y: (touch ? touch.clientY : e.clientY) - rect.top,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPosition(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const ctx = canvasRef.current.getContext("2d");
    const pos = getPosition(e);

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const saveSignature = () => {
    if (!hasDrawn) {
      alert("⚠️ El cliente debe firmar antes de continuar");
      return;
    }

    const signature = canvasRef.current.toDataURL("image/png");
    const history = getInspectionHistory();

    history.hidro = history.hidro.map((item) =>
      item.id === id ? { ...item, firmaCliente: signature } : item
    );

    localStorage.setItem("inspectionHistory", JSON.stringify(history));

    alert("✅ Firma guardada correctamente");
    navigate("/inspeccion");
  };

  return (
    <div className="max-w-xl mx-auto my-10 bg-white shadow rounded-xl p-6 space-y-4">
      <h1 className="text-center font-semibold text-lg">
        Firma del Cliente
      </h1>

      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        className="border rounded w-full bg-white"
        style={{ touchAction: "none", userSelect: "none" }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      {!hasDrawn && (
        <p className="text-center text-xs text-red-600">
          ⚠️ Firma obligatoria
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={clearCanvas}
          className="border px-4 py-2 rounded"
        >
          Limpiar
        </button>

        <button
          onClick={saveSignature}
          className={`px-4 py-2 rounded text-white ${
            hasDrawn ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Guardar firma
        </button>
      </div>
    </div>
  );
}
