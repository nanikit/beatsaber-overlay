import { RefObject, useEffect, useRef } from "react";

/**
 * Options for the useResizeObserver hook
 */
type HookOptions = {
  /** Callback function that receives the element's content rect when resized */
  onResize?: (rect: DOMRectReadOnly) => void;
  /** Whether to invoke the onResize callback immediately on mount */
  invokeOnMount?: boolean;
};

/**
 * A hook that observes size changes of a DOM element using ResizeObserver
 * @param ref - React ref object pointing to the element to observe
 * @param options - Configuration options for the resize observer
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  { onResize, invokeOnMount }: HookOptions = {},
) {
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries.at(-1);
      if (entry) {
        onResizeRef.current?.(entry.contentRect);
      }
    });

    observer.observe(element);

    if (invokeOnMount) {
      onResizeRef.current?.(element.getBoundingClientRect());
    }

    return () => {
      observer.disconnect();
    };
  }, [ref.current, invokeOnMount]);
}
