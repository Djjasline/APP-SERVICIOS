const markerPercent = (value) => {
  const number = Number(value || 0);
  return Math.min(100, Math.max(0, number <= 1 ? number * 100 : number));
};

export function PdfEquipmentImageFrame({ src, alt, points = [] }) {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", background: "#fff" }}>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          maxWidth: "95mm",
          maxHeight: "70mm",
          border: "1px solid #d1d5db",
          borderRadius: 4,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: "95mm",
            maxHeight: "70mm",
            width: "auto",
            height: "auto",
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
    <table style={{ ...styles.tbl, width: "95%", margin: "14px auto 0", tableLayout: "fixed" }}>
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
