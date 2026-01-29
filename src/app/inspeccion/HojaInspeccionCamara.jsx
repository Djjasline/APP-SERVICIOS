import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES – CÁMARA V-CAM
============================= */
const secciones = [
  {
    id: "sec1",
    titulo:
      "1. PRUEBAS DE ENCENDIDO DEL EQUIPO Y FUNCIONAMIENTO DE SUS SISTEMAS, PREVIOS AL SERVICIO",
    items: [
      { codigo: "1.1", texto: "Prueba de encendido general del equipo" },
      { codigo: "1.2", texto: "Verificación de funcionamiento de controles principales" },
      { codigo: "1.3", texto: "Revisión de alarmas o mensajes de fallo" },
    ],
  },
  {
    id: "secA",
    titulo:
      "2. EVALUACIÓN DEL ESTADO DE LOS COMPONENTES O ESTADO DE LOS SISTEMAS",
    items: [
      { codigo: "A.1", texto: "Estructura del carrete sin deformaciones" },
      { codigo: "A.2", texto: "Pintura y acabado sin corrosión" },
      { codigo: "A.3", texto: "Manivela y freno en buen estado" },
      { codigo: "A.4", texto: "Base estable sin vibraciones" },
      { codigo: "A.5", texto: "Ruedas en buen estado" },
      { codigo: "A.6", texto: "Cable sin cortes ni aplastamientos" },
      { codigo: "A.7", texto: "Recubrimiento sin grietas" },
      { codigo: "A.8", texto: "Longitud correcta del cable" },
      { codigo: "A.9", texto: "Marcadores visibles" },
      { codigo: "A.10", texto: "Enrollado uniforme" },
      { codigo: "A.11", texto: "Cable limpio" },
      { codigo: "A.12", texto: "Lubricación correcta" },
      { codigo: "A.13", texto: "Protecciones instaladas" },
      { codigo: "A.14", texto: "Empaque en buen estado" },
      { codigo: "A.15", texto: "Sin fugas" },
      { codigo: "A.16", texto: "Protección frontal intacta" },
      { codigo: "A.17", texto: "Lente sin rayaduras" },
      { codigo: "A.18", texto: "Iluminación LED funcional" },
      { codigo: "A.19", texto: "Imagen estable" },
      { codigo: "A.20", texto: "Sin interferencias" },
      { codigo: "A.21", texto: "Control de intensidad LED" },
    ],
  },
];

export default function HojaInspeccionCamara() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const [formData, setFormData] = useState({
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaInspeccion: "",
    ubicacion: "",
    cliente: "",
    tecnicoAstap: "",
    responsableCliente: "",
    estadoEquipoDetalle: "",
    estadoEquipoPuntos: [],
    items: {},
    firmas: {
      tecnico: "",
      cliente: "",
    },
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

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: [
        ...p.estadoEquipoPuntos,
        { id: p.estadoEquipoPuntos.length + 1, x, y },
      ],
    }));
  };

  const handleRemovePoint = (id) => {
    setFormData((p) => ({
      ...p,
      estadoEquipoPuntos: p.estadoEquipoPuntos
        .filter((pt) => pt.id !== id)
        .map((pt, i) => ({ ...pt, id: i + 1 })),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const firmas = {
      tecnico: firmaTecnicoRef.current?.isEmpty()
        ? ""
        : firmaTecnicoRef.current.toDataURL(),
      cliente: firmaClienteRef.current?.isEmpty()
        ? ""
        : firmaClienteRef.current.toDataURL(),
    };

    markInspectionCompleted("camara", id, {
      ...formData,
      firmas,
    });

    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >

      {/* ENCABEZADO */}
      <section className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b">
              <td rowSpan={4} className="w-32 border-r p-3 text-center">
                <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
              </td>
              <td colSpan={2} className="border-r text-center font-bold">
                HOJA DE INSPECCIÓN CÁMARA V-CAM
              </td>
              <td className="p-2">
                <div>Fecha versión: <strong>25-11-2025</strong></div>
                <div>Versión: <strong>01</strong></div>
              </td>
            </tr>

            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([label, name]) => (
              <tr key={name} className="border-b">
                <td className="border-r p-2 font-semibold">{label}</td>
                <td colSpan={2} className="p-2">
                  <input
                    name={name}
                    onChange={handleChange}
                    className="w-full border rounded p-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* DATOS */}
      <section className="grid md:grid-cols-2 gap-3 border rounded p-4">
        <input type="date" name="fechaInspeccion" onChange={handleChange} className="input" />
        <input name="ubicacion" placeholder="Ubicación" onChange={handleChange} className="input" />
        <input name="cliente" placeholder="Cliente" onChange={handleChange} className="input" />
        <input name="tecnicoAstap" placeholder="Técnico ASTAP" onChange={handleChange} className="input" />
        <input name="responsableCliente" placeholder="Responsable cliente" onChange={handleChange} className="input md:col-span-2" />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4 space-y-2">
        <p className="font-semibold">Estado del equipo</p>
        <div className="relative border rounded cursor-crosshair" onClick={handleImageClick}>
          <img src="/estado equipo camara.png" className="w-full" draggable={false} />
          {formData.estadoEquipoPuntos.map((pt) => (
            <div
              key={pt.id}
              onDoubleClick={() => handleRemovePoint(pt.id)}
              className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
              style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
            >
              {pt.id}
            </div>
          ))}
        </div>
        <textarea
          name="estadoEquipoDetalle"
          placeholder="Observaciones"
          onChange={handleChange}
          className="w-full border rounded p-2 min-h-[80px]"
        />
      </section>

      {/* TABLAS */}
      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>SI</th>
                <th>NO</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {sec.items.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.codigo}</td>
                  <td>{item.texto}</td>
                  <td>
                    <input
                      type="radio"
                      onChange={() => handleItemChange(item.codigo, "estado", "SI")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      onChange={() => handleItemChange(item.codigo, "estado", "NO")}
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
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

      {/* FIRMAS */}
      <section className="border rounded p-4">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div>
            <p className="font-semibold mb-1">FIRMA TÉCNICO ASTAP</p>
            <SignatureCanvas
              ref={firmaTecnicoRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
            <button
              type="button"
              onClick={() => firmaTecnicoRef.current.clear()}
              className="text-xs mt-1 border px-2 py-1 rounded"
            >
              Borrar firma
            </button>
          </div>

          <div>
            <p className="font-semibold mb-1">FIRMA CLIENTE</p>
            <SignatureCanvas
              ref={firmaClienteRef}
              canvasProps={{ className: "border w-full h-32" }}
            />
            <button
              type="button"
              onClick={() => firmaClienteRef.current.clear()}
              className="text-xs mt-1 border px-2 py-1 rounded"
            >
              Borrar firma
            </button>
          </div>
        </div>
      </section>

      {/* BOTONES */}
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
 
