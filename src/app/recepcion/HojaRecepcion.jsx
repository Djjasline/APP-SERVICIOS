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

    // DESCRIPCIÓN EQUIPO
    nota: "",
    marca: "",
    modeloEquipo: "",
    serie: "",
    anio: "",
    vin: "",
    placaEquipo: "",
    horasModulo: "",
    horasChasis: "",
    kilometraje: ""
  });

  return (
    <div className="p-4 max-w-5xl mx-auto text-sm">

      {/* ================= TITULO ================= */}
      <h1 className="text-center font-bold text-lg mb-4">
        HOJA DE RECEPCIÓN
      </h1>

      {/* ================= TABLA DATOS ================= */}
      <div className="border border-black">

        {/* FILA 1 */}
        <div className="grid grid-cols-2 border-b border-black">
          <input
            placeholder="Conductor"
            className="border-r border-black p-1"
            onChange={e => setData({...data, conductor: e.target.value})}
          />
          <input
            type="date"
            className="p-1"
            onChange={e => setData({...data, fecha: e.target.value})}
          />
        </div>

        {/* FILA 2 */}
        <div className="grid grid-cols-2 border-b border-black">
          <input
            placeholder="Lugar destino"
            className="border-r border-black p-1"
            onChange={e => setData({...data, lugarDestino: e.target.value})}
          />
          <input
            placeholder="Ciudad"
            className="p-1"
            onChange={e => setData({...data, ciudad: e.target.value})}
          />
        </div>

        {/* FILA 3 */}
        <div className="grid grid-cols-3">
          <input
            placeholder="Vehículo"
            className="border-r border-black p-1"
            onChange={e => setData({...data, vehiculo: e.target.value})}
          />
          <input
            placeholder="Modelo"
            className="border-r border-black p-1"
            onChange={e => setData({...data, modelo: e.target.value})}
          />
          <input
            placeholder="Placa"
            className="p-1"
            onChange={e => setData({...data, placa: e.target.value})}
          />
        </div>
      </div>

      {/* ================= DESCRIPCIÓN DEL EQUIPO ================= */}
      <div className="mt-6 border border-black">

        <div className="text-center font-bold border-b border-black py-1">
          DESCRIPCIÓN DEL EQUIPO
        </div>

        {[
          ["NOTA", "nota"],
          ["MARCA", "marca"],
          ["MODELO", "modeloEquipo"],
          ["N° SERIE", "serie"],
          ["AÑO MODELO", "anio"],
          ["VIN / CHASIS", "vin"],
          ["PLACA", "placaEquipo"],
          ["HORAS MÓDULO", "horasModulo"],
          ["HORAS CHASIS", "horasChasis"],
          ["KILOMETRAJE", "kilometraje"]
        ].map(([label, key], i) => (
          <div key={i} className="grid grid-cols-3 border-b border-black">
            
            <div className="border-r border-black p-1 font-medium">
              {label}
            </div>

            <input
              className="col-span-2 p-1"
              onChange={e => setData({...data, [key]: e.target.value})}
            />
          </div>
        ))}

      </div>

    </div>
  );
}

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
