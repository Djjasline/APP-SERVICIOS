export default function ObservationImagesPdf({ images = [] }) {
  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!validImages.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginTop: 4 }}>
      {validImages.map((url, index) => (
        <img
          key={`${url}-${index}`}
          src={url}
          alt={`Evidencia observación ${index + 1}`}
          style={{ width: "100%", height: 48, objectFit: "cover", border: "1px solid #d1d5db", borderRadius: 4 }}
        />
      ))}
    </div>
  );
}
