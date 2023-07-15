import { forwardRef } from "react";
import { useSearchParam } from "react-use";
import { usePalette } from "../hooks/use_palette";

export const OutlinedParagraph = forwardRef<
  HTMLParagraphElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { letter, outline } = usePalette();

  return (
    <p
      ref={ref}
      className={`relative break-keep ${className ?? ""}`}
      style={{ WebkitTextStrokeColor: outline }}
      {...props}
    >
      {children ?? ""}
      <span
        className={`absolute top-0 left-0 w-full h-full flex [-webkit-text-stroke:0]`}
        style={{ color: letter }}
      >
        {children ?? ""}
      </span>
    </p>
  );
});
