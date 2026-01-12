import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { markInspectionCompleted } from "@utils/inspectionStorage";

/* =============================
   SECCIONES DE INSPECCIÓN BARREDORA
============================= */
const secciones = [
  {
    id: "secA",
    titulo: "A) SISTEMA HIDRÁULICO (ACEITES)",
    items: [
      { codigo: "A.1", texto: "Fugas de aceite hidráulico (mangueras, acoples, bancos, cilindros y solenoides)" },
      { codigo: "A.2", texto: "Nivel de aceite del tanque AW68, ¿se visualiza la mirilla?" },
      { codigo: "A.3", texto: "Fugas de aceite en motores de cepillos" },
      { codigo: "A.4", texto: "Fugas de aceite en motor de banda" },
      { codigo: "A.5", texto: "Fugas de bombas hidráulicas" },
      { codigo: "A.6", texto: "Fugas en motor John Deere" },
    ],
  },
  {
    id: "secB",
    titulo: "B) SISTEMA DE CONTROL DE POLVO (AGUA)",
    items: [
      { codigo: "B.1", texto: "Inspección de fugas de agua (mangueras, acoples)" },
      { codigo: "B.2", texto: "Estado del filtro para agua" },
      { codigo: "B.3", texto: "Estado de válvulas check" },
      { codigo: "B.4", texto: "Estado de solenoides de apertura de agua" },
      { codigo: "B.5", texto: "Estado de la bomba eléctrica de agua" },
      { codigo: "B.6", texto: "Estado de los aspersores de cepillos" },
      { codigo: "B.7", texto: "Estado de la manguera de carga de agua hidrante" },
      { codigo: "B.8", texto: "Inspección del medidor de nivel del tanque" },
      { codigo: "B.9", texto: "Inspección del sistema de llenado de agua" },
    ],
  },
  {
    id: "secC",
    titulo: "C) SISTEMA ELÉCTRICO Y ELECTRÓNICO",
    items: [
      { codigo: "C.1", texto: "Inspección visual de conectores (sockets) de bancos de control" },
      { codigo: "C.2", texto: "Evaluar funcionamiento de elementos al encender el equipo" },
      { codigo: "C.3", texto: "Estado del tablero de control de cabina" },
      { codigo: "C.4", texto: "Inspección de batería" },
      { codigo: "C.5", texto: "Inspección de luces externas" },
      { codigo: "C.6", texto: "Diagnóstico y conexión con service tool (opcional)" },
      { codigo: "C.7", texto: "Inspección de limpia parabrisas" },
      { codigo: "C.8", texto: "Verificación de conexiones externas (GPS / radiocomunicación)" },
    ],
  },
  {
    id: "secD",
    titulo: "D) SISTEMA DE SUCCIÓN",
    items: [
      { codigo: "D.1", texto: "Estado de la banda, aceptable" },
      { codigo: "D.2", texto: "Estado de las cerdas de los cepillos" },
      { codigo: "D.3", texto: "Estado de la tolva" },
      { codigo: "D.4", texto: "Funcionamiento aceptable de la tolva" },
      { codigo: "D.5", texto: "Funcionamiento aceptable de la banda" },
      { codigo: "D.6", texto: "Estado de zapatas de arrastre cortas y largas" },
    ],
  },
  {
    id: "secE",
    titulo: "E) MOTOR JOHN DEERE",
    items: [
      { codigo: "E.1", texto: "Estado de filtros de aire 1° y 2°" },
      { codigo: "E.2", texto: "Estado de filtro combustible trampa de agua" },
      { codigo: "E.3", texto: "Estado de filtro de combustible" },
      { codigo: "E.4", texto: "Estado de filtro de aceite" },
      { codigo: "E.5", texto: "Nivel de aceite de motor" },
      { codigo: "E.6", texto: "Estado y nivel del refrigerante" },
      { codigo: "E.7", texto: "Estado filtro de A/C cabina" },
    ],
  },
];

export default function HojaInspeccionBarredora() {
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
    contactoCliente: "",
    telefonoCliente: "",
    correoCliente: "",
    tecnicoResponsable: "",
    telefonoTecnico: "",
    correoTecnico: "",
    estadoEquipoDetalle: "",
    estadoEquipoPuntos: [],
    notaEquipo: "",
    marca: "",
    modelo: "",
    serie: "",
    anioModelo: "",
    vin: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    kilometraje: "",
    items: {},
  });

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

    const firmaTecnico = firmaTecnicoRef.current?.toDataURL();
    const firmaCliente = firmaClienteRef.current?.toDataURL();

    markInspectionCompleted("barredora", id, {
      ...formData,
      firmaTecnico,
      firmaCliente,
    });

    navigate("/inspeccion");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      <h1 className="font-bold text-lg text-center">
        HOJA DE INSPECCIÓN BARREDORA
      </h1>

      {secciones.map((sec) => (
        <section key={sec.id} className="border rounded p-4">
          <h2 className="font-semibold mb-2">{sec.titulo}</h2>
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th>Ítem</th>
                <th>Detalle</th>
                <th>Sí</th>
                <th>No</th>
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
                      onChange={() =>
                        handleItemChange(item.codigo, "estado", "SI")
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      onChange={() =>
                        handleItemChange(item.codigo, "estado", "NO")
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="w-full border px-1"
                      onChange={(e) =>
                        handleItemChange(
                          item.codigo,
                          "observacion",
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

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

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/inspeccion")}
          className="border px-4 py-2 rounded"
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Guardar y completar
        </button>
      </div>
    </form>
  );
}
