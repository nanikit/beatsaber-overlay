import { useRaf } from "react-use";
import { OverlayState } from "../services/overlay_state";
import { FaClock } from "react-icons/fa";
import { OutlinedParagraph } from "./outlined_paragraph";
import { MonospaceImitation } from "./monospace_imitation";

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
  const { point, timeMultiplier } = progress;

  const remainingMs = (() => {
    if ("resumeTime" in progress) {
      return ((duration - progress.resumeTime) * 1000) / timeMultiplier;
    }
  })();
  useRaf(remainingMs);

  const elapsed = (() => {
    if ("resumeTime" in progress) {
      const elapsedSeconds = (new Date().getTime() - point.getTime()) / 1000;
      return Math.min(progress.resumeTime + elapsedSeconds * timeMultiplier, duration);
    }
    return progress.pauseTime;
  })();
  return <TimeProgress duration={duration} elapsed={elapsed} {...props} />;
}

function TimeProgress({
  duration,
  elapsed,
  className,
}: {
  duration: number;
  elapsed: number;
  className?: string;
}) {
  const total = formatSeconds(duration);
  const done = formatSeconds(elapsed);
  return (
    <div className={`flex items-center ${className}`}>
      <FaClock className="text-[0.85em] mr-[0.5em] [stroke-width:20%] align-bottom stroke-[black] overflow-visible [paint-order:stroke_fill]" />
      <OutlinedParagraph className={`flex flex-shrink text-[var(--color-primary)]`}>
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
