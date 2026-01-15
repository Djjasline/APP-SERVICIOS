import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getInspectionById,
  saveInspectionDraft,
} from "@/utils/inspectionStorage";

export default function HojaFirma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasTec = useRef(null);
  const canvasCli = useRef(null);
  const [drawing, setDrawing] = useState(false);

  /* ===============================
     CANVAS HELPERS
  =============================== */
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const start = (e, canvas) => {
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setDrawing(true);
  };

  const draw = (e, canvas) => {
    if (!drawing) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => setDrawing(false);

  const clear = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  /* ===============================
     GUARDAR FIRMAS
  =============================== */
  const guardarFirmas = () => {
    const inspection = getInspectionById(id);
    if (!inspection) return;

    const dataActualizada = {
      ...inspection.data,
      firmas: {
        tecnico: canvasTec.current?.toDataURL() || "",
        cliente: canvasCli.current?.toDataURL() || "",
      },
    };

    // Guardamos como BORRADOR (no cambia estado)
    saveInspectionDraft("hidro", inspection.id, dataActualizada);

    navigate("/inspeccion");
  };

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white p-6 rounded-xl space-y-6">
      <h2 className="text-lg font-semibold text-center">
        Firmas del servicio
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* FIRMA TÉCNICO */}
        <div>
          <p className="text-xs font-semibold text-center mb-1">
            FIRMA TÉCNICO
          </p>
          <canvas
            ref={canvasTec}
            width={400}
            height={150}
            className="border w-full bg-white touch-none"
            onPointerDown={(e) => start(e, canvasTec.current)}
            onPointerMove={(e) => draw(e, canvasTec.current)}
            onPointerUp={end}
            onPointerLeave={end}
          />
          <button
            onClick={() => clear(canvasTec.current)}
            className="text-xs text-red-600 mt-1"
          >
            Limpiar
          </button>
        </div>

        {/* FIRMA CLIENTE */}
        <div>
          <p className="text-xs font-semibold text-center mb-1">
            FIRMA CLIENTE
          </p>
          <canvas
            ref={canvasCli}
            width={400}
            height={150}
            className="border w-full bg-white touch-none"
            onPointerDown={(e) => start(e, canvasCli.current)}
            onPointerMove={(e) => draw(e, canvasCli.current)}
            onPointerUp={end}
            onPointerLeave={end}
          />
          <button
            onClick={() => clear(canvasCli.current)}
            className="text-xs text-red-600 mt-1"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          onClick={guardarFirmas}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar firmas
        </button>
      </div>
    </div>
  );
}
