import React, { useState } from "react";

export default function HojaRecepcion() {

  const [data, setData] = useState({
    conductor: "",
    fecha: "",
    lugarDestino: "",
    ciudad: "",

    vehiculo: "",
    modelo: "",
    placa: "",

    descripcion: {
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
    <div className="p-4 max-w-6xl mx-auto space-y-6">

      {/* ===================== TITULO ===================== */}
      <h1 className="text-center font-bold text-lg tracking-wide">
        HOJA DE RECEPCIÓN
      </h1>

      {/* ===================== DATOS GENERALES ===================== */}
      <div className="border border-gray-400">

        {/* FILA 1 */}
        <div className="grid grid-cols-2 border-b border-gray-400">
          <input
            placeholder="Conductor"
            className="p-2 border-r border-gray-400"
            onChange={e => setData({...data, conductor: e.target.value})}
          />
          <input
            type="date"
            className="p-2"
            onChange={e => setData({...data, fecha: e.target.value})}
          />
        </div>

        {/* FILA 2 */}
        <div className="grid grid-cols-2 border-b border-gray-400">
          <input
            placeholder="Lugar destino"
            className="p-2 border-r border-gray-400"
            onChange={e => setData({...data, lugarDestino: e.target.value})}
          />
          <input
            placeholder="Ciudad"
            className="p-2"
            onChange={e => setData({...data, ciudad: e.target.value})}
          />
        </div>

        {/* FILA 3 */}
        <div className="grid grid-cols-3">
          <input
            placeholder="Vehículo"
            className="p-2 border-r border-gray-400"
            onChange={e => setData({...data, vehiculo: e.target.value})}
          />
          <input
            placeholder="Modelo"
            className="p-2 border-r border-gray-400"
            onChange={e => setData({...data, modelo: e.target.value})}
          />
          <input
            placeholder="Placa"
            className="p-2"
            onChange={e => setData({...data, placa: e.target.value})}
          />
        </div>

      </div>

      {/* ===================== DESCRIPCIÓN DEL EQUIPO ===================== */}
      <div className="border border-gray-400">

        <div className="text-center font-semibold border-b border-gray-400 py-1">
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
          <div
            key={i}
            className="grid grid-cols-4 border-b border-gray-300"
          >
            <div className="col-span-1 p-2 border-r border-gray-300 text-sm">
              {item.label}
            </div>

            <input
              className="col-span-3 p-2 text-sm"
              onChange={(e) =>
                setData({
                  ...data,
                  descripcion: {
                    ...data.descripcion,
                    [item.key]: e.target.value
                  }
                })
              }
            />
          </div>
        ))}

      </div>

    </div>
  );
}
