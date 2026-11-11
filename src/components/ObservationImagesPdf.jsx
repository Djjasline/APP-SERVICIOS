export default function ObservationImagesPdf({ images = [] }) {
  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!validImages.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(validImages.length, 3)}, minmax(0, 1fr))`, gap: 6, marginTop: 4 }}>
      {validImages.map((url, index) => (
        <div
          key={`${url}-${index}`}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            pageBreakInside: "avoid",
          }}
        >
          <img
            src={url}
            alt={`Evidencia observación ${index + 1}`}
            style={{
              display: "block",
              width: "auto",
              height: "auto",
              maxWidth: "100%",
              maxHeight: "5cm",
            }}
          />
        </div>
      ))}
    </div>
  );
}
