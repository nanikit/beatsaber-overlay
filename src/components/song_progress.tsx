import { useAtomValue } from "jotai";
import { songProgressAtom } from "../atoms/view_models";
import { TimeProgress } from "./time_progress";

export function SongProgress({ ...props }: { className?: string }) {
  const model = useAtomValue(songProgressAtom);
  if (!model) {
    return null;
  }

  const { progress, duration } = model;
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
