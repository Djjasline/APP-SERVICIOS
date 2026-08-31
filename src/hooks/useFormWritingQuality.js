import { useEffect } from "react";
import { applyWritingQuality, applyWritingQualityToField } from "@/utils/formWritingQuality";

export function useFormWritingQuality() {
  useEffect(() => {
    applyWritingQuality();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches("input, textarea")) {
            applyWritingQualityToField(node);
          } else {
            applyWritingQuality(node);
          }
        });
      }
    });

    const handleFieldEvent = (event) => {
      applyWritingQualityToField(event.target);
    };

    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("focusin", handleFieldEvent, true);
    document.addEventListener("input", handleFieldEvent, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", handleFieldEvent, true);
      document.removeEventListener("input", handleFieldEvent, true);
    };
  }, []);
}
