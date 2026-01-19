import SignatureCanvas from "react-signature-canvas";

export default function InspectionLayoutHidro({
  data,
  firmasRef,
  readOnly = false,
  showActions = true,
  onChange,
  onItemChange,
  onImageClick,
  onRemovePoint,
  onNotaChange,
  clearAllPoints,
}) {
  return (
    <div className="bg-white max-w-6xl mx-auto p-6 shadow space-y-6">

      {/* ================= ENCABEZADO ================= */}
      <table className="pdf-table">
        <tbody>
          <tr>
            <td rowSpan={4} style={{ width: 140, textAlign: "center" }}>
              <img src="/astap-logo.jpg" alt="ASTAP" style={{ width: 90 }} />
            </td>
            <td colSpan={2} className="text-center font-bold">
              HOJA DE INSPECCIÓN HIDROSUCCIONADOR
            </td>
            <td style={{ width: 180, fontSize: 11 }}>
              <div>Fecha versión: 01-01-26</div>
              <div>Versión: 01</div>
            </td>
          </tr>

          {[
            ["REFERENCIA DE CONTRATO", "referenciaContrato"],
            ["DESCRIPCIÓN", "descripcion"],
            ["COD. INF.", "codInf"],
          ].map(([label, key]) => (
            <tr key={key}>
              <td className="pdf-label">{label}</td>
              <td colSpan={2}>
                <input
                  className="pdf-input"
                  value={data[key] || ""}
                  disabled={readOnly}
                  onChange={(e) => onChange([key], e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= DATOS CLIENTE ================= */}
      <table className="pdf-table">
        <tbody>
          {[
            ["CLIENTE", "cliente"],
            ["DIRECCIÓN", "direccion"],
            ["CONTACTO", "contacto"],
            ["TELÉFONO", "telefono"],
            ["CORREO", "correo"],
            ["FECHA DE SERVICIO", "fechaServicio"],
          ].map(([label, key]) => (
            <tr key={key}>
              <td className="pdf-label">{label}</td>
              <td>
                <input
                  className="pdf-input"
                  value={data[key] || ""}
                  disabled={readOnly}
                  onChange={(e) => onChange([key], e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= ESTADO DEL EQUIPO ================= */}
      {data.estadoEquipoPuntos && (
        <section>
          <h3 className="font-semibold mb-2">Estado del equipo</h3>

          {!readOnly && (
            <button
              type="button"
              onClick={clearAllPoints}
              className="text-xs border px-2 py-1 rounded mb-2"
            >
              Limpiar puntos
            </button>
          )}

          <div
            className={`relative border rounded ${
              readOnly ? "" : "cursor-crosshair"
            }`}
            onClick={!readOnly ? onImageClick : undefined}
          >
            <img src="/estado-equipo.png" className="w-full" />
            {data.estadoEquipoPuntos.map((pt) => (
              <div
                key={pt.id}
                onDoubleClick={
                  !readOnly ? () => onRemovePoint(pt.id) : undefined
                }
                className="absolute bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {pt.id}
              </div>
            ))}
          </div>

          {data.estadoEquipoPuntos.map((pt) => (
            <div key={pt.id} className="flex gap-2 mt-1">
              <span>{pt.id})</span>
              <input
                className="pdf-input flex-1"
                value={pt.nota || ""}
                disabled={readOnly}
                onChange={(e) =>
                  onNotaChange(pt.id, e.target.value)
                }
              />
            </div>
          ))}
        </section>
      )}

      {/* ================= CHECKLIST ================= */}
      <section>
        <h3 className="font-semibold mb-2">Evaluación de sistemas</h3>
        <table className="pdf-table">
          <thead>
            <tr>
              <th>Ítem</th>
              <th>Estado</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.items || {}).map(([codigo, item]) => (
              <tr key={codigo}>
                <td>{codigo}</td>
                <td>{item.estado}</td>
                <td>{item.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

{/* ================= FIRMAS ================= */}
<table className="pdf-table">
  <thead>
    <tr>
      <th>FIRMA TÉCNICO</th>
      <th>FIRMA CLIENTE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style={{ height: 140 }}>
        {readOnly ? (
          data.firmas?.tecnico && (
            <img
              src={data.firmas.tecnico}
              className="max-h-32 mx-auto"
            />
          )
        ) : (
          <SignatureCanvas
            ref={firmasRef?.tecnico}
            canvasProps={{ className: "w-full h-full" }}
          />
        )}
      </td>

      <td style={{ height: 140 }}>
        {readOnly ? (
          data.firmas?.cliente && (
            <img
              src={data.firmas.cliente}
              className="max-h-32 mx-auto"
            />
          )
        ) : (
          <SignatureCanvas
            ref={firmasRef?.cliente}
            canvasProps={{ className: "w-full h-full" }}
          />
        )}
      </td>
    </tr>
  </tbody>
</table>
    </div>
  );
}
