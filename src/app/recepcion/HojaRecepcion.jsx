import React, { useState, useRef, useEffect } from "react";

export default function HojaRecepcion() {

  // ==============================
  // STATE BASE
  // ==============================
  const [data, setData] = useState({
    conductor: "",
    fecha: "",
    lugarDestino: "",
    ciudad: "",

    vehiculo: "",
    modelo: "",
    placa: "",
    combustible: "",

    checklist: {
      interior: { gata: false, llaveCruz: false, luces: false },
      motor: { aceite: false, refrigerante: false },
      exterior: { retrovisores: false, llantaEmergencia: false }
    },

    danos: {
      imagen: null,
      puntos: []
    },

    observaciones: ""
  });

  const [tipoDano, setTipoDano] = useState("golpe");

  const colores = {
    golpe: "red",
    rayon: "yellow",
    abolladura: "orange"
  };

  // ==============================
  // CAPTURA IMAGEN
  // ==============================
  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setData(prev => ({
        ...prev,
        danos: { ...prev.danos, imagen: reader.result }
      }));
    };
    reader.readAsDataURL(file);
  };

  // ==============================
  // CANVAS
  // ==============================
  const canvasRef = useRef();
  const imgRef = useRef(new Image());

  useEffect(() => {
    if (!data.danos.imagen) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    imgRef.current.src = data.danos.imagen;

    imgRef.current.onload = () => {
      canvas.width = imgRef.current.width;
      canvas.height = imgRef.current.height;
      draw();
    };
  }, [data.danos.imagen, data.danos.puntos]);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0);

    data.danos.puntos.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = colores[p.tipo];
      ctx.fill();
    });
  };

  // ==============================
  // CLICK CANVAS (AGREGAR / ELIMINAR)
  // ==============================
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    // detectar si toca un punto existente
    const puntoExistente = data.danos.puntos.findIndex(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 10;
    });

    let nuevosPuntos;

    if (puntoExistente !== -1) {
      // eliminar punto
      nuevosPuntos = data.danos.puntos.filter((_, i) => i !== puntoExistente);
    } else {
      // agregar punto
      nuevosPuntos = [
        ...data.danos.puntos,
        { x, y, tipo: tipoDano }
      ];
    }

    setData(prev => ({
      ...prev,
      danos: {
        ...prev.danos,
        puntos: nuevosPuntos
      }
    }));
  };

  // ==============================
  // CHECKLIST HANDLER
  // ==============================
  const toggleCheck = (grupo, item) => {
    setData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [grupo]: {
          ...prev.checklist[grupo],
          [item]: !prev.checklist[grupo][item]
        }
      }
    }));
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div className="p-4 space-y-6">

      <h1 className="text-2xl font-bold">HOJA DE RECEPCIÓN</h1>

      {/* ================= DATOS GENERALES ================= */}
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Conductor"
          onChange={e => setData({...data, conductor: e.target.value})} />

        <input type="date"
          onChange={e => setData({...data, fecha: e.target.value})} />

        <input placeholder="Lugar destino"
          onChange={e => setData({...data, lugarDestino: e.target.value})} />

        <input placeholder="Ciudad"
          onChange={e => setData({...data, ciudad: e.target.value})} />
      </div>

      {/* ================= VEHICULO ================= */}
      <div className="grid grid-cols-3 gap-4">
        <input placeholder="Vehículo"
          onChange={e => setData({...data, vehiculo: e.target.value})} />

        <input placeholder="Modelo"
          onChange={e => setData({...data, modelo: e.target.value})} />

        <input placeholder="Placa"
          onChange={e => setData({...data, placa: e.target.value})} />
      </div>

      {/* ================= CHECKLIST ================= */}
      <div>
        <h2 className="font-bold">Checklist</h2>

        <div className="grid grid-cols-3 gap-4">

          {/* INTERIOR */}
          <div>
            <h3 className="font-semibold">Interior</h3>
            {Object.keys(data.checklist.interior).map(item => (
              <label key={item} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={data.checklist.interior[item]}
                  onChange={() => toggleCheck("interior", item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* MOTOR */}
          <div>
            <h3 className="font-semibold">Motor</h3>
            {Object.keys(data.checklist.motor).map(item => (
              <label key={item} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={data.checklist.motor[item]}
                  onChange={() => toggleCheck("motor", item)}
                />
                {item}
              </label>
            ))}
          </div>

          {/* EXTERIOR */}
          <div>
            <h3 className="font-semibold">Exterior</h3>
            {Object.keys(data.checklist.exterior).map(item => (
              <label key={item} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={data.checklist.exterior[item]}
                  onChange={() => toggleCheck("exterior", item)}
                />
                {item}
              </label>
            ))}
          </div>

        </div>
      </div>

      {/* ================= DAÑOS ================= */}
      <div>
        <h2 className="font-bold">Daños de carrocería</h2>

        {/* selector tipo daño */}
        <div className="flex gap-2 mb-2">
          {Object.keys(colores).map(tipo => (
            <button
              key={tipo}
              onClick={() => setTipoDano(tipo)}
              className={`px-2 py-1 border ${tipoDano === tipo ? "bg-gray-300" : ""}`}
            >
              {tipo}
            </button>
          ))}
        </div>

        {/* captura */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
        />

        {/* canvas */}
        {data.danos.imagen && (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ width: "100%", border: "1px solid black", marginTop: 10 }}
          />
        )}

        <p className="text-sm mt-2">
          👉 Tap para agregar daño / tap sobre punto para eliminar
        </p>
      </div>

      {/* ================= OBSERVACIONES ================= */}
      <textarea
        placeholder="Observaciones"
        onChange={e => setData({...data, observaciones: e.target.value})}
      />

    </div>
  );
}
