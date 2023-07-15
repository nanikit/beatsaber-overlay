import { useSearchParam } from "react-use";

export function usePalette() {
  return {
    letter: useSearchParam("letter_color") ?? "white",
    outline: useSearchParam("outline_color") ?? "black",
  };
}
