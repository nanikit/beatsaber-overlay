import { useRaf } from "react-use";
import { OverlayState } from "../services/overlay_atom";

const emptyProgress = { point: new Date(), timeMultiplier: 1, pauseTime: 0 };

export function AutoProgressBar({
  progress: inputProgress,
  duration,
  ...props
}: {
  progress: OverlayState["progress"];
  duration: number;
  className: string;
}) {
  const progress = inputProgress ?? emptyProgress;
  const { point, timeMultiplier } = progress;

  const remainingMs = (() => {
    if ("resumeTime" in progress) {
      return ((duration - progress.resumeTime) * 1000) / timeMultiplier;
    }
  })();
  useRaf(remainingMs);

  const ratio = (() => {
    if ("resumeTime" in progress) {
      const elapsedSeconds = (new Date().getTime() - point.getTime()) / 1000;
      return (progress.resumeTime + elapsedSeconds) / duration;
    }
    return progress.pauseTime / duration;
  })();
  return <ProgressBar ratio={ratio} {...props} />;
}

function ProgressBar({ ratio, className }: { ratio: number; className?: string }) {
  return (
    <div
      className={`relative border-[0.01em] w-full border-[var(--color-primary)] ${className ?? ""}`}
    >
      <div
        className={`absolute top-0 left-0 h-full bg-[var(--color-primary)]`}
        style={{
          width: `${Math.min(ratio, 1) * 100}%`,
        }}
      />
    </div>
  );
}
