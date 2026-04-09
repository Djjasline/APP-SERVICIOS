export default function ReportHeader({ data, onChange }) {
  return (
    <table className="pdf-table w-full">
      <tbody>
        <tr>
          {/* LOGO */}
          <td
            rowSpan={4}
            style={{
              width: 120,
              verticalAlign: "middle",
              textAlign: "center",
            }}
          >
            <div className="flex items-center justify-center h-[110px]">
              <img
                src="/astap-logo.jpg"
                alt="ASTAP"
                className="object-contain"
                style={{ maxHeight: "70px" }}
              />
            </div>
          </td>

          {/* TÍTULO */}
          <td
            colSpan={2}
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            REPORTE TÉCNICO DE SERVICIO
          </td>

          {/* INFO DERECHA */}
          <td
            className="text-[10px] md:text-[11px]"
            style={{ width: 160 }}
          >
            <div>Fecha de versión: 01-01-26</div>
            <div>Versión: 01</div>
          </td>
        </tr>

        {/* PEDIDO / DEMANDA */}
        <tr>
          <td className="pdf-label">PEDIDO / DEMANDA</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.referenciaContrato || ""}
              onChange={(e) =>
                onChange(["referenciaContrato"], e.target.value)
              }
              placeholder="Ej: P-23-046 o D-45821"
            />
          </td>
        </tr>

        {/* DESCRIPCIÓN */}
        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.descripcion || ""}
              onChange={(e) =>
                onChange(["descripcion"], e.target.value)
              }
            />
          </td>
        </tr>

        {/* CÓDIGO INFORME */}
        <tr>
          <td className="pdf-label">CÓDIGO INFORME</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.codInf || ""}
              onChange={(e) =>
                onChange(["codInf"], e.target.value)
              }
              placeholder={
                data?.referenciaContrato?.trim()
                  ? `${data.referenciaContrato.trim()}-001`
                  : "Ej: P-23-046-001 o D-45821-001"
              }
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
