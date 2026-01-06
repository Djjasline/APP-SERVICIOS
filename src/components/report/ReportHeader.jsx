import logo from "@/astap-logo.jpg";

export default function ReportHeader({ data, onChange }) {
  return (
    <table className="pdf-table">
      <tbody>
        {/* FILA 1 */}
        <tr>
          <td rowSpan={4} style={{ width: 120, textAlign: "center" }}>
            <img src={logo} alt="ASTAP" style={{ width: 80 }} />
          </td>

          <td colSpan={4} style={{ textAlign: "center", fontWeight: "bold" }}>
            INFORME TÉCNICO
          </td>

          <td colSpan={2}>
            <strong>FECHA DE VERSIÓN:</strong> 26-11-25
          </td>
        </tr>

        {/* FILA 2 */}
        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO:</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={data.referenciaContrato || ""}
              onChange={(e) =>
                onChange(["referenciaContrato"], e.target.value)
              }
            />
          </td>

          <td colSpan={2}>
            <strong>VERSIÓN:</strong> 01
          </td>
        </tr>

        {/* FILA 3 */}
        <tr>
          <td className="pdf-label">DESCRIPCIÓN:</td>
          <td colSpan={3}>
            <input
              className="pdf-input"
              value={data.descripcion || ""}
              onChange={(e) =>
                onChange(["descripcion"], e.target.value)
              }
            />
          </td>

          <td colSpan={2}>
            <strong>COD. INF.:</strong> AST-SRV-001
          </td>
        </tr>

        {/* FILA 4 */}
        <tr>
          <td className="pdf-label">FECHA DE EMISIÓN:</td>
          <td style={{ width: 40 }}>
            <input
              className="pdf-input"
              placeholder="DD"
              value={data.fechaDD || ""}
              onChange={(e) => onChange(["fechaDD"], e.target.value)}
            />
          </td>
          <td style={{ width: 40 }}>
            <input
              className="pdf-input"
              placeholder="MM"
              value={data.fechaMM || ""}
              onChange={(e) => onChange(["fechaMM"], e.target.value)}
            />
          </td>
          <td style={{ width: 40 }}>
            <input
              className="pdf-input"
              placeholder="AA"
              value={data.fechaAA || ""}
              onChange={(e) => onChange(["fechaAA"], e.target.value)}
            />
          </td>

          <td className="pdf-label">UBICACIÓN:</td>
          <td colSpan={2}>
            <input
              className="pdf-input"
              value={data.ubicacion || ""}
              onChange={(e) =>
                onChange(["ubicacion"], e.target.value)
              }
            />
          </td>
        </tr>

        {/* FILA 5 */}
        <tr>
          <td colSpan={4}></td>

          <td className="pdf-label">TÉCNICO RESPONSABLE:</td>
          <td>
            <input
              className="pdf-input"
              value={data.tecnico || ""}
              onChange={(e) =>
                onChange(["tecnico"], e.target.value)
              }
            />
          </td>
        </tr>

        {/* FILA 6 */}
        <tr>
          <td colSpan={4}></td>

          <td className="pdf-label">CLIENTE:</td>
          <td>
            <input
              className="pdf-input"
              value={data.cliente || ""}
              onChange={(e) =>
                onChange(["cliente"], e.target.value)
              }
            />
          </td>
        </tr>

        {/* FILA 7 */}
        <tr>
          <td colSpan={4}></td>

          <td className="pdf-label">RESPONSABLE CLIENTE:</td>
          <td>
            <input
              className="pdf-input"
              value={data.responsableCliente || ""}
              onChange={(e) =>
                onChange(["responsableCliente"], e.target.value)
              }
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
