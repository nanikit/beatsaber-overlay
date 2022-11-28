import { useAtom } from "jotai";
import { forwardRef, useEffect, useRef } from "react";
import { FaDrum, FaStar } from "react-icons/fa";
import { IoIosSpeedometer } from "react-icons/io";
import { useQuery } from "react-query";
import { usePreviousDistinct, useSearchParam, useWindowSize } from "react-use";
import { AutoTimeProgress } from "./components/auto_time_progress";
import { DifficultyLabel } from "./components/difficulty_label";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { OutlinedParagraph } from "./components/outlined_paragraph";
import { TransparentFallbackImg } from "./components/transparent_fallback_img";
import { useTextFit } from "./hooks/use_text_fit";
import { BeatsaverMap, getDataUrlFromHash } from "./services/beatsaver";
import { OverlayState } from "./services/overlay_state";
import { testableOverlayAtom } from "./services/test_overlay";

export function App() {
  const [overlay, updateOverlay] = useAtom(testableOverlayAtom);
  const layout = useSearchParam("layout");
  const isRight = layout !== "left";

  useEffect(() => {
    updateOverlay("initialize");
    return () => {
      updateOverlay("cleanUp");
    };
  }, []);

  return (
    <main
      className="w-full h-[20vw] text-white p-[1vw] text-[20vw]"
      onClick={() => updateOverlay("click")}
    >
      {overlay.readyState === WebSocket.OPEN ? (
        <ConnectedOverlay state={overlay} isRight={isRight} />
      ) : (
        <DisconnectionWarning isRight={isRight} />
      )}
    </main>
  );
}

function ConnectedOverlay({ state, isRight }: { state: OverlayState; isRight: boolean }) {
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
  const { id, metadata, versions } = mapQuery.data ?? {};
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
          isRight ? " flex-row text-right" : " flex-row-reverse"
        }${mapInfo ? "" : " opacity-0"}`}
      >
        <div
          className={`z-0 flex-1 overflow-clip [overflow-clip-margin:1vw] ${
            isRight ? "pr-[0.05em]" : "pl-[0.05em]"
          }`}
        >
          <div
            className={`h-full transition duration-500 flex flex-col [-webkit-text-stroke:0.5vw_black]${
              isRight ? " items-end" : ""
            }${mapInfo ? "" : isRight ? " translate-x-[100%]" : " translate-x-[-100%]"}`}
          >
            <div
              ref={titleRef}
              className={`flex flex-row flex-wrap gap-[0_0.2em] items-start leading-[1] ${
                isRight ? "justify-end" : ""
              }`}
            >
              <OutlinedParagraph className="text-[0.5em] leading-[1.4]">
                {subtitle ?? ""}
              </OutlinedParagraph>
              <OutlinedParagraph>{title ?? ""}</OutlinedParagraph>
            </div>
            <div
              className={`flex-1 flex flex-col flex-wrap justify-end ${isRight ? "items-end" : ""}`}
            >
              <OutlinedParagraph ref={authorRef} className="text-[0.16em]">
                {artist ?? ""} [{mapper ?? ""}]
              </OutlinedParagraph>
              <div
                className={`flex gap-[0.1em] items-end mt-[0.03em]${
                  isRight ? " flex-row-reverse" : ""
                }`}
              >
                {!!difficulty && (
                  <DifficultyLabel
                    difficulty={difficulty}
                    characteristic={characteristic}
                    className="[-webkit-text-stroke:0]"
                  />
                )}
                <AutoTimeProgress
                  duration={duration ?? 1}
                  progress={progress ?? lastProgress}
                  className={`text-[0.14em] leading-[1] flex ${
                    (scoring?.health ?? lastScoring?.health ?? 0) > 0
                      ? "[--color-primary:white]"
                      : "[--color-primary:#aaa]"
                  }`}
                />
                <div
                  className={`text-[0.14em] leading-[1] flex gap-[0.71em] transition-opacity ${
                    id ? "" : "opacity-0"
                  } ${isRight ? "flex-row-reverse" : ""}`}
                >
                  {!!id && <OutlinedParagraph>!bsr {id}</OutlinedParagraph>}
                  {showBpm != null && !!metadata?.bpm && (
                    <div className="flex">
                      <FaDrum className="mr-[0.3em] [stroke-width:20%] stroke-[black] overflow-visible [paint-order:stroke_fill]" />
                      <OutlinedParagraph>
                        {(Math.round(metadata.bpm * 10) / 10).toFixed(1)}
                      </OutlinedParagraph>
                    </div>
                  )}
                  {showNjs != null && !!diff?.njs && (
                    <div className="flex">
                      <IoIosSpeedometer className="mr-[0.2em] [stroke-width:20%] stroke-[black] overflow-visible [paint-order:stroke_fill]" />
                      <OutlinedParagraph>{diff?.njs ?? ""}</OutlinedParagraph>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative aspect-square h-full rounded-[0.1em] overflow-hidden">
          <TransparentFallbackImg src={coverUrl} className="w-full h-full object-cover" />
          {!!diff?.stars && (
            <div
              className={
                `absolute w-[1em] p-[0.03em] bg-purple-600 -rotate-45 top-[0.1em] left-[-0.3em]` +
                ` transition `
              }
            >
              <p className="text-[0.08em] text-center tracking-[0.12em]">
                {diff.stars}
                <FaStar className="inline text-white" />
              </p>
            </div>
          )}
        </div>
      </div>
      <div
        className={`absolute top-[0.05em] w-[0.1em] h-[0.1em] rounded-full ${
          isRight ? "right-[1vw]" : "left-[1vw]"
        } bg-gradient-to-br from-green-300 to-emerald-600 animate-[0.2s_ease-in_1s_forwards_onetime-fadeout]`}
      />
    </>
  );
}
