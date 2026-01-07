import logo from "@/astap-logo.jpg";

export default function ReportHeader({ data }) {
  return (
    <table className="pdf-table" style={{ marginBottom: 20 }}>
      <tbody>
        <tr>
          <td rowSpan="4" style={{ width: 120, textAlign: "center" }}>
            <img src={logo} alt="ASTAP" style={{ width: 80 }} />
          </td>
          <td colSpan="3" style={{ textAlign: "center", fontWeight: "bold" }}>
            INFORME TÉCNICO
          </td>
          <td>
            <strong>Fecha de versión:</strong> 01-01-26
          </td>
        </tr>

        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan="3">
            <input
              className="pdf-input"
              value={data.referenciaContrato}
              readOnly
            />
          </td>
          <td>
            <strong>Versión:</strong> 01
          </td>
        </tr>

        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan="3">
            <input
              className="pdf-input"
              value={data.descripcion}
              readOnly
            />
          </td>
          <td />
        </tr>

        <tr>
          <td className="pdf-label">COD. INF.</td>
          <td colSpan="3">
            <input
              className="pdf-input"
              value={data.codInf}
              readOnly
            />
          </td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}
