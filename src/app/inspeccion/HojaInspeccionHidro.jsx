// src/app/inspeccion/HojaInspeccionHidro.jsx

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      { codigo: "1.2", texto: "Verificación de controles principales" },
      { codigo: "1.3", texto: "Revisión de alarmas o fallos" },
    ],
  },
  {
    id: "secA",
    titulo:
      "2. EVALUACIÓN DEL ESTADO – A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico" },
      { codigo: "A.2", texto: "Nivel de aceite del soplador" },
      { codigo: "A.3", texto: "Nivel de aceite hidráulico" },
      { codigo: "A.4", texto: "Aceite caja de transferencia" },
    ],
  },
  {
    id: "secB",
    titulo:
      "2. EVALUACIÓN DEL ESTADO – B) SISTEMA HIDRÁULICO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Empaques filtros de agua" },
      { codigo: "B.2", texto: "Tapón expansión tanques" },
      { codigo: "B.3", texto: "Fugas tanque aluminio" },
    ],
  },
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    tecnicoAstap: "",
    responsableCliente: "",
    estadoEquipo: "",
    observacionesGenerales: "",
    items: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleItemChange = (codigo, campo, valor) => {
    setFormData((p) => ({
      ...p,
      items: {
        ...p.items,
        [codigo]: {
          ...p.items[codigo],
          [campo]: valor,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    markInspectionCompleted("hidro", id, formData);
    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ================= ENCABEZADO ================= */}
      <section className="border rounded-xl p-4 space-y-4">

        <div className="grid grid-cols-[120px_1fr_220px] items-center gap-4">
          <div className="flex justify-center">
            <img src="/astap-logo.png" alt="ASTAP" className="h-14" />
          </div>

          <h1 className="text-center font-bold text-lg">
            HOJA DE INSPECCIÓN – HIDROSUCCIONADOR
          </h1>

          <div className="text-xs text-right">
            <div>Fecha versión: 25-11-2025</div>
            <div>Versión: 01</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input name="referenciaContrato" onChange={handleChange} placeholder="Referencia contrato" className="input" />
          <input name="descripcion" onChange={handleChange} placeholder="Descripción" className="input" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <input name="codInf" onChange={handleChange} placeholder="Cod. INF." className="input" />
          <input type="date" name="fechaInspeccion" onChange={handleChange} className="input" />
          <input name="ubicacion" onChange={handleChange} placeholder="Ubicación" className="input" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input name="cliente" onChange={handleChange} placeholder="Cliente" className="input" />
          <input name="tecnicoAstap" onChange={handleChange} placeholder="Técnico ASTAP" className="input" />
        </div>

        <input
          name="responsableCliente"
          onChange={handleChange}
          placeholder="Responsable cliente"
          className="input w-full"
        />
      </section>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      <section className="border rounded-xl p-4 space-y-4">
        <h2 className="font-semibold">Estado del equipo</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {["/hidro-1.png", "/hidro-2.png", "/hidro-3.png", "/hidro-4.png"].map(
            (img, i) => (
              <div key={i} className="border rounded p-2 flex justify-center">
                <img src={img} alt={`vista-${i}`} className="max-h-40" />
              </div>
            )
          )}
        </div>

        <textarea
          name="estadoEquipo"
          value={formData.estadoEquipo}
          onChange={handleChange}
          placeholder="Detalle del estado del equipo"
          className="input w-full min-h-[90px]"
        />
      </section>

      {/* ================= SECCIONES ================= */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full border-collapse border text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Ítem</th>
                <th className="border p-1">Detalle</th>
                <th className="border p-1">Sí</th>
                <th className="border p-1">No</th>
                <th className="border p-1">Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item) => (
                <tr key={item.codigo}>
                  <td className="border p-1">{item.codigo}</td>
                  <td className="border p-1">{item.texto}</td>
                  <td className="border p-1 text-center">
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "SI"}
                      onChange={() =>
                        handleItemChange(item.codigo, "estado", "SI")
                      }
                    />
                  </td>
                  <td className="border p-1 text-center">
                    <input
                      type="radio"
                      checked={formData.items[item.codigo]?.estado === "NO"}
                      onChange={() =>
                        handleItemChange(item.codigo, "estado", "NO")
                      }
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      className="w-full border px-1"
                      value={formData.items[item.codigo]?.observacion || ""}
                      onChange={(e) =>
                        handleItemChange(item.codigo, "observacion", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {/* ================= BOTONES ================= */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
