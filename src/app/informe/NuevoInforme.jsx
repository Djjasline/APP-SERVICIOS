import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import ReportHeader from "@/components/report/ReportHeader";

export default function NuevoInforme() {
  const navigate = useNavigate();

  /* ===========================
     ESTADO BASE
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
    fechaServicio: "",

    tecnicoNombre: "",
    tecnicoTelefono: "",
    tecnicoCorreo: "",

    actividades: [{ titulo: "", detalle: "", imagen: "" }],

    conclusiones: [""],
    recomendaciones: [""],

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
        current.data.firmas?.tecnico &&
          sigTecnico.current?.fromDataURL(current.data.firmas.tecnico);
        current.data.firmas?.cliente &&
          sigCliente.current?.fromDataURL(current.data.firmas.cliente);
      }, 0);
    }
  }, []);

  /* ===========================
     UPDATE GENÉRICO
  =========================== */
  const update = (path, value) => {
    setData(prev => {
      const copy = structuredClone(prev);
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
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
  const addActividad = () =>
    setData(p => ({
      ...p,
      actividades: [...p.actividades, { titulo: "", detalle: "", imagen: "" }],
    }));

  const removeActividad = (i) =>
    setData(p => ({
      ...p,
      actividades: p.actividades.filter((_, idx) => idx !== i),
    }));

  const addLinea = (campo) =>
    setData(p => ({ ...p, [campo]: [...p[campo], ""] }));

  /* ===========================
     GUARDAR
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

    localStorage.setItem("serviceReports", JSON.stringify([...stored, report]));
    localStorage.setItem("currentReport", JSON.stringify(report));
    navigate("/informe");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <ReportHeader data={data} onChange={update} />

        {/* DATOS CLIENTE */}
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

        {/* ACTIVIDADES */}
        <h3 className="font-bold text-sm">ACTIVIDADES REALIZADAS</h3>

        <table className="pdf-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>ÍTEM</th>
              <th>DESCRIPCIÓN</th>
              <th style={{ width: 260 }}>IMAGEN</th>
            </tr>
          </thead>
          <tbody>
            {data.actividades.map((a, i) => (
              <tr key={i}>
                <td className="text-center">{i + 1}</td>
                <td>
                  <input
                    className="pdf-input"
                    placeholder="Título de la actividad"
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
                <td className="text-center">
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
                  {data.actividades.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeActividad(i)}
                      className="text-red-600 text-xs mt-2"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={addActividad} className="border px-3 py-1 text-xs rounded">
          + Agregar actividad
        </button>

{/* ================= CONCLUSIONES Y RECOMENDACIONES ================= */}
<table className="pdf-table">
  <thead>
    <tr>
      <th colSpan={2}>CONCLUSIONES</th>
      <th colSpan={2}>RECOMENDACIONES</th>
    </tr>
  </thead>
  <tbody>
    {[0, 1, 2].map((i) => (
      <tr key={i}>
        {/* CONCLUSIONES */}
        <td style={{ width: "30px", textAlign: "center" }}>{i + 1}.</td>
        <td>
          <textarea
            className="pdf-textarea"
            value={data.conclusiones[i] || ""}
            onChange={(e) =>
              update(["conclusiones", i], e.target.value)
            }
          />
        </td>

        {/* RECOMENDACIONES */}
        <td style={{ width: "30px", textAlign: "center" }}>{i + 1}.</td>
        <td>
          <textarea
            className="pdf-textarea"
            value={data.recomendaciones[i] || ""}
            onChange={(e) =>
              update(["recomendaciones", i], e.target.value)
            }
          />
        </td>
      </tr>
    ))}
  </tbody>
</table>


        {/* DESCRIPCIÓN DEL EQUIPO */}
        <h3 className="font-bold text-sm">DESCRIPCIÓN DEL EQUIPO</h3>
        <table className="pdf-table">
          <tbody>
            {[
              ["NOTA", "nota"],
              ["MARCA", "marca"],
              ["MODELO", "modelo"],
              ["N° SERIE", "serie"],
              ["AÑO MODELO", "anio"],
              ["VIN / CHASIS", "vin"],
              ["PLACA", "placa"],
              ["HORAS MÓDULO", "horasModulo"],
              ["HORAS CHASIS", "horasChasis"],
              ["KILOMETRAJE", "kilometraje"],
            ].map(([l, k]) => (
              <tr key={k}>
                <td className="pdf-label">{l}</td>
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

        {/* FIRMAS */}
        <table className="pdf-table">
          <thead>
            <tr>
              <th>FIRMA TÉCNICO ASTAP</th>
              <th>FIRMA CLIENTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-center">
                <SignatureCanvas ref={sigTecnico} canvasProps={{ width: 300, height: 120 }} />
              </td>
              <td className="text-center">
                <SignatureCanvas ref={sigCliente} canvasProps={{ width: 300, height: 120 }} />
              </td>
            </tr>
          </tbody>
        </table>

        {/* BOTONES */}
        <div className="flex justify-between pt-6">
          <button onClick={() => navigate("/informe")} className="border px-6 py-2 rounded">
            Volver
          </button>
          <button onClick={saveReport} className="bg-blue-600 text-white px-6 py-2 rounded">
            Guardar informe
          </button>
        </div>
      </div>
    </div>
  );
}
