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
 <div className="flex items-center justify-center h-[100px]">
    <img
      src="/astap-logo.jpg"
      alt="logo"
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

        {/* REFERENCIA */}
        <tr>
          <td className="pdf-label">REFERENCIA DE CONTRATO</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.referenciaContrato}
              onChange={(e) =>
                onChange(["referenciaContrato"], e.target.value)
              }
            />
          </td>
        </tr>

        {/* DESCRIPCIÓN */}
        <tr>
          <td className="pdf-label">DESCRIPCIÓN</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
              value={data.descripcion}
              onChange={(e) =>
                onChange(["descripcion"], e.target.value)
              }
            />
          </td>
        </tr>

        {/* COD INF */}
        <tr>
          <td className="pdf-label">COD. INF.</td>
          <td colSpan={2}>
            <input
              className="pdf-input w-full"
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
