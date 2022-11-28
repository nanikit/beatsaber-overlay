import { Characteristic, Difficulty } from "../services/beatsaver";

export function DifficultyLabel({
  characteristic,
  difficulty,
  className,
}: {
  characteristic?: Characteristic;
  difficulty: Difficulty;
  className?: string;
}) {
  const difficultyText = difficulty === "ExpertPlus" ? "Expert+" : difficulty;
  return (
    <div
      className={`px-[0.07em] py-[0.015em] ${getDifficultyBackground(
        difficulty,
      )} flex items-center gap-[0.05em] rounded-[1em] ${className ?? ""}`}
    >
      {!!characteristic && <img src={getCharacteristicSvg(characteristic)} className="h-[0.1em]" />}
      <p className="text-[0.1em]">{difficultyText}</p>
    </div>
  );
}

function getCharacteristicSvg(characteristic: Characteristic) {
  return `/${characteristic.toLowerCase()}.svg`;
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
