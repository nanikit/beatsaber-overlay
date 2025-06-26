import { atom } from "jotai";
import { filterAlternativeDifficulties } from "../helpers/filter_alternative_difficulties";
import { uiTestOverlayClickAtom } from "./demo";
import { atomWithPrevious } from "./helpers/atomWithPrevious";
import { hideListAtom, isRightLayoutAtom } from "./location";
import { lastMapAtom, mapQueryAtom, overlayAtom } from "./overlay";

export const appAtom = atom(
  (get) => ({ isConnected: get(overlayAtom).readyState === WebSocket.OPEN }),
  (_get, set) => set(uiTestOverlayClickAtom),
);

export const titleAndMakerAtom = atom((get) => {
  const { title, subtitle, artist, mapper } = get(lastMapAtom) ?? {};
  const isRightLayout = get(isRightLayoutAtom);

  return { title, subtitle, artist, mapper, isRightLayout };
});

export const idBpmNjsAtom = atom((get) => {
  const map = get(lastMapAtom);
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

const lastProgressAtom = atomWithPrevious(atom((get) => get(overlayAtom).progress));
const lastScoringAtom = atomWithPrevious(atom((get) => get(overlayAtom).scoring));

export const difficultyTimeAccuracyAtom = atom((get) => {
  const { characteristic, difficulty } = get(lastMapAtom) ?? {};

  const { versions } = get(mapQueryAtom).data ?? {};
  const version = versions?.find((version) => version.hash === get(lastMapAtom)?.hash) ??
    versions?.[versions.length - 1];
  const diff = version?.diffs?.find(
    (diff) => diff.characteristic === characteristic && diff.difficulty === difficulty,
  );

  const difficulties = version?.diffs;
  const alternativeDiffs = difficulties && characteristic && difficulty
    ? filterAlternativeDifficulties({ difficulties, current: { characteristic, difficulty } })
    : [];
  const showOtherDiffs = !get(hideListAtom).has("other_diffs");
  const hasAlternativeDiffs = alternativeDiffs.length > 0;

  return {
    characteristic,
    difficulty,
    diff,
    difficulties,
    alternativeDiffs: hasAlternativeDiffs && showOtherDiffs ? alternativeDiffs : undefined,
  };
});

export const songProgressAtom = atom((get) => {
  const { duration } = get(lastMapAtom) ?? {};
  const progress = get(lastProgressAtom);
  const showProgress = !get(hideListAtom).has("time");

  if (!showProgress || !duration) {
    return undefined;
  }

  const emptyProgress = { point: new Date(), timeMultiplier: 1, pauseTime: 0 };
  return { progress: progress ?? emptyProgress, duration };
});

export const accuracyAtom = atom((get) => {
  const { accuracy, health } = get(lastScoringAtom) ?? {};
  const hideAccuracy = get(hideListAtom).has("acc");
  if (hideAccuracy || accuracy == null) {
    return undefined;
  }

  return { accuracy, health };
});
