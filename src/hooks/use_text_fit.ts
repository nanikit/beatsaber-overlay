import { MutableRefObject } from "react";
import useResizeObserver from "use-resize-observer";

export function useTextFit(
  {
    ref,
    maxHeight,
    maxSize,
  }: { ref: MutableRefObject<HTMLElement | null>; maxHeight: number; maxSize?: number },
) {
  useResizeObserver({
    ref,
    onResize: () => {
      if (ref.current) {
        fitText(ref.current, { maxHeight, maxWidth: Number.MAX_VALUE, maxSize });
      }
    },
  });
}

function fitText(
  element: HTMLElement,
  { maxWidth, maxHeight, maxSize }: { maxWidth: number; maxHeight: number; maxSize?: number },
) {
  let fontSize = Math.floor(Math.min(maxWidth, maxHeight, maxSize ?? Number.MAX_VALUE));
  let textHeight;
  let textWidth;
  do {
    element.style.fontSize = `${fontSize}px`;
    element.style.lineHeight = `${fontSize * 1.1}px`;
    textHeight = element.scrollHeight;
    textWidth = element.scrollWidth;
    fontSize = fontSize - 1;
  } while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 3);
}
