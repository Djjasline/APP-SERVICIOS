import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";

export default function NuevoInforme() {
  const navigate = useNavigate();

  /* ===========================
     ESTADO BASE
  =========================== */
  const emptyReport = {
    referenciaContrato: "",
    descripcion: "",
    codInf: "",
    fechaServicio: "",

    cliente: "",
    direccion: "",
    contacto: "",
    telefono: "",
    correo: "",

    tecnicoNombre: "",
    tecnicoTelefono: "",
    tecnicoCorreo: "",

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
     CARGAR BORRADOR
  =========================== */
  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentReport"));
    if (current?.data) {
      setData(current.data);
      setTimeout(() => {
        if (current.data.firmas?.tecnico) {
          sigTecnico.current?.fromDataURL(current.data.firmas.tecnico);
        }
        if (current.data.firmas?.cliente) {
          sigCliente.current?.fromDataURL(current.data.firmas.cliente);
        }
      }, 0);
    }
  }, []);

  /* ===========================
     UPDATE GENÉRICO
  =========================== */
  const update = (path, value) => {
    setData((prev) => {
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
     ACTIVIDADES
  =========================== */
  const addActividad = () => {
    setData((p) => ({
      ...p,
      actividades: [...p.actividades, { titulo: "", detalle: "", imagen: "" }],
    }));
  };

  const removeActividad = (index) => {
    setData((p) => ({
      ...p,
      actividades: p.actividades.filter((_, i) => i !== index),
    }));
  };

  /* ===========================
     GUARDAR INFORME
  =========================== */
  const saveReport = () => {
    const stored = JSON.parse(localStorage.getItem("serviceReports")) || [];

    const firmas = {
      tecnico: sigTecnico.current?.isEmpty()
        ? ""
        : sigTecnico.current.toDataURL(),
      cliente: sigCliente.current?.isEmpty()
        ? ""
        : sigCliente.current.toDataURL(),
    };

    const estado =
      firmas.tecnico && firmas.cliente ? "completado" : "borrador";

    const report = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      estado,
      data: { ...data, firmas },
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

        {/* ================= ENCABEZADO ================= */}
        <table className="pdf-table">
          <tbody>
            <tr>
              <td rowSpan={3} style={{ width: 120, textAlign: "center" }}>
                <img src="/astap-logo.jpg" style={{ maxHeight: 60 }} />
              </td>
              <td colSpan={2} className="pdf-label">REPORTE TÉCNICO DE SERVICIO</td>
              <td>
                Fecha versión: 01-01-25<br />
                Versión: 01
              </td>
            </tr>
            {[
              ["REFERENCIA DE CONTRATO", "referenciaContrato"],
              ["DESCRIPCIÓN", "descripcion"],
              ["COD. INF.", "codInf"],
            ].map(([l, k]) => (
              <tr key={k}>
                <td className="pdf-label">{l}</td>
                <td colSpan={2}>
                  <input
                    className="pdf-input"
                    value={data[k]}
                    onChange={(e) => update([k], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= DATOS CLIENTE ================= */}
        <table className="pdf-table">
          <tbody>
            {[
              ["CLIENTE", "cliente"],
              ["DIRECCIÓN", "direccion"],
              ["CONTACTO", "contacto"],
              ["TELÉFONO", "telefono"],
              ["CORREO", "correo"],
              ["TÉCNICO RESPONSABLE", "tecnicoNombre"],
              ["TELÉFONO TÉCNICO", "tecnicoTelefono"],
              ["CORREO TÉCNICO", "tecnicoCorreo"],
              ["FECHA DE SERVICIO", "fechaServicio"],
            ].map(([l, k]) => (
              <tr key={k}>
                <td className="pdf-label">{l}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data[k]}
                    onChange={(e) => update([k], e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= ACTIVIDADES ================= */}
        <h3 className="font-bold">ACTIVIDADES REALIZADAS</h3>
        <table className="pdf-table">
          <thead>
            <tr>
              <th>ÍTEM</th>
              <th>DESCRIPCIÓN</th>
              <th>IMAGEN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input
                    className="pdf-input"
                    placeholder="Título"
                    value={a.titulo}
                    onChange={(e) =>
                      update(["actividades", i, "titulo"], e.target.value)
                    }
                  />
                  <textarea
                    className="pdf-textarea"
                    placeholder="Detalle"
                    value={a.detalle}
                    onChange={(e) =>
                      update(["actividades", i, "detalle"], e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      fileToBase64(e.target.files[0], (b64) =>
                        update(["actividades", i, "imagen"], b64)
                      )
                    }
                  />
                  {a.imagen && (
                    <img src={a.imagen} style={{ maxWidth: 120, marginTop: 6 }} />
                  )}
                </td>
                <td>
                  {data.actividades.length > 1 && (
                    <button onClick={() => removeActividad(i)}>Eliminar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addActividad}>+ Agregar actividad</button>

        {/* ================= DESCRIPCIÓN EQUIPO ================= */}
        <h3 className="font-bold">DESCRIPCIÓN DEL EQUIPO</h3>
        <table className="pdf-table">
          <tbody>
            {Object.entries(data.equipo).map(([k]) => (
              <tr key={k}>
                <td className="pdf-label">{k.toUpperCase()}</td>
                <td>
                  <input
                    className="pdf-input"
                    value={data.equipo[k]}
                    onChange={(e) =>
                      update(["equipo", k], e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= FIRMAS ================= */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <SignatureCanvas ref={sigTecnico} canvasProps={{ height: 150 }} />
              </td>
              <td>
                <SignatureCanvas ref={sigCliente} canvasProps={{ height: 150 }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================= BOTONES ================= */}
        <div className="flex justify-between">
          <button onClick={() => navigate("/informe")}>Volver</button>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded"
            onClick={saveReport}
          >
            Guardar informe
          </button>
        </div>
      </div>
    </div>
  );
}
