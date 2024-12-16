import { useQuery } from "@tanstack/react-query";
import { usePreviousDistinct } from "react-use";
import { TransparentFallbackImg } from "../../../components/transparent_fallback_img";
import { BeatsaverMap, getDataUrlFromHash } from "../../../modules/beatsaver";
import { OverlayState } from "../types";
import { DifficultyTimeAccuracy } from "./difficulty_time_accuracy";
import { IdBpmNjs } from "./id_bpm_njs";
import { TitleAndMaker } from "./title_and_maker";
import { useIsRightLayout } from "../../../hooks/search_param_hooks";

export function ConnectedOverlay({ state }: { state: OverlayState }) {
  const { mapInfo, scoring } = state;

  const previousMap = usePreviousDistinct(mapInfo);
  const lastProgress = usePreviousDistinct(state.progress);
  const lastScoring = usePreviousDistinct(scoring);
  const health = scoring?.health ?? lastScoring?.health;
  const accuracy = scoring?.accuracy ?? lastScoring?.accuracy;

  const map = mapInfo ?? previousMap;
  const { hash, coverUrl, title, subtitle, artist, mapper, characteristic, difficulty, duration } =
    map ?? {};
  const mapQuery = useQuery<BeatsaverMap>({
    queryKey: [getDataUrlFromHash(hash ?? "")],
    enabled: !!hash,
    staleTime: Infinity,
  });

  const isRightLayout = useIsRightLayout();

  const { id, metadata, versions } = mapQuery.data ?? {};
  const version = versions?.find((version) => version.hash === hash) ??
    versions?.[versions.length - 1];
  const diff = version?.diffs?.find(
    (diff) => diff.characteristic === characteristic && diff.difficulty === difficulty,
  );
  const noteJumpSpeed = map?.speed ?? diff?.njs;
  const bpm = map?.bpm ?? metadata?.bpm;
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
            <TitleAndMaker {...{ title, subtitle, artist, mapper }} />
            <div
              className="flex-1 mt-[0.03em] w-full min-h-0 flex flex-col gap-[0.03em_0.12em] justify-end"
              style={isRightLayout
                ? { alignItems: "flex-end", flexWrap: "wrap" }
                : { flexWrap: "wrap-reverse" }}
            >
              <IdBpmNjs {...{ id, bpm, noteJumpSpeed }} />
              <DifficultyTimeAccuracy
                {...{ progress, duration, accuracy, health, characteristic, difficulty, diff }}
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
    <div
      className="absolute top-[0.05em] w-[0.1em] h-[0.1em] rounded-full 
         bg-gradient-to-br from-green-300 to-emerald-600
         animate-[0.2s_ease-in_1s_forwards_onetime-fadeout]"
      style={isRightLayout ? { right: "1vw" } : { left: "1vw" }}
    />
  );
}
