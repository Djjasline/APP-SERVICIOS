import { useState } from "react";

export default function ServiceReportCreation() {
  const [header, setHeader] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6">
      {/* =============================== */}
      {/* ENCABEZADO PDF - INFORME TÉCNICO */}
      {/* =============================== */}

      <table className="pdf-table">
        <tbody>
          {/* FILA 1 */}
          <tr>
            <td rowSpan={4} style={{ width: "140px", textAlign: "center" }}>
              <img
                src="/astap-logo.jpg"
                alt="ASTAP"
                style={{ width: "90px", margin: "0 auto" }}
              />
            </td>

            <td colSpan={6} style={{ textAlign: "center", fontWeight: "bold" }}>
              INFORME TÉCNICO
            </td>

            <td colSpan={2}>
              <div>
                <strong>Fecha de versión:</strong> 26-11-25
              </div>
              <div>
                <strong>Versión:</strong> 01
              </div>
            </td>
          </tr>

          {/* FILA 2 */}
          <tr>
            <td className="pdf-label">REFERENCIA DE CONTRATO:</td>
            <td colSpan={7}>
              <input
                className="pdf-input"
                name="referenciaContrato"
                value={header.referenciaContrato}
                onChange={handleChange}
              />
            </td>
          </tr>

          {/* FILA 3 */}
          <tr>
            <td className="pdf-label">DESCRIPCIÓN:</td>
            <td colSpan={7}>
              <input
                className="pdf-input"
                name="descripcion"
                value={header.descripcion}
                onChange={handleChange}
              />
            </td>
          </tr>

          {/* FILA 4 */}
          <tr>
            <td className="pdf-label">COD. INF.:</td>
            <td colSpan={7}>
              <input
                className="pdf-input"
                name="codigoInf"
                value={header.codigoInf}
                onChange={handleChange}
              />
            </td>
          </tr>

          {/* FILA 5 */}
          <tr>
            <td className="pdf-label">FECHA DE EMISIÓN:</td>
            <td style={{ width: "40px" }}>
              <input
                className="pdf-input"
                name="fechaDD"
                value={header.fechaDD}
                onChange={handleChange}
              />
            </td>
            <td style={{ width: "40px" }}>
              <input
                className="pdf-input"
                name="fechaMM"
                value={header.fechaMM}
                onChange={handleChange}
              />
            </td>
            <td style={{ width: "40px" }}>
              <input
                className="pdf-input"
                name="fechaAA"
                value={header.fechaAA}
                onChange={handleChange}
              />
            </td>

            <td className="pdf-label">UBICACIÓN:</td>
            <td colSpan={2}>
              <input
                className="pdf-input"
                name="ubicacion"
                value={header.ubicacion}
                onChange={handleChange}
              />
            </td>

            <td className="pdf-label">TÉCNICO RESPONSABLE:</td>
            <td>
              <input
                className="pdf-input"
                name="tecnico"
                value={header.tecnico}
                onChange={handleChange}
              />
            </td>
          </tr>

          {/* FILA 6 */}
          <tr>
            <td colSpan={4}></td>

            <td className="pdf-label">CLIENTE:</td>
            <td colSpan={2}>
              <input
                className="pdf-input"
                name="cliente"
                value={header.cliente}
                onChange={handleChange}
              />
            </td>

            <td className="pdf-label">RESPONSABLE CLIENTE:</td>
            <td>
              <input
                className="pdf-input"
                name="responsableCliente"
                value={header.responsableCliente}
                onChange={handleChange}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* =============================== */
/* PASO 2 – DESCRIPCIÓN ACTIVIDADES */
/* =============================== */

const [activities, setActivities] = useState([
  {
    titulo: "",
    detalle: "",
    imagen: null,
    imagenPreview: null,
  },
]);

const handleActivityChange = (index, field, value) => {
  const updated = [...activities];
  updated[index][field] = value;
  setActivities(updated);
};

const handleImageChange = (index, file) => {
  const reader = new FileReader();
  reader.onload = () => {
    const updated = [...activities];
    updated[index].imagen = file;
    updated[index].imagenPreview = reader.result;
    setActivities(updated);
  };
  reader.readAsDataURL(file);
};

const addActivity = () => {
  setActivities([
    ...activities,
    { titulo: "", detalle: "", imagen: null, imagenPreview: null },
  ]);
};

/* =============================== */
/* RENDER */
/* =============================== */

<table className="pdf-table" style={{ marginTop: 20 }}>
  <thead>
    <tr>
      <th style={{ width: "60px" }}>ÍTEM</th>
      <th>DESCRIPCIÓN DE ACTIVIDADES</th>
      <th style={{ width: "200px" }}>IMAGEN</th>
    </tr>
  </thead>

  <tbody>
    {activities.map((act, index) => (
      <tr key={index}>
        {/* ÍTEM */}
        <td style={{ textAlign: "center", fontWeight: "bold" }}>
          {index + 1}
        </td>

        {/* DESCRIPCIÓN */}
        <td>
          <input
            className="pdf-input"
            placeholder="TÍTULO DE LA ACTIVIDAD"
            value={act.titulo}
            onChange={(e) =>
              handleActivityChange(index, "titulo", e.target.value)
            }
          />

          <textarea
            className="pdf-textarea"
            placeholder="DETALLE DE LA ACTIVIDAD"
            value={act.detalle}
            onChange={(e) =>
              handleActivityChange(index, "detalle", e.target.value)
            }
          />
        </td>

        {/* IMAGEN */}
        <td style={{ textAlign: "center" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImageChange(index, e.target.files[0])
            }
          />

          {act.imagenPreview && (
            <img
              src={act.imagenPreview}
              alt="Actividad"
              style={{
                marginTop: 8,
                maxWidth: "180px",
                maxHeight: "120px",
                border: "1px solid #000",
              }}
            />
          )}
        </td>
      </tr>
    ))}

    {/* BOTÓN AGREGAR */}
    <tr>
      <td colSpan={3} style={{ textAlign: "left" }}>
        <button
          type="button"
          onClick={addActivity}
          style={{
            padding: "4px 10px",
            border: "1px solid #000",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          + AGREGAR ACTIVIDAD
        </button>
      </td>
    </tr>
  </tbody>
</table>

/* =============================== */
/* PASO 3 – CONCLUSIONES Y RECOMENDACIONES */
/* =============================== */

const [conclusiones, setConclusiones] = useState([""]);
const [recomendaciones, setRecomendaciones] = useState([""]);

const updateList = (setter, list, index, value) => {
  const updated = [...list];
  updated[index] = value;
  setter(updated);
};

const addRow = (setter, list) => {
  setter([...list, ""]);
};

const removeRow = (setter, list) => {
  if (list.length > 1) {
    setter(list.slice(0, -1));
  }
};

/* =============================== */
/* RENDER */
/* =============================== */

<table className="pdf-table" style={{ marginTop: 20 }}>
  <thead>
    <tr>
      <th colSpan={2}>CONCLUSIONES</th>
      <th colSpan={2}>RECOMENDACIONES</th>
    </tr>
  </thead>

  <tbody>
    {Array.from({
      length: Math.max(conclusiones.length, recomendaciones.length),
    }).map((_, index) => (
      <tr key={index}>
        {/* Nº CONCLUSIÓN */}
        <td style={{ width: "30px", textAlign: "center" }}>
          {index + 1}
        </td>

        {/* TEXTO CONCLUSIÓN */}
        <td>
          <textarea
            className="pdf-textarea"
            value={conclusiones[index] || ""}
            onChange={(e) =>
              updateList(
                setConclusiones,
                conclusiones,
                index,
                e.target.value
              )
            }
          />
        </td>

        {/* Nº RECOMENDACIÓN */}
        <td style={{ width: "30px", textAlign: "center" }}>
          {index + 1}
        </td>

        {/* TEXTO RECOMENDACIÓN */}
        <td>
          <textarea
            className="pdf-textarea"
            value={recomendaciones[index] || ""}
            onChange={(e) =>
              updateList(
                setRecomendaciones,
                recomendaciones,
                index,
                e.target.value
              )
            }
          />
        </td>
      </tr>
    ))}

    {/* CONTROLES */}
    <tr>
      <td colSpan={4}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              addRow(setConclusiones, conclusiones);
              addRow(setRecomendaciones, recomendaciones);
            }}
            style={{
              padding: "4px 10px",
              border: "1px solid #000",
              fontSize: "11px",
            }}
          >
            + AGREGAR FILA
          </button>

          <button
            type="button"
            onClick={() => {
              removeRow(setConclusiones, conclusiones);
              removeRow(setRecomendaciones, recomendaciones);
            }}
            style={{
              padding: "4px 10px",
              border: "1px solid #000",
              fontSize: "11px",
            }}
          >
            − QUITAR FILA
          </button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

/* =============================== */
/* PASO 4 – FIRMAS Y CIERRE */
/* =============================== */

<table className="pdf-table" style={{ marginTop: 20 }}>
  <tbody>
    {/* RESPONSABLES */}
    <tr>
      <td className="pdf-label">TÉCNICO RESPONSABLE</td>
      <td colSpan={3}>
        <input
          className="pdf-input"
          name="tecnico"
          value={responsables.tecnico}
          onChange={handleResponsableChange}
        />
      </td>
    </tr>

    <tr>
      <td className="pdf-label">RESPONSABLE CLIENTE</td>
      <td colSpan={3}>
        <input
          className="pdf-input"
          name="cliente"
          value={responsables.cliente}
          onChange={handleResponsableChange}
        />
      </td>
    </tr>

    <tr>
      <td className="pdf-label">FECHA DE CIERRE</td>
      <td colSpan={3}>
        <input
          type="date"
          className="pdf-input"
          name="fechaCierre"
          value={responsables.fechaCierre}
          onChange={handleResponsableChange}
        />
      </td>
    </tr>

    {/* FIRMAS */}
    <tr>
      <th colSpan={2}>FIRMA TÉCNICO</th>
      <th colSpan={2}>FIRMA CLIENTE</th>
    </tr>

    <tr>
      <td colSpan={2} style={{ padding: 6 }}>
        <SignatureCanvas
          ref={sigTecnicoRef}
          penColor="black"
          canvasProps={{
            width: 300,
            height: 120,
            className: "border",
          }}
        />
        <button
          type="button"
          onClick={() => clearSignature("tecnico", sigTecnicoRef)}
          style={{
            marginTop: 4,
            fontSize: 11,
            border: "1px solid #000",
            padding: "2px 6px",
          }}
        >
          Limpiar
        </button>
      </td>

      <td colSpan={2} style={{ padding: 6 }}>
        <SignatureCanvas
          ref={sigClienteRef}
          penColor="black"
          canvasProps={{
            width: 300,
            height: 120,
            className: "border",
          }}
        />
        <button
          type="button"
          onClick={() => clearSignature("cliente", sigClienteRef)}
          style={{
            marginTop: 4,
            fontSize: 11,
            border: "1px solid #000",
            padding: "2px 6px",
          }}
        >
          Limpiar
        </button>
      </td>
    </tr>
  </tbody>
</table>

