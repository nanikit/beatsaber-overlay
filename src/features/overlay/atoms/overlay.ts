import { atom } from "jotai";
import { bsPlusOverlayAtom } from "../../bs_plus/atoms";
import { siraOverlayAtom } from "../../http_sira_status/atoms";
import { endpointAtom } from "./endpoint";
import { Interaction } from "../types";

export const overlayAtom = atom((get) => {
  const endpoint = get(endpointAtom);
  switch (endpoint) {
    case "bsplus":
      return get(bsPlusOverlayAtom);
    case "sirahttpstatus":
      return get(siraOverlayAtom);
    default:
      get(bsPlusOverlayAtom);
      return get(siraOverlayAtom);
  }
}, async (_get, _set, _value: Interaction) => {});

export const mapAtom = atom((get) => {
  const overlay = get(overlayAtom);
  return overlay.mapInfo;
});
