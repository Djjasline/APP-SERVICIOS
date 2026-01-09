import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInspectionHistory, saveInspectionHistory } from "@utils/inspectionStorage";

export default function HojaFirma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasTec = useRef(null);
  const canvasCli = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const start = (e, canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };

  const draw = (e, canvas) => {
    if (!drawing) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const end = () => setDrawing(false);

  const clear = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const guardarFirmas = () => {
    const history = getInspectionHistory();
    const item = history.hidro.find((i) => i.id === id);
    if (!item) return;

    item.firmaTecnico = canvasTec.current.toDataURL();
    item.firmaCliente = canvasCli.current.toDataURL();

    saveInspectionHistory(history);
    navigate("/inspeccion");
  };

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white p-6 rounded-xl space-y-6">
      <h2 className="text-lg font-semibold text-center">Firmas</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* FIRMA TÉCNICO */}
        <div>
          <p className="text-xs text-center font-semibold mb-1">FIRMA TÉCNICO</p>
          <canvas
            ref={canvasTec}
            width={400}
            height={150}
            className="border w-full touch-none"
            onMouseDown={(e) => start(e, canvasTec.current)}
            onMouseMove={(e) => draw(e, canvasTec.current)}
            onMouseUp={end}
            onMouseLeave={end}
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
          <p className="text-xs text-center font-semibold mb-1">FIRMA CLIENTE</p>
          <canvas
            ref={canvasCli}
            width={400}
            height={150}
            className="border w-full touch-none"
            onMouseDown={(e) => start(e, canvasCli.current)}
            onMouseMove={(e) => draw(e, canvasCli.current)}
            onMouseUp={end}
            onMouseLeave={end}
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
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar firmas
        </button>
      </div>
    </div>
  );
}
