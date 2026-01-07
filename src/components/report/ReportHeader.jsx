import logo from "@/astap-logo.jpg";

export default function ReportHeader({ data, update }) {
  return (
    <table className="pdf-table">
      <tbody>
        <tr>
          <td rowSpan={4} style={{ width: 120, textAlign: "center" }}>
            <img src={logo} style={{ width: 80 }} />
          </td>
          <td colSpan={3} style={{ textAlign: "center", fontWeight: "bold" }}>
            INFORME TÉCNICO
          </td>
          <td colSpan={2}>
            Fecha de versión: 01-01-26<br />
            Versión: 01
          </td>
        </tr>

        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan={4}>
            <input
              className="pdf-input"
              value={data.referenciaContrato}
              onChange={(e) =>
                update(["referenciaContrato"], e.target.value)
              }
            />
          </td>
        </tr>

        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan={4}>
            <input
              className="pdf-input"
              value={data.descripcion}
              onChange={(e) =>
                update(["descripcion"], e.target.value)
              }
            />
          </td>
        </tr>

        <tr>
          <td className="pdf-label">COD. INF.</td>
          <td colSpan={4}>
            <input
              className="pdf-input"
              value={data.codInf}
              onChange={(e) =>
                update(["codInf"], e.target.value)
              }
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
