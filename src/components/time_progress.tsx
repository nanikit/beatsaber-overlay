import { FaClock } from "react-icons/fa";
import { usePalette } from "../hooks/search_param_hooks";
import { MonospaceImitation } from "./monospace_imitation";
import { OutlinedParagraph } from "./outlined_paragraph";

export function TimeProgress({
  duration,
  elapsed,
  className,
  grayOut,
}: {
  duration: number;
  elapsed: number;
  className?: string;
  grayOut?: boolean;
}) {
  const { letter, outline } = usePalette();

  const total = formatSeconds(duration);
  const done = formatSeconds(elapsed);

  return (
    <div className={`flex items-center ${className}`}>
      <FaClock
        className="text-[0.85em] mr-[0.5em] stroke-[20%] align-bottom overflow-visible [paint-order:stroke_fill]"
        stroke={outline}
        fill={letter}
      />
      <OutlinedParagraph
        className="flex shrink"
        innerClassName={grayOut ? "brightness-[0.8]" : ""}
      >
        <MonospaceImitation>{done}</MonospaceImitation>
        &nbsp;/ {total}
      </OutlinedParagraph>
    </div>
  );
}

function formatSeconds(seconds: number): string {
  const date = new Date(seconds * 1000);
  const iso = date.toISOString().substring(11, 19);
  return iso.replace(/^0+:?0?/, "");
}
