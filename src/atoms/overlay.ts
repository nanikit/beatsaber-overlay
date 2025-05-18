import { atom } from "jotai";
import { bsPlusOverlayAtom } from "./bs_plus";
import { endpointAtom } from "./endpoint";
import { siraOverlayAtom } from "./http_sira_status";

export const overlayAtom = atom((get) => {
  const endpoint = get(endpointAtom);
  switch (endpoint) {
    case "bsPlus":
      return get(bsPlusOverlayAtom);
    case "siraHttpStatus":
      return get(siraOverlayAtom);
    default:
      get(bsPlusOverlayAtom);
      return get(siraOverlayAtom);
  }
});

export const mapAtom = atom((get) => {
  const overlay = get(overlayAtom);
  return overlay.mapInfo;
});
