import { atom } from "jotai";
import { atomWithLocation } from "jotai-location";
import { atomWithQuery } from "jotai-tanstack-query";
import { BeatsaverMap, getDataUrlFromHash } from "../modules/beatsaver";
import { bsPlusOverlayAtom } from "./bs_plus";
import { uiTestOverlayAtom } from "./demo";
import { endpointAtom } from "./endpoint";
import { siraOverlayAtom } from "./http_sira_status";

const locationAtom = atomWithLocation();

export const overlayAtom = atom((get) => {
  const location = get(locationAtom);

  if (location.pathname === "/test/ui") {
    return get(uiTestOverlayAtom);
  }

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

const hashAtom = atom((get) => get(overlayAtom).mapInfo?.hash);

export const mapAtom = atomWithQuery<BeatsaverMap>((get) => {
  const hash = get(hashAtom);
  return {
    queryKey: [getDataUrlFromHash(hash ?? "")],
    enabled: !!hash,
    staleTime: Infinity,
  };
});
