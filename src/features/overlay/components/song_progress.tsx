import { TimeProgress } from "../../../components/auto_time_progress";
import { OverlayState } from "../types";

const emptyProgress = { point: new Date(), timeMultiplier: 1, pauseTime: 0 };

export function SongProgress({
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
