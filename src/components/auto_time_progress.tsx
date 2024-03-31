import { FaClock } from "react-icons/fa";
import { OverlayState } from "../features/overlay/types";
import { usePalette } from "../hooks/use_palette";
import { MonospaceImitation } from "./monospace_imitation";
import { OutlinedParagraph } from "./outlined_paragraph";

const emptyProgress = { point: new Date(), timeMultiplier: 1, pauseTime: 0 };

export function AutoTimeProgress({
  progress: inputProgress,
  duration,
  ...props
}: {
  progress: OverlayState["progress"];
  duration: number;
  className?: string;
}) {
  const progress = inputProgress ?? emptyProgress;
  const elapsed = "pauseTime" in progress ? progress.pauseTime : progress.resumeTime;

  return (
    <TimeProgress
      duration={duration}
      elapsed={elapsed}
      grayOut={"pauseTime" in progress}
      {...props}
    />
  );
}

function TimeProgress({
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
        className="text-[0.85em] mr-[0.5em] [stroke-width:20%] align-bottom overflow-visible [paint-order:stroke_fill]"
        stroke={outline}
        fill={letter}
      />
      <OutlinedParagraph
        className={`flex flex-shrink`}
        innerClassName={grayOut ? "brightness-90" : ""}
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
