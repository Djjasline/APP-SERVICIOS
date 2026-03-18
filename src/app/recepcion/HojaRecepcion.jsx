import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import SignatureCanvas from "react-signature-canvas";

export default function HojaRecepcion() {

  const [loading, setLoading] = useState(false);

  const [fuelLevel, setFuelLevel] = useState(0.5);
  const fuelCanvasRef = useRef();

  const sigRef = useRef();

  const [data, setData] = useState({
    conductor: "",
    fecha: "",
    lugarDestino: "",
    ciudad: "",

    vehiculo: "",
    modelo: "",
    placa: "",

    checklist: {
      interior: { gata: null, llaveCruz: null, luces: null },
      motor: { aceite: null, refrigerante: null },
      exterior: { retrovisores: null, llantaEmergencia: null }
    },

    danos: {
      imagen: null,
      puntos: [],
      canvasWidth: 0,
      canvasHeight: 0
    },

    observaciones: "",
    firma: ""
  });

  const [tipoDano, setTipoDano] = useState("golpe");

  const colores = {
    golpe: "red",
    rayon: "yellow",
    abolladura: "orange"
  };

  // ==============================
  // COMBUSTIBLE
  // ==============================
  useEffect(() => {
    const canvas = fuelCanvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(150, 120, 80, Math.PI, 2 * Math.PI);
    ctx.stroke();

    ctx.fillText("E", 60, 130);
    ctx.fillText("F", 230, 130);

    const angle = Math.PI + fuelLevel * Math.PI;
    const x = 150 + 70 * Math.cos(angle);
    const y = 120 + 70 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(150, 120);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "red";
    ctx.stroke();

  }, [fuelLevel]);

  // ==============================
  // IMAGEN
  // ==============================
  const handleCapture = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setData(prev => ({
        ...prev,
        danos: {
          ...prev.danos,
          imagen: reader.result
        }
      }));
    };

    reader.readAsDataURL(file);
  };

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

      setData(prev => ({
        ...prev,
        danos: {
          ...prev.danos,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height
        }
      }));

      draw();
    };

  }, [data.danos.imagen, data.danos.puntos]);

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(imgRef.current, 0, 0);

    data.danos.puntos.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = colores[p.tipo];
      ctx.fill();
    });
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    setData(prev => ({
      ...prev,
      danos: {
        ...prev.danos,
        puntos: [...prev.danos.puntos, { x, y, tipo: tipoDano }]
      }
    }));
  };

  // ==============================
  // SI / NO
  // ==============================
  const setCheck = (grupo, item, value) => {
    setData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [grupo]: {
          ...prev.checklist[grupo],
          [item]: value
        }
      }
    }));
  };

  const renderSiNo = (grupo, item, label) => (
    <div className="flex gap-4">
      <span className="w-40">{label}</span>

      <label>
        <input
          type="checkbox"
          checked={data.checklist[grupo][item] === true}
          onChange={() => setCheck(grupo, item, true)}
        /> SI
      </label>

      <label>
        <input
          type="checkbox"
          checked={data.checklist[grupo][item] === false}
          onChange={() => setCheck(grupo, item, false)}
        /> NO
      </label>
    </div>
  );

  // ==============================
  // GUARDAR
  // ==============================
  const guardarRecepcion = async () => {
    try {
      setLoading(true);

      const firma = sigRef.current.toDataURL();

      const payload = {
        tipo: "recepcion",
        subtipo: "vehicular",
        estado: "borrador",
        data: {
          ...data,
          firma,
          fuelLevel
        }
      };

      const { error } = await supabase.from("registros").insert([payload]);

      if (error) throw error;

      alert("Guardado correctamente 🚀");

    } catch (err) {
      console.error(err);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div className="p-4 space-y-6">

      <h1 className="text-xl font-bold text-center">HOJA DE RECEPCIÓN</h1>

      {/* DATOS */}
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Conductor" onChange={e => setData({...data, conductor: e.target.value})}/>
        <input type="date" onChange={e => setData({...data, fecha: e.target.value})}/>
        <input placeholder="Lugar destino" onChange={e => setData({...data, lugarDestino: e.target.value})}/>
        <input placeholder="Ciudad" onChange={e => setData({...data, ciudad: e.target.value})}/>
      </div>

      {/* VEHICULO */}
      <div className="grid grid-cols-3 gap-2">
        <input placeholder="Vehículo" onChange={e => setData({...data, vehiculo: e.target.value})}/>
        <input placeholder="Modelo" onChange={e => setData({...data, modelo: e.target.value})}/>
        <input placeholder="Placa" onChange={e => setData({...data, placa: e.target.value})}/>
      </div>

      {/* CHECKLIST */}
      <div>
        <h2 className="font-bold">Checklist</h2>

        {renderSiNo("interior", "gata", "Gata")}
        {renderSiNo("interior", "llaveCruz", "Llave Cruz")}
        {renderSiNo("motor", "aceite", "Aceite")}
        {renderSiNo("exterior", "retrovisores", "Retrovisores")}
      </div>

      {/* COMBUSTIBLE */}
      <div>
        <h2 className="font-bold">Nivel Combustible</h2>

        <canvas
          ref={fuelCanvasRef}
          width={300}
          height={150}
          onClick={(e) => {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setFuelLevel(x / rect.width);
          }}
          style={{ border: "1px solid black" }}
        />
      </div>

      {/* DAÑOS */}
      <div>
        <h2 className="font-bold">Daños</h2>

        <input type="file" accept="image/*" capture="environment" onChange={handleCapture} />

        {data.danos.imagen && (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ width: "100%", border: "1px solid black" }}
          />
        )}
      </div>

      {/* FIRMA */}
      <div>
        <h3>Firma</h3>

        <SignatureCanvas
          ref={sigRef}
          canvasProps={{ width: 300, height: 100, className: "border" }}
        />

        <button onClick={() => sigRef.current.clear()}>
          Limpiar
        </button>
      </div>

      {/* OBS */}
      <textarea placeholder="Observaciones"
        onChange={e => setData({...data, observaciones: e.target.value})}
      />

      {/* BOTON */}
      <button onClick={guardarRecepcion} disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Guardando..." : "Guardar Recepción"}
      </button>

    </div>
  );
}
