import { HTMLProps, MutableRefObject, useEffect, useRef } from "react";
import { useMeasure } from "react-use";

export function FittedText({
  children,
  options,
  ...props
}: {
  options: { maxWidth: number; maxHeight: number; maxSize: number };
} & HTMLProps<HTMLParagraphElement>) {
  const ref = useRef(null);
  const [spanRef, { width, height }] = useMeasure();
  const p = ref.current;
  const { maxWidth, maxHeight, maxSize } = options;

  useEffect(() => {
    if (p) {
      fitText(p, options);
    }
  }, [children, p, width, height, maxWidth, maxHeight, maxSize]);

  return (
    <p ref={ref} {...props}>
      <span
        ref={spanRef as unknown as MutableRefObject<HTMLElement>}
        className="whitespace-pre-line"
      >
        {children}
      </span>
    </p>
  );
}

export function useTextFit(
  {
    ref,
    maxHeight,
    maxSize,
  }: { ref: MutableRefObject<HTMLElement | null>; maxHeight: number; maxSize?: number },
  deps?: unknown[],
) {
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    fitText(ref.current, { maxHeight, maxWidth: Number.MAX_VALUE, maxSize });
  }, deps);
}

function fitText(
  element: HTMLElement,
  { maxWidth, maxHeight, maxSize }: { maxWidth: number; maxHeight: number; maxSize?: number },
) {
  let fontSize = Math.min(maxWidth, maxHeight, maxSize ?? Number.MAX_VALUE);
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
