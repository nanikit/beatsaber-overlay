import { useAtomValue } from "jotai";
import { usePreviousDistinct } from "react-use";
import { mapQueryAtom, overlayAtom } from "../atoms/overlay";
import { useIsRightLayout } from "../hooks/search_param_hooks";
import { DifficultyTimeAccuracy } from "./difficulty_time_accuracy";
import { IdBpmNjs } from "./id_bpm_njs";
import { TitleAndMaker } from "./title_and_maker";
import { TransparentFallbackImg } from "./transparent_fallback_img";

export function ConnectedOverlay() {
  const state = useAtomValue(overlayAtom);
  const { mapInfo, scoring } = state;

  const previousMap = usePreviousDistinct(mapInfo);
  const lastProgress = usePreviousDistinct(state.progress);
  const lastScoring = usePreviousDistinct(scoring);
  const health = scoring?.health ?? lastScoring?.health;
  const accuracy = scoring?.accuracy ?? lastScoring?.accuracy;

  const map = mapInfo ?? previousMap;
  const { hash, coverUrl, characteristic, difficulty, duration } = map ?? {};
  const mapQuery = useAtomValue(mapQueryAtom);

  const isRightLayout = useIsRightLayout();

  const { versions } = mapQuery.data ?? {};
  const version = versions?.find((version) => version.hash === hash) ??
    versions?.[versions.length - 1];
  const diff = version?.diffs?.find(
    (diff) => diff.characteristic === characteristic && diff.difficulty === difficulty,
  );
  const progress = state.progress ?? lastProgress;

  return (
    <>
      <div
        className="w-full h-full transition duration-1000 flex leading-[1.2]"
        style={{
          ...(isRightLayout
            ? { flexDirection: "row", textAlign: "right" }
            : { flexDirection: "row-reverse" }),
          ...(mapInfo ? {} : { opacity: 0 }),
        }}
      >
        <div
          className="z-0 h-full flex-1 overflow-clip [overflow-clip-margin:1vw]"
          style={isRightLayout ? { paddingRight: "0.05em" } : { paddingLeft: "0.05em" }}
        >
          <div
            className="h-full flex flex-col [-webkit-text-stroke:0.5vw_black] transition duration-500"
            style={{
              alignItems: isRightLayout ? "flex-end" : "flex-start",
              transform: `translateX(${mapInfo ? 0 : isRightLayout ? "105%" : "-105%"})`,
            }}
          >
            <TitleAndMaker />
            <div
              className="flex-1 mt-[0.03em] w-full min-h-0 flex flex-col gap-[0.03em_0.12em] justify-end"
              style={isRightLayout
                ? { alignItems: "flex-end", flexWrap: "wrap" }
                : { flexWrap: "wrap-reverse" }}
            >
              <IdBpmNjs />
              <DifficultyTimeAccuracy
                {...{
                  progress,
                  duration,
                  accuracy,
                  health,
                  characteristic,
                  difficulty,
                  diff,
                  difficulties: version?.diffs,
                }}
              />
            </div>
          </div>
        </div>
        <div className="relative aspect-square h-full rounded-[0.1em] overflow-hidden">
          <TransparentFallbackImg src={coverUrl} className="w-full h-full object-cover" />
        </div>
      </div>
      <GreenDotFadeOut />
    </>
  );
}

function GreenDotFadeOut() {
  const isRightLayout = useIsRightLayout();

  return (
    // bg-green-500 is @property fallback
    <div
      className="absolute top-[0.05em] w-[0.1em] h-[0.1em] rounded-full 
         bg-green-500 bg-linear-to-br from-green-300 to-emerald-600
         animate-onetime-fadeout"
      style={isRightLayout ? { right: "1vw" } : { left: "1vw" }}
    />
  );
}
