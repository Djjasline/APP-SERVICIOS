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
