import { useRef, useState } from "react";
import { FaStar } from "react-icons/fa";
import useResizeObserver from "use-resize-observer";
import { Characteristic, Difficulty } from "../services/beatsaver";

export function DifficultyLabel({
  characteristic,
  difficulty,
  label,
  stars,
  className,
}: {
  characteristic?: Characteristic;
  difficulty: Difficulty;
  label?: string;
  stars?: number;
  className?: string;
}) {
  const difficultyText = getDifficultyText(difficulty, label);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({
    isOverflowed: false,
    isMeasuring: true,
    width: undefined as number | undefined,
  });
  const { isOverflowed, width } = state;

  useResizeObserver({
    ref: containerRef,
    onResize: () => {
      const div = containerRef.current;
      if (!div) {
        return;
      }

      const maxWidth = parseFloat(getComputedStyle(div).fontSize) * 0.8;
      const width = Math.min(div.clientWidth, maxWidth);
      setState({ ...state, width, isOverflowed: width === maxWidth });
    },
  });

  return (
    <div
      className={`relative px-[0.07em] py-[0.015em] ${
        width ? "" : "max-w-[0.8em]"
      } ${getDifficultyBackground(difficulty)} overflow-hidden transition-all rounded-[1em] ${
        className ?? ""
      }`}
      style={{ width }}
    >
      <div
        ref={containerRef}
        className={`absolute px-[0.07em] flex items-center gap-[0.05em] invisible`}
      >
        <DifficultyFragment characteristic={characteristic} label={difficultyText} stars={stars} />
      </div>

      <div
        className={`${
          isOverflowed ? "absolute left-0 top-0 bottom-0 animate-translate-diff" : ""
        } flex items-center gap-[0.05em]`}
      >
        <DifficultyFragment characteristic={characteristic} label={difficultyText} stars={stars} />
        {isOverflowed && (
          <>
            <DifficultyFragment
              characteristic={characteristic}
              label={difficultyText}
              stars={stars}
            />
            {/* 0.05em flex gap compensation */}
            <span />
          </>
        )}
      </div>

      {isOverflowed && <p className="text-[0.1em] invisible">.</p>}
    </div>
  );
}

function DifficultyFragment({
  characteristic,
  label,
  stars,
}: {
  characteristic?: Characteristic;
  label: string;
  stars?: number;
}) {
  return (
    <>
      {!!characteristic && (
        <span className="w-[0.1em]">
          <img src={getCharacteristicSvg(characteristic)} className="w-[0.1em]" />
        </span>
      )}
      <p className="text-[0.1em] whitespace-nowrap">{label}</p>
      {!!stars && (
        <p className="flex items-center justify-center align-middle text-[0.09em] text-center tracking-[0.12em]">
          <FaStar className="inline text-white mr-[0.25em]" />
          {stars}
        </p>
      )}
    </>
  );
}

function getDifficultyText(difficulty: Difficulty, label?: string) {
  if (label) {
    if (label.toLowerCase().match(/\b(easy|normal|hard|expert|ex?|n|h)\b/)) {
      return label;
    }
    return `${label} (${getDifficultyAbbreviation(difficulty)})`;
  }

  const regularLabel = difficulty === "ExpertPlus" ? "Expert+" : difficulty;
  const difficultyText = label ?? regularLabel;
  return difficultyText;
}

function getCharacteristicSvg(characteristic: Characteristic) {
  return `/${characteristic.toLowerCase()}.svg`;
}

function getDifficultyAbbreviation(difficulty: Difficulty) {
  switch (difficulty) {
    case "Easy":
      return "Ez";
    case "Normal":
      return "N";
    case "Hard":
      return "H";
    case "Expert":
      return "E";
    case "ExpertPlus":
      return "E+";
  }
}

function getDifficultyBackground(difficulty: Difficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-700";
    case "Normal":
      return "bg-sky-700";
    case "Hard":
      return "bg-amber-700";
    case "Expert":
      return "bg-red-700";
    case "ExpertPlus":
      return "bg-purple-700";
  }
}
