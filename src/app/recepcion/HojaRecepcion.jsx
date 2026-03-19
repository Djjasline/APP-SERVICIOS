import React, { useState } from "react";

export default function HojaRecepcion() {

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

  return (
    <div className="p-4 max-w-6xl mx-auto text-xs space-y-4">

      {/* ================= HEADER ================= */}
      <div className="border">

        <div className="grid grid-cols-6 border-b">

          {/* LOGO */}
          <div className="col-span-1 flex items-center justify-center border-r p-2">
            <img src="/astap-logo.jpg" className="h-10" />
          </div>

          {/* TITULO */}
          <div className="col-span-3 flex items-center justify-center border-r font-bold">
            HOJA DE RECEPCIÓN
          </div>

          {/* VERSION */}
          <div className="col-span-2 p-2">
            <div>Fecha versión: 01-01-26</div>
            <div>Versión: 01</div>
          </div>

        </div>

        {/* FILAS HEADER */}
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

        <div className="grid grid-cols-1">
          <input type="date" className="p-2" />
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

    </div>
  );
}
{/* ===================== DOCUMENTOS Y ESTADO ===================== */}
<div className="border">

  {/* TITULO */}
  <div className="text-center font-semibold border-b py-1">
    DOCUMENTOS Y ESTADO DEL VEHÍCULO
  </div>

  <div className="grid grid-cols-12 text-xs">

    {/* ================= INTERIOR ================= */}
    <div className="col-span-4 border-r">

      <div className="grid grid-cols-4 border-b font-semibold text-center">
        <div className="col-span-2 border-r">INTERIOR</div>
        <div className="border-r">SI</div>
        <div>NO</div>
      </div>

      {[
        "GATA",
        "LLAVE TIPO CRUZ",
        "EXTINTOR",
        "LUZ CABINA",
        "RADIO (MASCARILLA)",
        "TAPETES (CAUCHO)",
        "ENCENDEDOR",
        "AIRE ACONDICIONADO",
        "ALARMA"
      ].map((item, i) => (
        <div key={i} className="grid grid-cols-4 border-b">

          <div className="col-span-2 border-r px-1">{item}</div>

          <button className="border-r hover:bg-green-200">✔</button>
          <button className="hover:bg-red-200">✘</button>

        </div>
      ))}

    </div>

    {/* ================= MOTOR ================= */}
    <div className="col-span-4 border-r">

      <div className="grid grid-cols-4 border-b font-semibold text-center">
        <div className="col-span-2 border-r">MOTOR</div>
        <div className="border-r">SI</div>
        <div>NO</div>
      </div>

      {[
        "ACEITE DE MOTOR",
        "REFRIGERANTE",
        "BATERÍA ESTADO ACEPTABLE",
        "TAPÓN ACEITE (FUGAS)",
        "TAPA COMBUSTIBLE",
        "TAPA RADIADOR (FUGAS)"
      ].map((item, i) => (
        <div key={i} className="grid grid-cols-4 border-b">

          <div className="col-span-2 border-r px-1">{item}</div>

          <button className="border-r hover:bg-green-200">✔</button>
          <button className="hover:bg-red-200">✘</button>

        </div>
      ))}

      {/* OBSERVACIONES */}
      <div className="border-t p-1">
        <div className="font-semibold">OBSERVACIONES:</div>
        <textarea className="w-full border mt-1 h-16"></textarea>
      </div>

    </div>

    {/* ================= EXTERIOR ================= */}
    <div className="col-span-3 border-r">

      <div className="grid grid-cols-4 border-b font-semibold text-center">
        <div className="col-span-2 border-r">EXTERIOR</div>
        <div className="border-r">SI</div>
        <div>NO</div>
      </div>

      {[
        "PLUMAS",
        "RETROVISOR",
        "PLACAS",
        "LLANTA EMERGENCIA",
        "TAPACUBOS",
        "LUCES (OBSERVACIONES)"
      ].map((item, i) => (
        <div key={i} className="grid grid-cols-4 border-b">

          <div className="col-span-2 border-r px-1">{item}</div>

          <button className="border-r hover:bg-green-200">✔</button>
          <button className="hover:bg-red-200">✘</button>

        </div>
      ))}

    </div>

    {/* ================= COMBUSTIBLE ================= */}
    <div className="col-span-1 flex flex-col items-center justify-center p-2">

      <div className="text-center text-[10px] font-semibold">
        NIVEL DE COMBUSTIBLE
      </div>

      <canvas
        width={120}
        height={80}
        onClick={(e) => {
          const rect = e.target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const level = x / rect.width;

          setFuelLevel(level);
        }}
        ref={fuelCanvasRef}
        className="mt-2 border"
      />

    </div>

  </div>

</div>
