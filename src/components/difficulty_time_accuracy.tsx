import { useAtomValue } from "jotai";
import { MdFilterCenterFocus } from "react-icons/md";
import { accuracyAtom, difficultyTimeAccuracyAtom } from "../atoms/view_models";
import { useIsRightLayout, usePalette } from "../hooks/search_param_hooks";
import { DifficultyDots } from "./difficulty_dots";
import { DifficultyLabel } from "./difficulty_label";
import { MonospaceImitation } from "./monospace_imitation";
import { OutlinedParagraph } from "./outlined_paragraph";
import { SongProgress } from "./song_progress";

export function DifficultyTimeAccuracy() {
  const {
    characteristic,
    difficulty,
    diff,
    alternativeDiffs,
  } = useAtomValue(difficultyTimeAccuracyAtom);
  const isRightLayout = useIsRightLayout();

  const directionStyle = {
    flexDirection: isRightLayout ? "row-reverse" : undefined,
  } as const;

  return (
    <div
      className="flex gap-[0.1em] items-center"
      style={directionStyle}
    >
      {!!difficulty && (
        <div className="flex gap-[0.015em] items-center" style={directionStyle}>
          <DifficultyLabel
            difficulty={difficulty}
            characteristic={characteristic}
            stars={diff?.stars}
            label={diff?.label}
          />
          {alternativeDiffs && (
            <DifficultyDots reverse={isRightLayout} difficulties={alternativeDiffs} />
          )}
        </div>
      )}
      <SongProgress className="flex leading-none text-[0.12em]" />
      <AccuracyLabel />
    </div>
  );
}

function AccuracyLabel() {
  const { letter, outline } = usePalette();
  const model = useAtomValue(accuracyAtom);
  if (!model) {
    return null;
  }

  const { accuracy, health } = model;

  return (
    <div className="text-[0.12em] leading-none flex">
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
  );
}
