import { MdFilterCenterFocus } from "react-icons/md";
import { filterAlternativeDifficulties } from "../helpers/filter_alternative_difficulties";
import { useHideList, useIsRightLayout, usePalette } from "../hooks/search_param_hooks";
import { Characteristic, Difficulty } from "../modules/beatsaver";
import { OverlayState } from "../types/overlay";
import { DifficultyDots } from "./difficulty_dots";
import { DifficultyLabel } from "./difficulty_label";
import { MonospaceImitation } from "./monospace_imitation";
import { OutlinedParagraph } from "./outlined_paragraph";
import { SongProgress } from "./song_progress";

type Props = {
  progress?: OverlayState["progress"];
  duration?: number;
  accuracy?: number;
  health?: number;
  characteristic?: Characteristic;
  difficulty?: Difficulty;
  diff?: { stars?: number; label?: string };
  difficulties?: { characteristic: Characteristic; difficulty: Difficulty }[];
};

export function DifficultyTimeAccuracy({
  progress,
  duration,
  accuracy,
  health,
  characteristic,
  difficulty,
  diff,
  difficulties,
}: Props) {
  const hides = useHideList();
  const { letter, outline } = usePalette();
  const isRightLayout = useIsRightLayout();

  const alternativeDiffs = difficulties && characteristic && difficulty
    ? filterAlternativeDifficulties({ difficulties, current: { characteristic, difficulty } })
    : undefined;
  const showAlternativeDiffs = alternativeDiffs && alternativeDiffs.length > 1;

  const directionStyle = {
    flexDirection: isRightLayout ? "row-reverse" : undefined,
  } as const;

  return (
    <div
      className="flex gap-[0.1em] items-center"
      style={directionStyle}
    >
      {(!!difficulty || showAlternativeDiffs) && (
        <div className="flex gap-[0.015em] items-center" style={directionStyle}>
          {!!difficulty && (
            <DifficultyLabel
              difficulty={difficulty}
              characteristic={characteristic}
              stars={diff?.stars}
              label={diff?.label}
            />
          )}
          {!hides.has("other_diffs") && showAlternativeDiffs && (
            <DifficultyDots reverse={isRightLayout} difficulties={alternativeDiffs} />
          )}
        </div>
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
