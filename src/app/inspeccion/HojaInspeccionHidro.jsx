import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  markInspectionCompleted,
  getInspectionById,
} from "@/utils/inspectionStorage";

/* =============================
   LISTADOS SEGÚN FORMATO PDF
============================= */
const pruebasPrevias = [
  ["1.1", "Prueba de encendido general del equipo"],
  ["1.2", "Verificación de funcionamiento de controles principales"],
  ["1.3", "Revisión de alarmas o mensajes de fallo"],
];

const recambios = [
  ["2.1", "Tapón de expansión PN 45731-30"],
  ["2.2", "Empaque exterior tapa filtro Y 3\" PN 41272-30"],
  ["2.3", "Empaque interior tapa filtro Y 3\" PN 41271-30"],
  ["2.4", "Empaque filtro agua Y 2\" PN 46137-30"],
  ["2.5", "Malla filtro agua 2\" PN 45803-30"],
  ["2.6", "O-ring válvula check 2\" PN 29674-30"],
  ["2.7", "O-ring válvula check 3\" PN 29640-30"],
];

const serviciosModulo = [
  ["3.1", "Sistema de diálisis para limpieza del sistema hidráulico"],
  ["3.2", "Limpieza de bomba Rodder y cambio de elementos"],
  ["3.3", "Inspección válvula de paso de agua a bomba Rodder"],
];

export default function HojaInspeccionHidro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const firmaTecnicoRef = useRef(null);
  const firmaClienteRef = useRef(null);

  const baseState = {
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaServicio: "",
    cliente: "",
    ubicacion: "",
    tecnico: "",
    responsableCliente: "",
    observaciones: "",
    estadoEquipoPuntos: [],
    items: {},
    marca: "",
    modelo: "",
    serie: "",
    anioModelo: "",
    vin: "",
    placa: "",
    horasModulo: "",
    horasChasis: "",
    kilometraje: "",
  };

  const [formData, setFormData] = useState(baseState);

  useEffect(() => {
    if (!id || id === "0") return;
    const stored = getInspectionById("hidro", id);
    if (stored?.data) {
      setFormData({
        ...baseState,
        ...stored.data,
        items: stored.data.items || {},
        estadoEquipoPuntos: stored.data.estadoEquipoPuntos || [],
      });
    }
  }, [id]);

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
    markInspectionCompleted("hidro", id, {
      ...formData,
      firmas: {
        tecnico: firmaTecnicoRef.current?.toDataURL() || "",
        cliente: firmaClienteRef.current?.toDataURL() || "",
      },
    });
    navigate("/inspeccion");
  };

  const renderTabla = (titulo, data, conCantidad = false) => (
    <section className="border rounded p-4">
      <h2 className="font-semibold mb-2">{titulo}</h2>
      <table className="w-full text-xs border">
        <thead className="bg-gray-100">
          <tr>
            <th>Ítem</th>
            <th>Detalle</th>
            {conCantidad && <th>Cantidad</th>}
            <th>SI</th>
            <th>NO</th>
            <th>Observación</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([codigo, texto]) => (
            <tr key={codigo}>
              <td>{codigo}</td>
              <td>{texto}</td>
              {conCantidad && (
                <td>
                  <input
                    className="w-16 border"
                    onChange={(e) =>
                      handleItemChange(codigo, "cantidad", e.target.value)
                    }
                  />
                </td>
              )}
              <td>
                <input
                  type="radio"
                  name={`${codigo}-estado`}
                  onChange={() =>
                    handleItemChange(codigo, "estado", "SI")
                  }
                />
              </td>
              <td>
                <input
                  type="radio"
                  name={`${codigo}-estado`}
                  onChange={() =>
                    handleItemChange(codigo, "estado", "NO")
                  }
                />
              </td>
              <td>
                <input
                  className="w-full border"
                  onChange={(e) =>
                    handleItemChange(
                      codigo,
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
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto my-6 bg-white shadow rounded-xl p-6 space-y-6 text-sm"
    >
      {/* ENCABEZADO */}
      <section className="border rounded p-4 grid grid-cols-2 gap-2">
        <input name="referenciaContrato" placeholder="Referencia contrato" value={formData.referenciaContrato} onChange={handleChange} className="border p-1" />
        <input name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} className="border p-1" />
        <input name="codInf" placeholder="Cod. INF" value={formData.codInf} onChange={handleChange} className="border p-1" />
        <input type="date" name="fechaServicio" value={formData.fechaServicio} onChange={handleChange} className="border p-1" />
        <input name="cliente" placeholder="Cliente" value={formData.cliente} onChange={handleChange} className="border p-1" />
        <input name="ubicacion" placeholder="Ubicación" value={formData.ubicacion} onChange={handleChange} className="border p-1" />
        <input name="tecnico" placeholder="Técnico ASTAP" value={formData.tecnico} onChange={handleChange} className="border p-1" />
        <input name="responsableCliente" placeholder="Responsable cliente" value={formData.responsableCliente} onChange={handleChange} className="border p-1" />
      </section>

      {/* ESTADO DEL EQUIPO */}
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Estado del equipo</h2>
        <img src="/estado-equipo.png" className="w-full border" />
        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          className="w-full border mt-2 p-2"
        />
      </section>

      {renderTabla("1. Pruebas de encendido", pruebasPrevias)}
      {renderTabla("2. Recambio de elementos", recambios, true)}
      {renderTabla("3. Servicios módulo hidrosuccionador", serviciosModulo)}

      {/* DESCRIPCIÓN EQUIPO */}
      <section className="border rounded p-4 grid grid-cols-2 gap-2">
        <input name="marca" placeholder="Marca" value={formData.marca} onChange={handleChange} className="border p-1" />
        <input name="modelo" placeholder="Modelo" value={formData.modelo} onChange={handleChange} className="border p-1" />
        <input name="serie" placeholder="Serie" value={formData.serie} onChange={handleChange} className="border p-1" />
        <input name="anioModelo" placeholder="Año modelo" value={formData.anioModelo} onChange={handleChange} className="border p-1" />
        <input name="vin" placeholder="VIN / Chasis" value={formData.vin} onChange={handleChange} className="border p-1" />
        <input name="placa" placeholder="Placa" value={formData.placa} onChange={handleChange} className="border p-1" />
        <input name="horasModulo" placeholder="Horas módulo" value={formData.horasModulo} onChange={handleChange} className="border p-1" />
        <input name="horasChasis" placeholder="Horas chasis" value={formData.horasChasis} onChange={handleChange} className="border p-1" />
        <input name="kilometraje" placeholder="Kilometraje" value={formData.kilometraje} onChange={handleChange} className="border p-1 col-span-2" />
      </section>

      {/* FIRMAS */}
      <section className="border rounded p-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="font-semibold">Firma Técnico</p>
          <SignatureCanvas ref={firmaTecnicoRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
        <div>
          <p className="font-semibold">Firma Cliente</p>
          <SignatureCanvas ref={firmaClienteRef} canvasProps={{ className: "border w-full h-32" }} />
        </div>
      </section>

      {/* BOTONES */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => navigate("/inspeccion")} className="border px-4 py-2 rounded">
          Volver
        </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Guardar informe
        </button>
      </div>
    </form>
  );
}
