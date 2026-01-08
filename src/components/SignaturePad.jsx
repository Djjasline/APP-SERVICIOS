import React, { useRef, useEffect, useState } from "react";

export default function SignaturePad({
  label,
  value,
  onChange,
  required = false,
}) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);

  const [hasDrawn, setHasDrawn] = useState(!!value);

  /* =============================
     Inicializar canvas
  ============================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Ajuste de resolución para tablets
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";

    ctxRef.current = ctx;

    // Si hay firma guardada, dibujarla
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = value;
    }
  }, []);

  /* =============================
     Eventos de dibujo
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
    e.preventDefault();
    drawing.current = true;
    const { x, y } = getPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    ctxRef.current.closePath();
    setHasDrawn(true);

    const dataURL = canvasRef.current.toDataURL("image/png");
    onChange(dataURL);
  };

  /* =============================
     Limpiar firma
  ============================= */
  const clear = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-xs">
          {label} {required && <span className="text-red-600">*</span>}
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-red-600 hover:underline"
        >
          Limpiar
        </button>
      </div>

      <div className="border rounded-md bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-32 touch-none"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>

      {!hasDrawn && required && (
        <p className="text-xs text-red-600">
          La firma del cliente es obligatoria
        </p>
      )}
    </div>
  );
}
