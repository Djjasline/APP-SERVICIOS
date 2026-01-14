import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

export default function NuevoInforme() {
  const navigate = useNavigate();

  /* ===========================
     ESTADO BASE DEL INFORME
  =========================== */
  const emptyReport = {
    referenciaContrato: "",
    descripcion: "",
    codInf: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",
    tecnicoNombre: "",
    tecnicoTelefono: "",
    tecnicoCorreo: "",
    fechaServicio: "",

    actividades: [
      { titulo: "", detalle: "", imagen: "" },
    ],

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
      kilometraje: "",
    },

    firmas: {
      tecnico: "",
      cliente: "",
    },
  };

  const [data, setData] = useState(emptyReport);

  const sigTecnico = useRef(null);
  const sigCliente = useRef(null);

  /* ===========================
     CARGA DESDE BORRADOR
  =========================== */
  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentReport"));
    if (current?.data) {
      setData(current.data);
    }
  }, []);

  /* ===========================
     UPDATE GENÉRICO
  =========================== */
  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  /* ===========================
     IMAGEN → BASE64
  =========================== */
  const fileToBase64 = (file, cb) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

  /* ===========================
     GUARDAR INFORME
  =========================== */
  const saveReport = () => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];

    const report = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      data: {
        ...data,
        firmas: {
          tecnico: sigTecnico.current?.isEmpty()
            ? ""
            : sigTecnico.current.toDataURL(),
          cliente: sigCliente.current?.isEmpty()
            ? ""
            : sigCliente.current.toDataURL(),
        },
      },
    };

    localStorage.setItem(
      "serviceReports",
      JSON.stringify([...stored, report])
    );
    localStorage.setItem("currentReport", JSON.stringify(report));

    navigate("/informe");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        {/* ================= ENCABEZADO (IGUAL A INSPECCIÓN) ================= */}
        <section className="border rounded overflow-hidden">
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr className="border-b">
                <td rowSpan={4} className="w-32 border-r p-3 text-center">
                  <img src="/astap-logo.jpg" className="mx-auto max-h-20" />
                </td>
                <td colSpan={2} className="border-r text-center font-bold">
                  INFORME TÉCNICO DE SERVICIO
                </td>
                <td className="p-2">
                  <div>Fecha versión: <strong>01-01-26</strong></div>
                  <div>Versión: <strong>01</strong></div>
                </td>
              </tr>

              {[
                ["REFERENCIA DE CONTRATO", "referenciaContrato"],
                ["DESCRIPCIÓN", "descripcion"],
                ["CÓD. INF.", "codInf"],
              ].map(([label, key]) => (
                <tr key={key} className="border-b">
                  <td className="border-r p-2 font-semibold">{label}</td>
                  <td colSpan={2} className="p-2">
                    <input
                      className="w-full border p-1"
                      value={data[key]}
                      onChange={(e) => update([key], e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ================= DATOS DEL CLIENTE (IGUAL A INSPECCIÓN) ================= */}
        <section className="grid md:grid-cols-2 gap-3 border rounded p-4 text-sm">
          <input
            className="border p-2"
            placeholder="Cliente"
            value={data.cliente}
            onChange={(e) => update(["cliente"], e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Dirección"
            value={data.direccion}
            onChange={(e) => update(["direccion"], e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Contacto"
            value={data.contacto}
            onChange={(e) => update(["contacto"], e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Teléfono"
            value={data.telefono}
            onChange={(e) => update(["telefono"], e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Correo"
            value={data.correo}
            onChange={(e) => update(["correo"], e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Técnico responsable"
            value={data.tecnicoNombre}
            onChange={(e) => update(["tecnicoNombre"], e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Teléfono técnico"
            value={data.tecnicoTelefono}
            onChange={(e) => update(["tecnicoTelefono"], e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Correo técnico"
            value={data.tecnicoCorreo}
            onChange={(e) => update(["tecnicoCorreo"], e.target.value)}
          />
          <input
            type="date"
            className="border p-2 md:col-span-2"
            value={data.fechaServicio}
            onChange={(e) => update(["fechaServicio"], e.target.value)}
          />
        </section>

        {/* ================= BOTONES ================= */}
        <div className="flex justify-between pt-6">
          <button
            onClick={() => navigate("/informe")}
            className="border px-6 py-2 rounded"
          >
            Volver
          </button>

          <button
            onClick={saveReport}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Guardar informe
          </button>
        </div>

      </div>
    </div>
  );
}
