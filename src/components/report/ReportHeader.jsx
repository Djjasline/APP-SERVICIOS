import logo from "@/astap-logo.jpg";

export default function ReportHeader() {
  return (
    <table className="pdf-table report-header">
      <tbody>
        <tr>
          <td rowSpan={4} style={{ width: 120, textAlign: "center" }}>
            <img src={logo} alt="ASTAP" style={{ width: 80 }} />
          </td>
          <td colSpan={4} style={{ textAlign: "center", fontWeight: "bold" }}>
            INFORME TÉCNICO
          </td>
          <td colSpan={2}>
            <strong>Fecha de versión:</strong> 01-01-26<br />
            <strong>Versión:</strong> 01
          </td>
        </tr>

        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan={5}></td>
        </tr>

        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan={5}></td>
        </tr>

        <tr>
          <td className="pdf-label">COD. INF.</td>
          <td colSpan={5}></td>
        </tr>
      </tbody>
    </table>
  );
}
