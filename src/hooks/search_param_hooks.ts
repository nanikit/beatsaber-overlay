import { useSearchParam } from "react-use";

export function usePalette() {
  return {
    letter: useSearchParam("letter_color") ?? "white",
    outline: useSearchParam("outline_color") ?? "black",
  };
}

export function useIsRightLayout() {
  const layout = useSearchParam("layout");
  return layout !== "left";
}

export function useHideList() {
  const hidesParam = useSearchParam("hide") ?? "";
  return hidesParam.split(",").reduce((acc, x) => acc.add(x), new Set());
}
