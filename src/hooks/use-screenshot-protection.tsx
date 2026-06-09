import { useEffect, useState, useCallback } from "react";

/**
 * Hardens the page against casual screenshot / capture attempts:
 *  - blocks PrintScreen, common keyboard shortcuts, devtools, save, print
 *  - blocks right-click context menu
 *  - blocks drag/select/copy
 *  - blanks the page when the window loses focus or visibility
 *  - injects no-print CSS so Ctrl+P prints a blank page
 */
export function useScreenshotProtection() {
  const [hidden, setHidden] = useState(false);

  const block = useCallback((e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (
      k === "printscreen" ||
      (e.ctrlKey && (k === "p" || k === "s" || k === "u" || k === "c" || k === "a")) ||
      (e.metaKey && (k === "p" || k === "s" || k === "u" || k === "c" || k === "a" || (e.shiftKey && (k === "3" || k === "4" || k === "5")))) ||
      (e.ctrlKey && e.shiftKey && (k === "s" || k === "i" || k === "c" || k === "j")) ||
      k === "f12"
    ) {
      e.preventDefault();
      e.stopPropagation();
      // overwrite clipboard if PrintScreen was pressed
      if (k === "printscreen" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText("Protected content _ Research Methods").catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const ctx = (e: MouseEvent) => e.preventDefault();
    const drag = (e: DragEvent) => e.preventDefault();
    const copy = (e: ClipboardEvent) => { e.preventDefault(); e.clipboardData?.setData("text/plain", "Protected content"); };
    const onVis = () => setHidden(document.visibilityState !== "visible");
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);

    document.addEventListener("keydown", block, true);
    document.addEventListener("contextmenu", ctx);
    document.addEventListener("dragstart", drag);
    document.addEventListener("copy", copy);
    document.addEventListener("cut", copy);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    // inject print-blocking style once
    const styleId = "ia-no-print";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = `@media print { body { display:none !important; } } body { -webkit-user-select:none; user-select:none; -webkit-touch-callout:none; }`;
      document.head.appendChild(s);
    }

    return () => {
      document.removeEventListener("keydown", block, true);
      document.removeEventListener("contextmenu", ctx);
      document.removeEventListener("dragstart", drag);
      document.removeEventListener("copy", copy);
      document.removeEventListener("cut", copy);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [block]);

  return { hidden };
}
