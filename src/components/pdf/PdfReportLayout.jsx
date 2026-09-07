const markerPercent = (value) => {
  const number = Number(value || 0);
  return Math.min(100, Math.max(0, number <= 1 ? number * 100 : number));
};

export function PdfEquipmentImageFrame({ src, alt, points = [] }) {
  return (
    <div
      className="no-break"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "95mm",
          height: "58mm",
          maxWidth: "100%",
          maxHeight: "70mm",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          overflow: "hidden",
          background: "#fff",
          breakInside: "avoid",
          pageBreakInside: "avoid",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            maxHeight: "70mm",
            objectFit: "contain",
            display: "block",
          }}
        />
        {(points || []).map((point, index) => (
          <div
            key={point.id || index}
            style={{
              position: "absolute",
              left: `${markerPercent(point.x)}%`,
              top: `${markerPercent(point.y)}%`,
              transform: "translate(-50%, -50%)",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#dc2626",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              color: "#fff",
              fontWeight: 700,
              boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PdfConclusionRecommendationTable({ conclusiones = [], recomendaciones = [], styles }) {
  const rowCount = Math.max(conclusiones.length, recomendaciones.length);
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <table style={{ ...styles.tbl, width: "100%", margin: "14px 0 0 0", tableLayout: "fixed" }}>
      <thead>
        <tr>
          <th style={{ ...styles.th, width: "50%" }}>CONCLUSIÓN TÉCNICA</th>
          <th style={{ ...styles.th, width: "50%" }}>RECOMENDACIÓN ACCIONABLE</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((index) => (
          <tr key={index} className="no-break">
            <td style={{ ...styles.cell, width: "50%", whiteSpace: "pre-wrap", verticalAlign: "middle" }}>
              <div style={{ display: "flex", alignItems: "center", minHeight: 80 }}>
                <span style={{ width: 28, flexShrink: 0, textAlign: "center", fontWeight: 700 }}>{index + 1}</span>
                <span>{conclusiones[index] || "—"}</span>
              </div>
            </td>
            <td style={{ ...styles.cell, width: "50%", whiteSpace: "pre-wrap", verticalAlign: "middle" }}>
              <div style={{ display: "flex", alignItems: "center", minHeight: 80 }}>
                <span style={{ width: 28, flexShrink: 0, textAlign: "center", fontWeight: 700 }}>{index + 1}</span>
                <span>{recomendaciones[index] || "—"}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PdfSignaturesTable({ signatures = [], styles, marginTop = 10 }) {
  const count = Math.max(signatures.length, 1);
  const columnWidth = `${100 / count}%`;
  const tableStyle = styles?.tbl || {};
  const headerStyle = styles?.th || {};
  const cellStyle = styles?.cell || {};

  return (
    <table style={{ ...tableStyle, width: "100%", tableLayout: "fixed", marginTop, breakInside: "avoid", pageBreakInside: "avoid" }}>
      <thead>
        <tr>
          {signatures.map((signature) => (
            <th key={signature.header} style={{ ...headerStyle, width: columnWidth }}>
              {signature.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {signatures.map((signature) => (
            <td
              key={`${signature.header}-content`}
              style={{
                ...cellStyle,
                width: columnWidth,
                height: 112,
                padding: "6px 8px",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <div
                style={{
                  height: 62,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {signature.src ? (
                  <img
                    src={signature.src}
                    alt={signature.alt || signature.header}
                    style={{
                      maxWidth: "92%",
                      maxHeight: 58,
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                      filter: "contrast(1.05)",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>Sin firma</span>
                )}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {signature.name || "—"}
              </div>
              {signature.detail && (
                <div style={{ marginTop: 2, fontSize: 9, color: "#4b5563", lineHeight: 1.2 }}>
                  {signature.detail}
                </div>
              )}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
