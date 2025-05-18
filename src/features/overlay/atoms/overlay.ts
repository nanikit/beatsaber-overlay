import { atom } from "jotai";
import { bsPlusOverlayAtom } from "../../bs_plus/atoms";
import { siraOverlayAtom } from "../../http_sira_status/atoms";
import { endpointAtom } from "./endpoint";

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
