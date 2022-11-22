import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { usePreviousDistinct, useWindowSize } from "react-use";
import { AutoProgressBar } from "./components/auto_progress_bar";
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
  const { id, ranked } = mapQuery.data ?? {};

  const { width: vw100 } = useWindowSize();

  const fittedTextRef = useRef<HTMLParagraphElement>(null);
  useTextFit({ ref: fittedTextRef, maxHeight: vw100 * 0.078, maxSize: vw100 * 0.06 });

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
              ref={fittedTextRef}
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
              <p className="text-[0.16em] [-webkit-text-stroke:0.04em_black] mt-[0.2em]">
                {artist} [{mapper}]
              </p>
              <div className="flex items-end gap-[0.05em] mt-[0.03em]">
                <p
                  className={
                    `text-[0.14em] leading-[1] [-webkit-text-stroke:0.035em_black] transition` +
                    `${id ? "" : " opacity-0"}`
                  }
                >
                  !bsr {id ?? ""}
                </p>
                {!!difficulty && (
                  <DifficultyLabel difficulty={difficulty} characteristic={characteristic} />
                )}
              </div>
            </div>
            <AutoProgressBar
              duration={duration ?? 1}
              progress={progress ?? lastProgress}
              className={`shrink-0 h-[0.07em] mt-[0.04em] w-full ${
                (scoring?.health ?? lastScoring?.health ?? 0) > 0
                  ? "[--color-primary:#eee]"
                  : "[--color-primary:#555]"
              }`}
            />
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
