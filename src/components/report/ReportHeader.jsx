import logo from "@/astap-logo.jpg";

export default function ReportHeader({ data = {} }) {
  return (
    <table className="pdf-table" style={{ marginBottom: 20 }}>
      <tbody>
        {/* FILA 1 */}
        <tr>
          {/* LOGO */}
          <td
            rowSpan={4}
            style={{
              width: 130,
              textAlign: "center",
              verticalAlign: "middle",
            }}
          >
            <img
              src={logo}
              alt="ASTAP"
              style={{ width: 90, display: "block", margin: "0 auto" }}
            />
          </td>

          {/* TITULO */}
          <td
            colSpan={3}
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            REPORTE TÉCNICO DE SERVICIO
          </td>

          {/* FECHA / VERSION */}
          <td
            style={{
              width: 180,
              fontSize: 10,
              textAlign: "left",
              verticalAlign: "top",
            }}
          >
            Fecha de versión: 01-01-26
            <br />
            Versión: 01
          </td>
        </tr>

        {/* FILA 2 */}
        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={data.referenciaContrato || ""}
            />
          </td>
          <td />
        </tr>

        {/* FILA 3 */}
        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={data.descripcionContrato || ""}
            />
          </td>
          <td />
        </tr>

        {/* FILA 4 */}
        <tr>
          <td className="pdf-label">COD. INF.</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={data.codigoInf || ""}
            />
          </td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}
