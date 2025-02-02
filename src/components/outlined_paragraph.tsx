import { forwardRef, HTMLProps } from "react";
import { usePalette } from "../hooks/search_param_hooks";

type Props = HTMLProps<HTMLParagraphElement> & {
  innerClassName?: string;
};

export const OutlinedParagraph = forwardRef<HTMLParagraphElement, Props>((props, ref) => {
  const { className, innerClassName, children, ...rest } = props;
  const { letter, outline } = usePalette();

  return (
    <p
      ref={ref}
      className={`relative break-keep [overflow-wrap:anywhere] ${className ?? ""}`}
      style={{ WebkitTextStrokeColor: outline }}
      {...rest}
    >
      {children ?? ""}
      <span
        className={`absolute top-0 left-0 w-full h-full flex [-webkit-text-stroke:0] ${
          innerClassName ?? ""
        }`}
        style={{ color: letter }}
      >
        {children ?? ""}
      </span>
    </p>
  );
});
