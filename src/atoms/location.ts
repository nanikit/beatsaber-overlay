import { atom } from "jotai";
import { atomWithLocation } from "jotai-location";

export const locationAtom = atomWithLocation();

export const isRightLayoutAtom = atom((get) =>
  get(locationAtom).searchParams?.get("layout") !== "left"
);

export const paletteAtom = atom((get) => {
  const { searchParams } = get(locationAtom);
  const letter = searchParams?.get("letter_color") ?? "white";
  const outline = searchParams?.get("outline_color") ?? "black";
  return { letter, outline };
});

export const hideListAtom = atom((get) => {
  const { searchParams } = get(locationAtom);
  const hide = searchParams?.get("hide") ?? "";
  return hide.split(",").reduce((acc, x) => acc.add(x), new Set());
});
