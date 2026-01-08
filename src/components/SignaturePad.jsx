import { useRef, useState, useEffect } from "react";

export default function SignaturePad({
  label,
  value,
  onChange,
  required = false,
  height = 140,
}) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(!!value);

  /* =============================
     CONFIGURACIÓN CANVAS
  ============================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajuste para alta resolución (tablet)
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = height * ratio;
    canvas.style.height = `${height}px`;

    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    // Si existe firma previa, la cargamos
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width / ratio, height);
      img.src = value;
    }
  }, []);

  /* =============================
     HANDLERS DE DIBUJO
  ============================= */
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    return {
      x: (touch ? touch.clientX : e.clientX) - rect.left,
      y: (touch ? touch.clientY : e.clientY) - rect.top,
    };
  };

  const startDraw = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onChange(dataUrl);
    setHasDrawn(true);
  };

  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onChange(null);
    setHasDrawn(false);
  };

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="border rounded p-2 space-y-1">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span>
          {label} {required && <span className="text-red-600">*</span>}
        </span>
        {hasDrawn && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-red-600 hover:underline"
          >
            Limpiar
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        className="w-full border rounded bg-white touch-none"
        style={{ height }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
    </div>
  );
}
