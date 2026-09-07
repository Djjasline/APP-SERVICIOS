import { useEffect, useState } from "react";

const markerPercent = (value) => {
  const number = Number(value || 0);
  return Math.min(100, Math.max(0, number <= 1 ? number * 100 : number));
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const trimSignatureDataUrl = async (src) => {
  const image = await loadImage(src);
  const source = document.createElement("canvas");
  source.width = image.naturalWidth || image.width;
  source.height = image.naturalHeight || image.height;
  const context = source.getContext("2d");
  context.drawImage(image, 0, 0);

  const { data, width, height } = context.getImageData(0, 0, source.width, source.height);
  let top = height;
  let left = width;
  let right = 0;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];
      const isWhite = data[index] > 245 && data[index + 1] > 245 && data[index + 2] > 245;
      if (alpha > 20 && !isWhite) {
        top = Math.min(top, y);
        left = Math.min(left, x);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right <= left || bottom <= top) return src;

  const margin = Math.max(4, Math.round(Math.min(width, height) * 0.02));
  left = Math.max(0, left - margin);
  top = Math.max(0, top - margin);
  right = Math.min(width - 1, right + margin);
  bottom = Math.min(height - 1, bottom + margin);

  const cropped = document.createElement("canvas");
  cropped.width = right - left + 1;
  cropped.height = bottom - top + 1;
  cropped.getContext("2d").drawImage(source, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
  return cropped.toDataURL("image/png");
};

function PdfSignatureImage({ src, alt }) {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    let active = true;
    setDisplaySrc(src);
    if (!src?.startsWith?.("data:")) return undefined;

    trimSignatureDataUrl(src)
      .then((trimmed) => {
        if (active) setDisplaySrc(trimmed);
      })
      .catch(() => {
        if (active) setDisplaySrc(src);
      });

    return () => {
      active = false;
    };
  }, [src]);

  return (
    <img
      src={displaySrc}
      alt={alt}
      style={{
        maxWidth: "94%",
        maxHeight: 68,
        width: "auto",
        height: "auto",
        objectFit: "contain",
        display: "block",
        filter: "contrast(1.05)",
      }}
    />
  );
}

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
                  height: 72,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {signature.src ? (
                  <PdfSignatureImage
                    src={signature.src}
                    alt={signature.alt || signature.header}
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
