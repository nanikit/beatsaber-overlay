import { useAtom } from "jotai";
import { useRef, useState } from "react";
import { useQuery } from "react-query";
import { useAsync, usePreviousDistinct, useWindowSize } from "react-use";
import useWebSocket from "react-use-websocket";
import { AutoProgressBar } from "./components/auto_progress_bar";
import { DifficultyLabel } from "./components/difficulty_label";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { TransparentFallbackImg } from "./components/transparent_fallback_img";
import { useTextFit } from "./hooks/use_text_fit";
import { BeatsaverMap, getDataUrlFromHash } from "./services/beatsaver";
import { OverlayState } from "./services/overlay_atom";
import { testableOverlayAtom } from "./services/testable_overlay_atom";
import { timeout } from "./services/utils";

export function App() {
  const [overlayState, updateOverlay] = useAtom(testableOverlayAtom);
  const [state, setState] = useState({
    connect: true,
    retryCount: 0,
  });

  const { readyState } = useWebSocket(
    "ws://localhost:2947/socket",
    {
      onOpen: (event) => {
        console.log(event);
        setState({ ...state, connect: true, retryCount: 0 });
      },
      onMessage: (message: MessageEvent<string>) => {
        updateOverlay(message.data);
      },
      onClose: (event) => {
        console.log(event);
        updateOverlay("disconnected");
      },
      shouldReconnect: () => false,
    },
    state.connect,
  );

  useAsync(async () => {
    if (readyState !== WebSocket.CLOSED) {
      return;
    }

    const retryCount = state.retryCount + 1;
    const delay = Math.min(2 ** retryCount * 1000, 60000);
    console.log(`retryCount: ${retryCount}, retry after ${delay / 1000} seconds`);
    setState({ ...state, connect: false, retryCount });
    await timeout(delay);
    setState({ ...state, connect: true, retryCount });
  }, [readyState]);

  return (
    <main
      className="w-full h-[20vw] text-white p-[1vw] text-[20vw] overflow-hidden"
      onClick={() => updateOverlay("")}
    >
      {overlayState.readyState === WebSocket.OPEN ? (
        <ConnectedOverlay state={overlayState} />
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
  const beatmap = mapQuery.data;

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
                {!!beatmap?.id && (
                  <p className="text-[0.14em] leading-[1] [-webkit-text-stroke:0.035em_black]">
                    !bsr {beatmap.id}
                  </p>
                )}
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
        <TransparentFallbackImg
          src={coverUrl}
          className="z-10 aspect-square object-cover h-full rounded-[0.1em]"
        />
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
