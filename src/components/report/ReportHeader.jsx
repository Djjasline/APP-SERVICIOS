import ReportCodeInput from "@/components/ReportCodeInput";
import AutoResizeInput from "@/components/AutoResizeInput";

export default function ReportHeader({ data, onChange }) {
  const reportDescription =
    "Instalación y cambio de repuestos, montaje de elementos y reparación de sistemas. No aplica para inspección ni mantenimiento de equipos.";
  const referenciaPlaceholder = "Ej: información dada por el asesor comercial, gestor interno del área de operaciones o dentro de la base de datos";
  const pedidoDemandaPlaceholder = "Ej: P-23-046 o D-45821";
  const descripcionPlaceholder = "Ej: Servicio asignado en ticket de servicio";
  const codInfPlaceholder = "Ej: P23-046- número de equipo - 001 (secuencia del servicio)";

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
              letterSpacing: "0.5px",
              verticalAlign: "middle",
            }}
          >
            <div style={{ fontSize: "16px" }}>
              INFORME TÉCNICO DE SERVICIO
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: "10px",
                fontWeight: "normal",
                letterSpacing: 0,
                lineHeight: 1.3,
              }}
            >
              ({reportDescription})
            </div>
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
            <AutoResizeInput
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
          <td className="pdf-label">N° DE PEDIDO / DEMANDA</td>
          <td colSpan={2}>
            <AutoResizeInput
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
            <AutoResizeInput
              className="pdf-input w-full"
              value={data.descripcion || ""}
              onChange={(e) =>
                onChange(["descripcion"], e.target.value)
              }
              placeholder={descripcionPlaceholder}
            />
          </td>
        </tr>

        {/* CÓDIGO */}
        <tr>
          <td className="pdf-label">CÓDIGO DEL INFORME</td>
          <td colSpan={2}>
            <ReportCodeInput
              value={data.codInf || ""}
              onChange={(value) => onChange(["codInf"], value)}
              placeholder={codInfPlaceholder}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
