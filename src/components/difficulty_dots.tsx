import { getDifficultyBackground } from "../helpers/get_difficulty_background";
import { Difficulty } from "../modules/beatsaver";

export function DifficultyDots(
  { difficulties: diffs, reverse }: {
    difficulties: { difficulty: Difficulty }[];
    reverse?: boolean;
  },
) {
  return (
    <ColoredDots
      reverse={reverse}
      classNames={diffs.map((d) => getDifficultyBackground(d.difficulty))}
    />
  );
}

function ColoredDots({ reverse, classNames }: { reverse?: boolean; classNames: string[] }) {
  const fullColumnIndex = Math.floor(classNames.length / 3) * 3;
  const fullColumnClasses = classNames.slice(0, fullColumnIndex);
  const partialColumnClasses = classNames.slice(fullColumnIndex);
  const offsetCss = reverse ? "translate-x-[0.01em]" : "translate-x-[-0.01em]";

  return (
    <div
      className={`flex flex-col justify-end gap-[0.005em] h-[0.14em] ${
        reverse ? "flex-wrap-reverse" : "flex-wrap"
      }`}
    >
      {fullColumnClasses.map((className, index) => {
        const hasOffset = index % 3 !== 1;
        return (
          <Dot
            key={index}
            className={`${hasOffset ? offsetCss : ""} ${className}`}
          />
        );
      })}
      {partialColumnClasses.map((className, index) => {
        const hasOffset = partialColumnClasses.length === 1 || index === 1;
        return (
          <Dot
            key={index}
            className={`${hasOffset ? offsetCss : ""} ${className}`}
          />
        );
      })}
    </div>
  );
}

function Dot({ className }: { className: string }) {
  return (
    <div className="relative w-[0.042em] h-[0.042em]">
      <div className={`w-full h-full rounded-full ${className}`} />
    </div>
  );
}
