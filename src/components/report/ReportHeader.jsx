export default function ReportHeader({ data, onChange }) {
  const referenciaPlaceholder = "Ej: Contrato marco / cliente";
  const pedidoDemandaPlaceholder = "Ej: P-23-046 o D-45821";

  const codInfPlaceholder = data?.pedidoDemanda?.trim()
    ? `${data.pedidoDemanda.trim()}-001`
    : "Ej: P-23-046-001 o D-45821-001";

  return (
    <table className="pdf-table w-full">
      <tbody>
        <tr>
          {/* LOGO */}
          <td
            rowSpan={5}
            style={{
              width: 130,
              verticalAlign: "middle",
              textAlign: "center",
            }}
          >
            <div className="flex items-center justify-center h-[160px]">
              <img
                src="/astap-logo.jpg"
                alt="ASTAP"
                className="object-contain"
                style={{ maxHeight: "90px" }}
              />
            </div>
          </td>

          {/* TÍTULO */}
          <td
            colSpan={2}
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "16px",
              letterSpacing: "0.5px",
              verticalAlign: "middle",
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

        {/* REFERENCIA */}
        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.referenciaContrato || ""}
              onChange={(e) =>
                onChange(["referenciaContrato"], e.target.value)
              }
              placeholder={referenciaPlaceholder}
            />
          </td>
        </tr>

        {/* PEDIDO */}
        <tr>
          <td className="pdf-label">PEDIDO / DEMANDA</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.pedidoDemanda || ""}
              onChange={(e) =>
                onChange(["pedidoDemanda"], e.target.value)
              }
              placeholder={pedidoDemandaPlaceholder}
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

        {/* CÓDIGO */}
        <tr>
          <td className="pdf-label">CÓDIGO INFORME</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.codInf || ""}
              onChange={(e) =>
                onChange(["codInf"], e.target.value)
              }
              placeholder={codInfPlaceholder}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
