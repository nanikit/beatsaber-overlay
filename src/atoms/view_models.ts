import { atom } from "jotai";
import { uiTestOverlayClickAtom } from "./demo";
import { hideListAtom, isRightLayoutAtom } from "./location";
import { mapAtom, mapQueryAtom, overlayAtom } from "./overlay";

export const appAtom = atom(
  (get) => ({ isConnected: get(overlayAtom).readyState === WebSocket.OPEN }),
  (_get, set) => set(uiTestOverlayClickAtom),
);

export const titleAndMakerAtom = atom((get) => {
  const { title, subtitle, artist, mapper } = get(mapAtom) ?? {};
  const isRightLayout = get(isRightLayoutAtom);

  return { title, subtitle, artist, mapper, isRightLayout };
});

export const idBpmNjsAtom = atom((get) => {
  const map = get(mapAtom);
  const mapQuery = get(mapQueryAtom);
  const hideList = get(hideListAtom);

  const { id, metadata, versions } = mapQuery.data ?? {};
  const version = versions?.find((version) => version.hash === map?.hash) ??
    versions?.[versions.length - 1];
  const diff = version?.diffs?.find(
    (diff) => diff.characteristic === map?.characteristic && diff.difficulty === map?.difficulty,
  );
  const noteJumpSpeed = map?.speed ?? diff?.njs;
  const bpm = map?.bpm ?? metadata?.bpm;

  return {
    isLoading: id == null && bpm == null && noteJumpSpeed == null,
    ...(hideList.has("id") ? {} : { id }),
    ...(hideList.has("bpm") ? {} : { bpm }),
    ...(hideList.has("njs") ? {} : { noteJumpSpeed }),
  };
});
