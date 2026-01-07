export default function ReportHeader({ data, onChange }) {
  return (
    <table className="pdf-table">
      <tbody>
        <tr>
          <td rowSpan={4} style={{ width: 140, textAlign: "center" }}>
            <img
              src="/astap-logo.jpg"
              alt="ASTAP"
              style={{ width: 90, margin: "0 auto" }}
            />
          </td>

          <td colSpan={2} style={{ textAlign: "center", fontWeight: "bold" }}>
            REPORTE TÉCNICO DE SERVICIO
          </td>

          <td style={{ width: 180, fontSize: 11 }}>
            <div>Fecha de versión: 01-01-26</div>
            <div>Versión: 01</div>
          </td>
        </tr>

        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan={2}>
            <input
              className="pdf-input"
              value={data.referenciaContrato}
              onChange={(e) =>
                onChange(["referenciaContrato"], e.target.value)
              }
            />
          </td>
        </tr>

        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan={2}>
            <input
              className="pdf-input"
              value={data.descripcion}
              onChange={(e) =>
                onChange(["descripcion"], e.target.value)
              }
            />
          </td>
        </tr>

        <tr>
          <td className="pdf-label">COD. INF.</td>
          <td colSpan={2}>
            <input
              className="pdf-input"
              value={data.codInf}
              onChange={(e) =>
                onChange(["codInf"], e.target.value)
              }
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
