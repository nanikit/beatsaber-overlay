import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { IoIosSpeedometer, IoMdSpeedometer } from "react-icons/io";
import { FaDrum } from "react-icons/fa";
import { useQuery } from "react-query";
import { usePreviousDistinct, useSearchParam, useWindowSize } from "react-use";
import { AutoTimeProgress } from "./components/auto_time_progress";
import { DifficultyLabel } from "./components/difficulty_label";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { TransparentFallbackImg } from "./components/transparent_fallback_img";
import { useTextFit } from "./hooks/use_text_fit";
import { BeatsaverMap, getDataUrlFromHash } from "./services/beatsaver";
import { OverlayState } from "./services/overlay_state";
import { testableOverlayAtom } from "./services/test_overlay";

export function App() {
  const [overlay, updateOverlay] = useAtom(testableOverlayAtom);

  useEffect(() => {
    updateOverlay("initialize");
    return () => {
      updateOverlay("cleanUp");
    };
  }, []);

  return (
    <main
      className="w-full h-[20vw] text-white p-[1vw] text-[20vw] overflow-hidden"
      onClick={() => updateOverlay("click")}
    >
      {overlay.readyState === WebSocket.OPEN ? (
        <ConnectedOverlay state={overlay} />
      ) : (
        <DisconnectionWarning />
      )}
    </main>
  );
}

function ConnectedOverlay({ state }: { state: OverlayState }) {
  const isRight = true;
  const showNjs = useSearchParam("njs");
  const showBpm = useSearchParam("bpm");

  const { mapInfo, scoring, progress } = state;
  const previousMap = usePreviousDistinct(mapInfo);
  const lastProgress = usePreviousDistinct(progress);
  const lastScoring = usePreviousDistinct(scoring);

  const { hash, coverUrl, title, subtitle, artist, mapper, characteristic, difficulty, duration } =
    mapInfo ?? previousMap ?? {};
  const mapQuery = useQuery<BeatsaverMap>([getDataUrlFromHash(hash ?? "")], {
    enabled: !!hash,
    staleTime: Infinity,
  });
  const { id, ranked, metadata, versions } = mapQuery.data ?? {};
  const version =
    versions?.find((version) => version.hash === hash) ?? versions?.[versions.length - 1];
  const diff = version?.diffs?.find(
    (diff) => diff.characteristic === characteristic && diff.difficulty === difficulty,
  );

  const { width: vw100 } = useWindowSize();

  const titleRef = useRef<HTMLParagraphElement>(null);
  useTextFit({ ref: titleRef, maxHeight: vw100 * 0.09, maxSize: vw100 * 0.06 });

  const authorRef = useRef<HTMLParagraphElement>(null);
  useTextFit({ ref: authorRef, maxHeight: vw100 * 0.05, maxSize: vw100 * 0.032 });

  return (
    <>
      <div
        className={`w-full h-full transition duration-1000 flex leading-[1.2]${
          isRight ? " flex-row" : " flex-row-reverse"
        }${!mapInfo ? " opacity-0" : ""}`}
      >
        <div className={`z-0 flex-1 overflow-hidden pr-[0.05em]`}>
          <div
            className={`h-full transition duration-500 flex flex-col${isRight ? " items-end" : ""}${
              !mapInfo ? " translate-x-[100%]" : ""
            }`}
          >
            <p
              ref={titleRef}
              className={`flex flex-row flex-wrap gap-[0_0.2em] items-start leading-[1] ${
                isRight ? "justify-end" : ""
              }`}
            >
              <span className="text-[0.5em] [-webkit-text-stroke:0.05em_black] leading-[1.4]">
                {subtitle ?? ""}
              </span>
              <span className="[-webkit-text-stroke:0.03em_black] break-keep text-right">
                {title ?? ""}
              </span>
            </p>
            <div
              className={`flex-1 flex flex-col flex-wrap justify-end ${isRight ? "items-end" : ""}`}
            >
              <p
                ref={authorRef}
                className="text-[0.16em] [-webkit-text-stroke:0.04em_black] text-right"
              >
                {artist} [{mapper}]
              </p>
              <div className="flex items-end gap-[0.1em] mt-[0.03em]">
                <AutoTimeProgress
                  duration={duration ?? 1}
                  progress={progress ?? lastProgress}
                  className={`text-[0.14em] leading-[1] flex [-webkit-text-stroke:0.03em_black] ${
                    (scoring?.health ?? lastScoring?.health ?? 0) > 0
                      ? "[--color-primary:white]"
                      : "[--color-primary:#aaa]"
                  }`}
                />
                <div
                  className={`text-[0.14em] leading-[1] flex gap-[0.71em] transition-opacity${
                    id ? "" : " opacity-0"
                  }`}
                >
                  {showBpm != null && !!metadata?.bpm && (
                    <p className="flex [-webkit-text-stroke:0.03em_black]">
                      <FaDrum className="mr-[0.2em] [stroke-width:2.5%] stroke-[black]" />
                      {metadata?.bpm ?? ""}
                    </p>
                  )}
                  {showNjs != null && !!diff?.njs && (
                    <p className={`flex [-webkit-text-stroke:0.03em_black]`}>
                      <IoIosSpeedometer className="mr-[0.2em] stroke-[black] [stroke-width:2.5%]" />
                      {diff?.njs ?? ""}
                    </p>
                  )}
                  {!!id && <p className="[-webkit-text-stroke:0.035em_black]">!bsr {id}</p>}
                </div>
                {!!difficulty && (
                  <DifficultyLabel difficulty={difficulty} characteristic={characteristic} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="relative aspect-square h-full rounded-[0.1em] overflow-hidden">
          <TransparentFallbackImg src={coverUrl} className="w-full h-full object-cover" />
          {!!ranked && (
            <div
              className={
                `absolute w-[1em] p-[0.03em] bg-purple-600 -rotate-45 top-[0.1em] left-[-0.3em]` +
                ` transition `
              }
            >
              <p className="text-[0.08em] text-center uppercase tracking-[0.15em]">Ranked</p>
            </div>
          )}
        </div>
      </div>
      <div
        className={
          `absolute top-[0.05em] right-[0.05em] w-[0.1em] h-[0.1em] rounded-full` +
          ` bg-gradient-to-br from-green-300 to-emerald-600 animate-[0.2s_ease-in_1s_forwards_onetime-fadeout]`
        }
      />
    </>
  );
}
