/**
 * printPdf(elementId, filename)
 *
 * Clona el nodo #elementId dentro de un <iframe> temporal,
 * copia TODOS los estilos de la página (tanto <style> como <link>),
 * y llama a iframe.contentWindow.print().
 *
 * ✅ Evita el problema de "body > #pdf-root" no siendo hijo directo
 *    de body cuando React Router añade wrappers intermedios.
 * ✅ No interfiere con el DOM principal.
 * ✅ Funciona en Chrome, Firefox y Edge.
 */
export function printPdf(elementId = "pdf-root", filename = "documento") {
  const source = document.getElementById(elementId);
  if (!source) {
    console.error(`[printPdf] No se encontró #${elementId} en el DOM`);
    return;
  }

  /* 1 ── Crear iframe invisible */
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    width: "210mm",
    height: "297mm",
    border: "none",
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;

  /* 2 ── Escribir HTML base */
  doc.open();
  doc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${filename}</title>
    <style>
      /* Reset mínimo para el iframe */
      *, *::before, *::after { box-sizing: border-box; }
      html, body {
        margin: 0; padding: 0;
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        font-size: 11px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      /* Evitar cortes feos */
      .no-break  { page-break-inside: avoid; break-inside: avoid; }
      .page-break { page-break-before: always; break-before: page; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      tr, td, th { page-break-inside: avoid; break-inside: avoid; }
      img  { max-width: 100%; page-break-inside: avoid; break-inside: avoid; }
      .no-print { display: none !important; }
    </style>
  </head>
  <body></body>
</html>`);
  doc.close();

  /* 3 ── Copiar <style> y <link> del documento principal */
  const styleNodes = [
    ...document.querySelectorAll('style'),
    ...document.querySelectorAll('link[rel="stylesheet"]'),
  ];

  styleNodes.forEach((node) => {
    const clone = node.cloneNode(true);
    doc.head.appendChild(clone);
  });

  /* 4 ── Clonar el contenido del área PDF */
  const contentClone = source.cloneNode(true);

  /* Ocultar botones dentro del clon */
  contentClone.querySelectorAll(".no-print").forEach((el) => {
    el.style.display = "none";
  });

  doc.body.appendChild(contentClone);

  /* 5 ── Esperar a que carguen imágenes y estilos, luego imprimir */
  iframe.onload = () => {
    // pequeño delay para que los estilos copiados se apliquen
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (e) {
        console.error("[printPdf] Error al imprimir:", e);
      } finally {
        // Limpiar iframe después de que el diálogo se cierre
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 2000);
      }
    }, 500);
  };

  // fallback: si onload ya disparó (iframe ya cargado)
  if (
    iframe.contentDocument &&
    iframe.contentDocument.readyState === "complete"
  ) {
    iframe.onload();
  }
}
