import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import ReactSignatureCanvas from "react-signature-canvas";
import { useAuth } from "@/context/AuthContext";
import { loadUserSignatureDataUrl } from "@/services/userSignatureService";

const lockPageScroll = () => {
  document.activeElement?.blur();
  document.body.style.overflow = "hidden";
};

const unlockPageScroll = () => {
  document.body.style.overflow = "";
};

const compose = (first, second) => (event) => {
  first?.(event);
  second?.(event);
};

const stopGesturePropagation = (event) => {
  event.stopPropagation?.();
  event.nativeEvent?.stopImmediatePropagation?.();
};

const loadDataUrlImage = (dataUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

const getTrimmedSignatureDataUrl = (image) => {
  const source = document.createElement("canvas");
  source.width = image.naturalWidth || image.width;
  source.height = image.naturalHeight || image.height;
  const sourceContext = source.getContext("2d");
  sourceContext.drawImage(image, 0, 0);

  const { data, width, height } = sourceContext.getImageData(0, 0, source.width, source.height);
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

  if (right <= left || bottom <= top) return null;

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

const getContainedImageOptions = (canvas, image) => {
  const padding = Math.max(10, Math.round(Math.min(canvas.width, canvas.height) * 0.08));
  const maxWidth = Math.max(1, canvas.width - padding * 2);
  const maxHeight = Math.max(1, canvas.height - padding * 2);
  const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  return {
    width,
    height,
    xOffset: Math.round((canvas.width - width) / 2),
    yOffset: Math.round((canvas.height - height) / 2),
  };
};

const SignatureCanvasField = forwardRef(function SignatureCanvasField(
  { canvasProps = {}, enableDefaultSignature = false, onBegin, onEnd, onDefaultSignatureApplied, ...props },
  forwardedRef
) {
  const internalRef = useRef(null);
  const { user } = useAuth() || {};
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [defaultMessage, setDefaultMessage] = useState("");

  useImperativeHandle(forwardedRef, () => ({
    clear: (...args) => internalRef.current?.clear?.(...args),
    isEmpty: (...args) => internalRef.current?.isEmpty?.(...args),
    getCanvas: (...args) => internalRef.current?.getCanvas?.(...args),
    getTrimmedCanvas: (...args) => internalRef.current?.getTrimmedCanvas?.(...args),
    getSignaturePad: (...args) => internalRef.current?.getSignaturePad?.(...args),
    fromDataURL: (...args) => internalRef.current?.fromDataURL?.(...args),
    toDataURL: (type = "image/png", encoderOptions) => {
      const signature = internalRef.current;
      if (!signature) return undefined;
      if (signature.isEmpty?.()) return signature.toDataURL?.(type, encoderOptions);
      try {
        return signature.getTrimmedCanvas?.().toDataURL(type, encoderOptions);
      } catch {
        return signature.toDataURL?.(type, encoderOptions);
      }
    },
  }), []);

  const resizeCanvas = useCallback(() => {
    const signature = internalRef.current;
    const canvas = signature?.getCanvas?.();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const parentRect = canvas.parentElement?.getBoundingClientRect();
    const width = Math.round(rect.width || parentRect?.width || canvasProps.width || canvas.offsetWidth || 300);
    const height = Math.round(rect.height || parentRect?.height || canvasProps.height || canvas.offsetHeight || 120);
    if (!width || !height) return;

    const nextWidth = Math.round(width);
    const nextHeight = Math.round(height);
    if (canvas.width === nextWidth && canvas.height === nextHeight) return;

    const dataUrl = signature.isEmpty?.() ? "" : canvas.toDataURL("image/png");

    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    signature.clear?.();
    if (dataUrl) signature.fromDataURL?.(dataUrl);
  }, [canvasProps.height, canvasProps.width]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(resizeCanvas);
    const canvas = internalRef.current?.getCanvas?.();
    const parent = canvas?.parentElement;
    let observer;

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);

    if (parent && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(resizeCanvas);
      observer.observe(parent);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
      unlockPageScroll();
    };
  }, [resizeCanvas]);

  const {
    className = "",
    style,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    ...restCanvasProps
  } = canvasProps;

  const applyDefaultSignature = async () => {
    if (!user?.id || loadingDefault) return;

    setLoadingDefault(true);
    setDefaultMessage("");
    try {
      const dataUrl = await loadUserSignatureDataUrl(user.id);
      if (!dataUrl) {
        setDefaultMessage("Sin firma guardada");
        return;
      }

      resizeCanvas();
      const signature = internalRef.current;
      const canvas = signature?.getCanvas?.();
      if (!signature || !canvas) return;

      const image = await loadDataUrlImage(dataUrl);
      const containedDataUrl = getTrimmedSignatureDataUrl(image) || dataUrl;
      const containedImage = containedDataUrl === dataUrl ? image : await loadDataUrlImage(containedDataUrl);
      signature.clear?.();
      signature.fromDataURL?.(containedDataUrl, getContainedImageOptions(canvas, containedImage));
      onDefaultSignatureApplied?.(dataUrl);
      requestAnimationFrame(() => onEnd?.());
    } catch (error) {
      console.error("Error aplicando firma predeterminada:", error);
      setDefaultMessage("No se pudo cargar");
    } finally {
      setLoadingDefault(false);
    }
  };

  const canvas = (
    <ReactSignatureCanvas
      {...props}
      ref={internalRef}
      onBegin={(...args) => {
        setDefaultMessage("");
        lockPageScroll();
        onBegin?.(...args);
      }}
      onEnd={(...args) => {
        onEnd?.(...args);
        unlockPageScroll();
      }}
      canvasProps={{
        ...restCanvasProps,
        "data-signature-field": "true",
        className: `${className} signature-pad-canvas`.trim(),
        style: {
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          display: "block",
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          minWidth: 0,
          ...style,
        },
        onPointerDown: compose((event) => {
          stopGesturePropagation(event);
          resizeCanvas();
          lockPageScroll();
        }, onPointerDown),
        onPointerUp: compose((event) => {
          stopGesturePropagation(event);
          onPointerUp?.(event);
        }, () => unlockPageScroll()),
        onPointerCancel: compose((event) => {
          stopGesturePropagation(event);
          onPointerCancel?.(event);
        }, () => unlockPageScroll()),
        onTouchStart: compose((event) => {
          stopGesturePropagation(event);
          lockPageScroll();
        }, onTouchStart),
        onTouchMove: compose((event) => {
          stopGesturePropagation(event);
          event.preventDefault();
        }, onTouchMove),
        onTouchEnd: compose((event) => {
          stopGesturePropagation(event);
          onTouchEnd?.(event);
        }, () => unlockPageScroll()),
      }}
    />
  );

  if (enableDefaultSignature) {
    return (
      <div className="relative h-full w-full min-w-0">
        <button
          type="button"
          onClick={applyDefaultSignature}
          disabled={loadingDefault}
          className="absolute right-2 top-2 z-10 rounded-md border border-slate-950 bg-slate-950 px-2 py-1 text-[10px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-70"
        >
          {loadingDefault ? "Cargando..." : "Usar mi firma"}
        </button>
        {defaultMessage && (
          <span className="absolute bottom-2 right-2 z-10 rounded bg-slate-950/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
            {defaultMessage}
          </span>
        )}
        {canvas}
      </div>
    );
  }

  return canvas;
});

export default SignatureCanvasField;
