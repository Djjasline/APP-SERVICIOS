import logo from "@/astap-logo.jpg";

export default function ReportHeader({ data }) {
  // 🔐 Protección total contra undefined
  const safe = data || {};

  return (
    <table className="pdf-table">
      <tbody>
        <tr>
          <td rowSpan={3} style={{ width: 120, textAlign: "center" }}>
            <img src={logo} alt="ASTAP" style={{ width: 80 }} />
          </td>
          <td colSpan={3} style={{ textAlign: "center", fontWeight: "bold" }}>
            INFORME TÉCNICO
          </td>
          <td>
            Fecha de versión: 01-01-26<br />
            Versión: 01
          </td>
        </tr>

        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={safe.referenciaContrato || ""}
              readOnly
            />
          </td>
          <td rowSpan={3} />
        </tr>

        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={safe.descripcionContrato || ""}
              readOnly
            />
          </td>
        </tr>

        <tr>
          <td className="pdf-label">COD. INF.</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={safe.codigoInf || ""}
              readOnly
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
