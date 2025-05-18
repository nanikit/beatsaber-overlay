import { Characteristic, Difficulty } from "../modules/beatsaver";

type Diff = { characteristic: Characteristic; difficulty: Difficulty };

export function filterAlternativeDifficulties(
  { difficulties, current }: { difficulties: Diff[]; current: Diff },
) {
  return difficulties.filter((d) =>
    !isSameDifficulty(d, current) && d.characteristic !== "Lightshow"
  ).slice(0, 9);
}
function isSameDifficulty(d1: Diff, d2: Diff): boolean {
  return d1.characteristic === d2.characteristic && d1.difficulty === d2.difficulty;
}
