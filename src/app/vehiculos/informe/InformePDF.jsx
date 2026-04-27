export default function InformePDF({ data }) {

  // 🔥 PROTECCIÓN: evita error cuando data aún no carga
  if (!data) {
    return (
      <div className="p-6 text-white">
        Cargando informe...
      </div>
    );
  }

  return (
    <div className="pdf-container">

      <table className="pdf-table w-full">
        <tbody>
          <tr>
            {/* LOGO */}
            <td
              rowSpan={5}
              style={{
                width: 120,
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <img
                src="/astap-logo.jpg"
                alt="ASTAP"
                style={{ maxHeight: "80px", margin: "0 auto" }}
              />
            </td>

            {/* TÍTULO */}
            <td
              colSpan={2}
              className="pdf-title"
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              INFORME GENERAL DE SERVICIOS
            </td>

            {/* INFO DERECHA */}
            <td style={{ width: 160, fontSize: "10px" }}>
              <div>Fecha de versión: 01-01-26</div>
              <div>Versión: 01</div>
            </td>
          </tr>

          {/* REFERENCIA CONTRATO */}
          <tr>
            <td className="pdf-label">REFERENCIA CONTRATO</td>
            <td colSpan={2}>
              {data?.referenciaContrato || "—"}
            </td>
          </tr>

          {/* PEDIDO / DEMANDA */}
          <tr>
            <td className="pdf-label">PEDIDO / DEMANDA</td>
            <td colSpan={2}>
              {data?.pedidoDemanda || "—"}
            </td>
          </tr>

          {/* DESCRIPCIÓN */}
          <tr>
            <td className="pdf-label">DESCRIPCIÓN</td>
            <td colSpan={2}>
              {data?.descripcion || "—"}
            </td>
          </tr>

          {/* COD INF */}
          <tr>
            <td className="pdf-label">COD. INF.</td>
            <td colSpan={2}>
              {data?.codInf || "—"}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 🔥 AQUÍ SIGUE TODO TU PDF SIN CAMBIOS */}
      {/* actividades, imágenes, firmas, etc */}

    </div>
  );
}
