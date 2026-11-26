import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import "./protocolExamples.css";

export default function ProtocoloManExample({ protocol, src, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="man-example-dialog"
      aria-labelledby="man-example-title"
      aria-describedby="man-example-description"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="man-example-header">
        <div>
          <p className="man-example-code">{protocol.code} · EJEMPLO VISUAL</p>
          <h2 id="man-example-title">{protocol.title}</h2>
          <p id="man-example-description">Imagen de referencia. El formulario de la aplicación puede presentar diferencias.</p>
        </div>
        <button type="button" className="man-example-close" onClick={() => dialogRef.current?.close()} aria-label="Cerrar ejemplo">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="man-example-body">
        <img src={src} alt={`Ejemplo visual de ${protocol.title}`} width="1024" height="1536" />
      </div>
      <div className="man-example-actions">
        <a href={src} target="_blank" rel="noopener noreferrer">
          Abrir imagen completa <ExternalLink size={15} aria-hidden="true" />
        </a>
        <button type="button" onClick={() => dialogRef.current?.close()}>Cerrar</button>
      </div>
    </dialog>,
    document.body
  );
}
