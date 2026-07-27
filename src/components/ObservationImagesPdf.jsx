export default function ObservationImagesPdf({ images = [] }) {
  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!validImages.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 4 }}>
      {validImages.map((url, index) => (
        <div
          key={`${url}-${index}`}
          style={{
            width: "100%",
            height: "5cm",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "1px solid #d1d5db",
            borderRadius: 4,
            background: "#f8fafc",
            pageBreakInside: "avoid",
          }}
        >
          <img
            src={url}
            alt={`Evidencia observación ${index + 1}`}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ))}
    </div>
  );
}
