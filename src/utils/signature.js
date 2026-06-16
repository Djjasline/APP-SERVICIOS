export const SIGNATURE_CANVAS_WIDTH = 900;
export const SIGNATURE_CANVAS_HEIGHT = 300;

export const signatureCanvasProps = {
  width: SIGNATURE_CANVAS_WIDTH,
  height: SIGNATURE_CANVAS_HEIGHT,
  className: "w-full h-full touch-none bg-white signature-canvas",
};

export const signatureStrokeProps = {
  penColor: "black",
  minWidth: 0.8,
  maxWidth: 2.2,
  velocityFilterWeight: 0.7,
};

export const signatureImageStyle = {
  maxHeight: 56,
  width: "auto",
  maxWidth: 220,
  objectFit: "contain",
  display: "block",
  filter: "contrast(1.08)",
};
