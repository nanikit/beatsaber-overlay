import { Difficulty } from "../modules/beatsaver";

export function getDifficultyBackground(difficulty: Difficulty) {
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
