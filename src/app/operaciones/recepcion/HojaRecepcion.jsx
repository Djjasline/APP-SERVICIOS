import React, { useState, useRef, useEffect } from "react";

export default function HojaRecepcion() {

  // ================= STATE =================
  const [data, setData] = useState({
    referencia: "",
    descripcion: "",
    codigo: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnico: "",
    telefonoTecnico: "",
    correoTecnico: "",
    fecha: "",

    equipo: {
      nota: "",
      marca: "",
      modelo: "",
      serie: "",
      anio: "",
      vin: "",
      placa: "",
      horasModulo: "",
      horasChasis: "",
      kilometraje: ""
    }
  });

  // 🔥 combustible
  const [fuelLevel, setFuelLevel] = useState(0.5);
  const fuelCanvasRef = useRef(null);

  // ================= DRAW FUEL =================
  useEffect(() => {
    const canvas = fuelCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(60, 60, 40, Math.PI, 2 * Math.PI);
    ctx.stroke();

    ctx.fillText("E", 15, 65);
    ctx.fillText("F", 95, 65);

    const angle = Math.PI + fuelLevel * Math.PI;
    const x = 60 + 35 * Math.cos(angle);
    const y = 60 + 35 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(60, 60);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "red";
    ctx.stroke();

  }, [fuelLevel]);

  // ================= UI =================
  return (
    <div className="p-4 max-w-6xl mx-auto text-xs space-y-4">

      {/* ================= HEADER ================= */}
      <div className="border">

        <div className="grid grid-cols-6 border-b">

          <div className="col-span-1 flex items-center justify-center border-r p-2">
            <img src="/astap-logo.jpg" className="h-10" />
          </div>

          <div className="col-span-3 flex items-center justify-center border-r font-bold">
            HOJA DE RECEPCIÓN
          </div>

          <div className="col-span-2 p-2">
            <div>Fecha versión: 01-01-26</div>
            <div>Versión: 01</div>
          </div>

        </div>

        {[
          { label: "REFERENCIA DE CONTRATO", key: "referencia" },
          { label: "DESCRIPCIÓN", key: "descripcion" },
          { label: "COD. INF.", key: "codigo" }
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-6 border-t">

            <div className="col-span-3 border-r p-2">
              {row.label}
            </div>

            <input
              className="col-span-3 p-2"
              onChange={(e) =>
                setData({ ...data, [row.key]: e.target.value })
              }
            />

          </div>
        ))}

      </div>

      {/* ================= CLIENTE ================= */}
      <div className="border">

        <div className="grid grid-cols-2 border-b">
          <input placeholder="Cliente" className="p-2 border-r" />
          <input placeholder="Dirección" className="p-2" />
        </div>

        <div className="grid grid-cols-2 border-b">
          <input placeholder="Contacto" className="p-2 border-r" />
          <input placeholder="Teléfono" className="p-2" />
        </div>

        <div className="grid grid-cols-2 border-b">
          <input placeholder="Correo" className="p-2 border-r" />
          <input placeholder="Técnico responsable" className="p-2" />
        </div>

        <div className="grid grid-cols-2 border-b">
          <input placeholder="Teléfono técnico" className="p-2 border-r" />
          <input placeholder="Correo técnico" className="p-2" />
        </div>

        <div>
          <input type="date" className="p-2 w-full" />
        </div>

      </div>

      {/* ================= DESCRIPCIÓN EQUIPO ================= */}
      <div className="border">

        <div className="text-center font-semibold border-b py-1">
          DESCRIPCIÓN DEL EQUIPO
        </div>

        {[
          { label: "NOTA", key: "nota" },
          { label: "MARCA", key: "marca" },
          { label: "MODELO", key: "modelo" },
          { label: "N° SERIE", key: "serie" },
          { label: "AÑO MODELO", key: "anio" },
          { label: "VIN / CHASIS", key: "vin" },
          { label: "PLACA", key: "placa" },
          { label: "HORAS MÓDULO", key: "horasModulo" },
          { label: "HORAS CHASIS", key: "horasChasis" },
          { label: "KILOMETRAJE", key: "kilometraje" }
        ].map((item, i) => (
          <div key={i} className="grid grid-cols-4 border-t">

            <div className="col-span-1 border-r p-2">
              {item.label}
            </div>

            <input className="col-span-3 p-2" />

          </div>
        ))}

      </div>

      {/* ================= TABLA ================= */}
      <div className="border">

        <div className="text-center font-semibold border-b py-1">
          DOCUMENTOS Y ESTADO DEL VEHÍCULO
        </div>

        <div className="grid grid-cols-12">

          {/* INTERIOR */}
          <div className="col-span-4 border-r">
            <div className="grid grid-cols-4 border-b font-semibold text-center">
              <div className="col-span-2 border-r">INTERIOR</div>
              <div className="border-r">SI</div>
              <div>NO</div>
            </div>

            {["GATA","LLAVE CRUZ","EXTINTOR","LUZ CABINA","RADIO","TAPETES","ENCENDEDOR","AIRE","ALARMA"]
              .map((item,i)=>(
              <div key={i} className="grid grid-cols-4 border-b">
                <div className="col-span-2 border-r px-1">{item}</div>
                <button className="border-r">✔</button>
                <button>✘</button>
              </div>
            ))}
          </div>

          {/* MOTOR */}
          <div className="col-span-4 border-r">
            <div className="grid grid-cols-4 border-b font-semibold text-center">
              <div className="col-span-2 border-r">MOTOR</div>
              <div className="border-r">SI</div>
              <div>NO</div>
            </div>

            {["ACEITE","REFRIGERANTE","BATERIA","TAPON ACEITE","TAPA COMB","RADIADOR"]
              .map((item,i)=>(
              <div key={i} className="grid grid-cols-4 border-b">
                <div className="col-span-2 border-r px-1">{item}</div>
                <button className="border-r">✔</button>
                <button>✘</button>
              </div>
            ))}
          </div>

          {/* EXTERIOR */}
          <div className="col-span-3 border-r">
            <div className="grid grid-cols-4 border-b font-semibold text-center">
              <div className="col-span-2 border-r">EXTERIOR</div>
              <div className="border-r">SI</div>
              <div>NO</div>
            </div>

            {["PLUMAS","RETROVISOR","PLACAS","LLANTA","TAPACUBOS","LUCES"]
              .map((item,i)=>(
              <div key={i} className="grid grid-cols-4 border-b">
                <div className="col-span-2 border-r px-1">{item}</div>
                <button className="border-r">✔</button>
                <button>✘</button>
              </div>
            ))}
          </div>

          {/* COMBUSTIBLE */}
          <div className="col-span-1 flex flex-col items-center justify-center p-2">

            <div className="text-center text-[10px] font-semibold">
              COMBUSTIBLE
            </div>

            <canvas
              ref={fuelCanvasRef}
              width={120}
              height={80}
              onClick={(e) => {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                setFuelLevel(x / rect.width);
              }}
              className="border mt-2"
            />

          </div>

        </div>

      </div>

    </div>
  );
}
