import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { FaDrum, FaKey, FaStar } from "react-icons/fa";
import { IoIosSpeedometer } from "react-icons/io";
import { MdFilterCenterFocus } from "react-icons/md";
import { useQuery } from "react-query";
import { usePreviousDistinct, useSearchParam, useWindowSize } from "react-use";
import { AutoTimeProgress } from "./components/auto_time_progress";
import { DifficultyLabel } from "./components/difficulty_label";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { MonospaceImitation } from "./components/monospace_imitation";
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
  const hidesParam = useSearchParam("hide") ?? "";
  const hides = hidesParam.split(",").reduce((acc, x) => acc.add(x), new Set());

  const { mapInfo, scoring, progress } = state;
  const previousMap = usePreviousDistinct(mapInfo);
  const lastProgress = usePreviousDistinct(progress);
  const lastScoring = usePreviousDistinct(scoring);
  const health = scoring?.health ?? lastScoring?.health;
  const accuracy = scoring?.accuracy ?? lastScoring?.accuracy;

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
  useTextFit({ ref: titleRef, maxHeight: vw100 * 0.09, maxSize: vw100 * 0.038 });

  const authorRef = useRef<HTMLParagraphElement>(null);
  useTextFit({ ref: authorRef, maxHeight: vw100 * 0.04, maxSize: vw100 * 0.0225 });

  return (
    <>
      <div
        className={`w-full h-full transition duration-1000 flex leading-[1.2]${
          isRight ? " flex-row text-right" : " flex-row-reverse"
        }${mapInfo ? "" : " opacity-0"}`}
      >
        <div
          className={`z-0 h-full flex-1 overflow-clip [overflow-clip-margin:1vw] ${
            isRight ? "pr-[0.05em]" : "pl-[0.05em]"
          }`}
        >
          <div
            className={`h-full flex flex-col [-webkit-text-stroke:0.5vw_black] transition duration-500 ${
              isRight ? "items-end" : "items-start"
            }${mapInfo ? "" : isRight ? " translate-x-[100%]" : " translate-x-[-100%]"}`}
          >
            <div
              ref={titleRef}
              className={`flex flex-wrap justify-end gap-[0_0.4em] leading-[1] ${
                isRight ? "flex-row items-start" : "flex-row-reverse items-end"
              }`}
            >
              <OutlinedParagraph className="text-[0.5em] leading-[1.4]">
                {subtitle ?? ""}
              </OutlinedParagraph>
              <OutlinedParagraph>{title ?? ""}</OutlinedParagraph>
            </div>
            <OutlinedParagraph ref={authorRef} className="text-[0.16em] mt-[0.3em]">
              {artist ?? ""} [{mapper ?? ""}]
            </OutlinedParagraph>
            <div
              className={`flex-1 mt-[0.03em] w-full min-h-0 flex flex-col gap-[0.03em_0.12em] justify-end ${
                isRight ? "items-end flex-wrap" : "flex-wrap-reverse"
              }`}
            >
              <div
                className={`text-[0.12em] leading-[1] flex gap-[1em] transition-opacity ${
                  id ? "" : "opacity-0"
                } ${isRight ? "flex-row-reverse" : ""}`}
              >
                {!hides.has("id") && !!id && (
                  <div className="flex">
                    <FaKey className="text-[0.8em] mr-[0.5em] [stroke-width:20%] stroke-[black] overflow-visible [paint-order:stroke_fill] [transform:translateY(10%)]" />
                    <OutlinedParagraph>{id}</OutlinedParagraph>
                  </div>
                )}
                {!hides.has("bpm") && !!metadata?.bpm && (
                  <div className="flex">
                    <FaDrum className="text-[0.9em] mr-[0.5em] [stroke-width:20%] stroke-[black] overflow-visible [paint-order:stroke_fill]" />
                    <OutlinedParagraph>{Math.round(metadata.bpm * 10) / 10}</OutlinedParagraph>
                  </div>
                )}
                {!hides.has("njs") && !!diff?.njs && (
                  <div className="flex">
                    <IoIosSpeedometer className="text-[1.0em] mr-[0.4em] [stroke-width:20%] stroke-[black] overflow-visible [paint-order:stroke_fill]" />
                    <OutlinedParagraph>{diff?.njs ?? ""}</OutlinedParagraph>
                  </div>
                )}
              </div>
              <div className={`flex gap-[0.1em] items-end${isRight ? " flex-row-reverse" : ""}`}>
                {!!difficulty && (
                  <DifficultyLabel
                    difficulty={difficulty}
                    characteristic={characteristic}
                    className="[-webkit-text-stroke:0]"
                  />
                )}
                {!hides.has("time") && (
                  <AutoTimeProgress
                    duration={duration ?? 1}
                    progress={progress ?? lastProgress}
                    className={`text-[0.12em] leading-[1] flex ${
                      (health ?? 0) > 0 ? "[--color-primary:white]" : "[--color-primary:#aaa]"
                    }`}
                  />
                )}
                <div
                  className={`text-[0.12em] leading-[1] flex ${
                    !hides.has("acc") && accuracy ? "" : "hidden"
                  }`}
                >
                  <MdFilterCenterFocus className="center-icon mr-[0.4em] [stroke-width:10%] stroke-[black] overflow-visible [paint-order:stroke_fill]" />
                  <OutlinedParagraph className="flex">
                    <MonospaceImitation>
                      {`${((accuracy ?? 1) * 100).toFixed(1)}`}
                    </MonospaceImitation>
                    %
                  </OutlinedParagraph>
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
