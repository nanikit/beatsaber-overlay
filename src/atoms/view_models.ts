import { atom } from "jotai";
import { uiTestOverlayClickAtom } from "./demo";
import { isRightLayoutAtom, mapAtom, overlayAtom } from "./overlay";

export const appAtom = atom(
  (get) => ({ isConnected: get(overlayAtom).readyState === WebSocket.OPEN }),
  (_get, set) => set(uiTestOverlayClickAtom),
);

export const titleAndMakerAtom = atom((get) => {
  const { title, subtitle, artist, mapper } = get(mapAtom) ?? {};
  const isRightLayout = get(isRightLayoutAtom);

  return { title, subtitle, artist, mapper, isRightLayout };
});
