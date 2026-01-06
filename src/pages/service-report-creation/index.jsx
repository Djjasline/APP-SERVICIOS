import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

/* ===============================
   STORAGE KEY
================================ */
const STORAGE_KEY = "ASTAP_INFORME_GENERAL";

/* ===============================
   COMPONENTE PRINCIPAL
================================ */
export default function ServiceReportCreation() {
  /* ===============================
     STATE GENERAL
  ================================ */
  const [data, setData] = useState({
    header: {
      referenciaContrato: "",
      descripcion: "",
      codigoInf: "",
      fechaDD: "",
      fechaMM: "",
      fechaAA: "",
      ubicacion: "",
      tecnico: "",
      cliente: "",
      responsableCliente: "",
    },
    actividades: [
      { titulo: "", detalle: "", imagen: null },
    ],
    conclusiones: [""],
    recomendaciones: [""],
    responsables: {
      tecnico: "",
      cliente: "",
      fechaCierre: "",
    },
    firmas: {
      tecnico: null,
      cliente: null,
    },
    estado: "BORRADOR",
  });

  const sigTecnicoRef = useRef(null);
  const sigClienteRef = useRef(null);

  /* ===============================
     AUTO LOAD
  ================================ */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  /* ===============================
     AUTO SAVE
  ================================ */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  /* ===============================
     HELPERS
  ================================ */
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

  const addActividad = () =>
    update(["actividades"], [
      ...data.actividades,
      { titulo: "", detalle: "", imagen: null },
    ]);

  const addFila = (key) =>
    update([key], [...data[key], ""]);

  const removeFila = (key) => {
    if (data[key].length > 1) {
      update([key], data[key].slice(0, -1));
    }
  };

  const saveFirma = (tipo, ref) => {
    if (!ref.current) return;
    const img = ref.current.getTrimmedCanvas().toDataURL("image/png");
    update(["firmas", tipo], img);
  };

  const clearFirma = (tipo, ref) => {
    if (!ref.current) return;
    ref.current.clear();
    update(["firmas", tipo], null);
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="bg-white p-6">
      {/* ===============================
         ENCABEZADO
      ================================ */}
      <table className="pdf-table">
        <tbody>
          <tr>
            <td rowSpan={4} style={{ textAlign: "center", width: 140 }}>
              <img src="/astap-logo.jpg" style={{ width: 90 }} />
            </td>
            <td colSpan={6} style={{ textAlign: "center", fontWeight: "bold" }}>
              INFORME TÉCNICO
            </td>
            <td colSpan={2}>
              Fecha versión: 26-11-25<br />
              Versión: 01
            </td>
          </tr>

          {[
            ["REFERENCIA DE CONTRATO", "referenciaContrato"],
            ["DESCRIPCIÓN", "descripcion"],
            ["COD. INF.", "codigoInf"],
          ].map(([label, key]) => (
            <tr key={key}>
              <td className="pdf-label">{label}</td>
              <td colSpan={7}>
                <input
                  className="pdf-input"
                  value={data.header[key]}
                  onChange={(e) =>
                    update(["header", key], e.target.value)
                  }
                />
              </td>
            </tr>
          ))}

          <tr>
            <td className="pdf-label">FECHA EMISIÓN</td>
            {["fechaDD", "fechaMM", "fechaAA"].map((f) => (
              <td key={f}>
                <input
                  className="pdf-input"
                  value={data.header[f]}
                  onChange={(e) =>
                    update(["header", f], e.target.value)
                  }
                />
              </td>
            ))}
            <td className="pdf-label">UBICACIÓN</td>
            <td colSpan={2}>
              <input
                className="pdf-input"
                value={data.header.ubicacion}
                onChange={(e) =>
                  update(["header", "ubicacion"], e.target.value)
                }
              />
            </td>
            <td className="pdf-label">TÉCNICO</td>
            <td>
              <input
                className="pdf-input"
                value={data.header.tecnico}
                onChange={(e) =>
                  update(["header", "tecnico"], e.target.value)
                }
              />
            </td>
          </tr>

          <tr>
            <td colSpan={4}></td>
            <td className="pdf-label">CLIENTE</td>
            <td colSpan={2}>
              <input
                className="pdf-input"
                value={data.header.cliente}
                onChange={(e) =>
                  update(["header", "cliente"], e.target.value)
                }
              />
            </td>
            <td className="pdf-label">RESP. CLIENTE</td>
            <td>
              <input
                className="pdf-input"
                value={data.header.responsableCliente}
                onChange={(e) =>
                  update(["header", "responsableCliente"], e.target.value)
                }
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===============================
         ACTIVIDADES
      ================================ */}
      <table className="pdf-table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ÍTEM</th>
            <th>DESCRIPCIÓN DE ACTIVIDADES</th>
            <th>IMAGEN</th>
          </tr>
        </thead>
        <tbody>
          {data.actividades.map((a, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <input
                  className="pdf-input"
                  placeholder="TÍTULO"
                  value={a.titulo}
                  onChange={(e) =>
                    update(["actividades", i, "titulo"], e.target.value)
                  }
                />
                <textarea
                  className="pdf-textarea"
                  placeholder="DETALLE"
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
                  onChange={(e) => {
                    const r = new FileReader();
                    r.onload = () =>
                      update(["actividades", i, "imagen"], r.result);
                    r.readAsDataURL(e.target.files[0]);
                  }}
                />
                {a.imagen && (
                  <img
                    src={a.imagen}
                    style={{ maxWidth: 160, marginTop: 6 }}
                  />
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={3}>
              <button onClick={addActividad}>
                + AGREGAR ACTIVIDAD
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===============================
         CONCLUSIONES / RECOMENDACIONES
      ================================ */}
      <table className="pdf-table" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th colSpan={2}>CONCLUSIONES</th>
            <th colSpan={2}>RECOMENDACIONES</th>
          </tr>
        </thead>
        <tbody>
          {data.conclusiones.map((_, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                <textarea
                  className="pdf-textarea"
                  value={data.conclusiones[i]}
                  onChange={(e) =>
                    update(["conclusiones", i], e.target.value)
                  }
                />
              </td>
              <td>{i + 1}</td>
              <td>
                <textarea
                  className="pdf-textarea"
                  value={data.recomendaciones[i]}
                  onChange={(e) =>
                    update(["recomendaciones", i], e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={4}>
              <button onClick={() => addFila("conclusiones")}>+</button>
              <button onClick={() => removeFila("conclusiones")}>−</button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ===============================
         FIRMAS
      ================================ */}
      <table className="pdf-table" style={{ marginTop: 20 }}>
        <tbody>
          <tr>
            <th colSpan={2}>FIRMA TÉCNICO</th>
            <th colSpan={2}>FIRMA CLIENTE</th>
          </tr>
          <tr>
            <td colSpan={2}>
              <SignatureCanvas ref={sigTecnicoRef} />
              <button onClick={() => saveFirma("tecnico", sigTecnicoRef)}>
                Guardar
              </button>
              <button onClick={() => clearFirma("tecnico", sigTecnicoRef)}>
                Limpiar
              </button>
            </td>
            <td colSpan={2}>
              <SignatureCanvas ref={sigClienteRef} />
              <button onClick={() => saveFirma("cliente", sigClienteRef)}>
                Guardar
              </button>
              <button onClick={() => clearFirma("cliente", sigClienteRef)}>
                Limpiar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
