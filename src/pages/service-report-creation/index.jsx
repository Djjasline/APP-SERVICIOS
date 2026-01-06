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
