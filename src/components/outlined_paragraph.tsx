import { forwardRef } from "react";

export const OutlinedParagraph = forwardRef<
  HTMLParagraphElement,
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p ref={ref} className={`relative break-keep ${className ?? ""}`} {...props}>
      {children ?? ""}
      <span className={`absolute top-0 left-0 w-full h-full flex [-webkit-text-stroke:0]`}>
        {children ?? ""}
      </span>
    </p>
  );
});
