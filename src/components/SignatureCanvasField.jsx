import { forwardRef, useCallback, useImperativeHandle, useLayoutEffect, useRef } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

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

const SignatureCanvasField = forwardRef(function SignatureCanvasField(
  { canvasProps = {}, onBegin, onEnd, ...props },
  forwardedRef
) {
  const internalRef = useRef(null);

  useImperativeHandle(forwardedRef, () => ({
    clear: (...args) => internalRef.current?.clear?.(...args),
    isEmpty: (...args) => internalRef.current?.isEmpty?.(...args),
    getCanvas: (...args) => internalRef.current?.getCanvas?.(...args),
    getTrimmedCanvas: (...args) => internalRef.current?.getTrimmedCanvas?.(...args),
    getSignaturePad: (...args) => internalRef.current?.getSignaturePad?.(...args),
    fromDataURL: (...args) => internalRef.current?.fromDataURL?.(...args),
    toDataURL: (...args) => internalRef.current?.toDataURL?.(...args),
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

  return (
    <ReactSignatureCanvas
      {...props}
      ref={internalRef}
      onBegin={(...args) => {
        lockPageScroll();
        onBegin?.(...args);
      }}
      onEnd={(...args) => {
        onEnd?.(...args);
        unlockPageScroll();
      }}
      canvasProps={{
        ...restCanvasProps,
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
});

export default SignatureCanvasField;
