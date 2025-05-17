import { MdFilterCenterFocus } from "react-icons/md";
import { DifficultyLabel } from "../../../components/difficulty_label";
import { MonospaceImitation } from "../../../components/monospace_imitation";
import { OutlinedParagraph } from "../../../components/outlined_paragraph";
import { SongProgress } from "./song_progress";
import { useHideList, useIsRightLayout, usePalette } from "../../../hooks/search_param_hooks";
import { Characteristic, Difficulty } from "../../../modules/beatsaver";
import { OverlayState } from "../types";

type Props = {
  progress?: OverlayState["progress"];
  duration?: number;
  accuracy?: number;
  health?: number;
  characteristic?: Characteristic;
  difficulty?: Difficulty;
  diff?: { stars?: number; label?: string };
};

export function DifficultyTimeAccuracy({
  progress,
  duration,
  accuracy,
  health,
  characteristic,
  difficulty,
  diff,
}: Props) {
  const hides = useHideList();
  const { letter, outline } = usePalette();
  const isRightLayout = useIsRightLayout();

  return (
    <div
      className="flex gap-[0.1em] items-center"
      style={{
        flexDirection: isRightLayout ? "row-reverse" : undefined,
      }}
    >
      {!!difficulty && (
        <DifficultyLabel
          difficulty={difficulty}
          characteristic={characteristic}
          stars={diff?.stars}
          label={diff?.label}
          className="[-webkit-text-stroke:0]"
        />
      )}
      {!hides.has("time") && (
        <SongProgress
          duration={duration ?? 1}
          progress={progress}
          className="flex leading-none text-[0.12em]"
        />
      )}
      <div
        className="text-[0.12em] leading-none flex"
        style={{ display: !hides.has("acc") && accuracy != null ? undefined : "none" }}
      >
        <MdFilterCenterFocus
          className="center-icon mr-[0.4em] stroke-[10%] overflow-visible [paint-order:stroke_fill]"
          stroke={outline}
          fill={letter}
        />
        <OutlinedParagraph
          className={`flex`}
          innerClassName={`${(health ?? 0) > 0 ? "" : "brightness-[0.8]"}`}
        >
          <MonospaceImitation>
            {(Math.floor((accuracy ?? 1) * 1000) / 10).toFixed(1)}
          </MonospaceImitation>
          %
        </OutlinedParagraph>
      </div>
    </div>
  );
}
