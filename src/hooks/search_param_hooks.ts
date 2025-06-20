import { useAtomValue } from "jotai";
import { hideListAtom, isRightLayoutAtom, paletteAtom } from "../atoms/location";

export function usePalette() {
  return useAtomValue(paletteAtom);
}

export function useIsRightLayout() {
  return useAtomValue(isRightLayoutAtom);
}

export function useHideList() {
  return useAtomValue(hideListAtom);
}
