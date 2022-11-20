import { MutableRefObject, useEffect } from "react";
import { useMeasure } from "react-use";

export function useTextFit(
  {
    ref,
    maxHeight,
    maxSize,
  }: { ref: MutableRefObject<HTMLElement | null>; maxHeight: number; maxSize?: number },
  deps?: unknown[],
) {
  const [measureRef, { width, height }] = useMeasure();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    measureRef(ref.current);
    fitText(ref.current, { maxHeight, maxWidth: Number.MAX_VALUE, maxSize });
  }, [...(deps ?? []), maxHeight, maxSize, width, height]);
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
    textHeight = element.offsetHeight;
    textWidth = element.offsetWidth;
    fontSize = fontSize - 1;
  } while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 3);
}
