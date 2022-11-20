import { useAtom } from "jotai";
import { DetailedHTMLProps, ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useAsync, usePreviousDistinct, useRaf, useWindowSize } from "react-use";
import useWebSocket from "react-use-websocket";
import { useTextFit } from "./components/fitted_text";
import { BeatsaverMap, Characteristic, Difficulty, getDataUrlFromHash } from "./services/beatsaver";
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
      onClose: console.log,
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
    console.log(`retryCount: ${retryCount}, retrying after ${delay}ms`);
    setState({ ...state, connect: false, retryCount });
    await timeout(delay);
    setState({ ...state, connect: true, retryCount });
  }, [readyState]);

  return (
    <main
      className="w-full h-[20vw] text-white p-[1vw] text-[20vw] overflow-hidden"
      onClick={() => updateOverlay("")}
    >
      {readyState === WebSocket.OPEN ? (
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

  const fittedTextRef = useRef<HTMLElement>(null);
  useTextFit({ ref: fittedTextRef, maxHeight: vw100 * 0.1, maxSize: 70 }, [title, subtitle]);

  if (!hash) {
    return (
      <div
        className={
          `absolute top-[0.05em] right-[0.05em] w-[0.1em] h-[0.1em] rounded-full` +
          ` bg-gradient-to-br from-green-300 to-emerald-600 animate-[0.2s_ease-in_1s_forwards_onetime-fadeout]`
        }
      />
    );
  }

  return (
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
          <span
            ref={fittedTextRef}
            className={`flex-1 flex flex-row flex-wrap gap-[0_0.2em] items-start leading-[1] ${
              isRight ? "justify-end" : ""
            }`}
          >
            <span className="text-[0.5em] [-webkit-text-stroke:0.05em_black] leading-[1.4]">
              {beatmap?.metadata?.songSubName ?? subtitle ?? ""}
            </span>
            <span className="[-webkit-text-stroke:0.03em_black] break-keep text-right">
              {beatmap?.metadata?.songName ?? title}
            </span>
          </span>
          <div className={`flex flex-col flex-wrap justify-end ${isRight ? "items-end" : ""}`}>
            <p className="text-[0.14em] [-webkit-text-stroke:0.05em_black] mt-[0.2em]">
              {artist} [{mapper}]
            </p>
            <div className="flex items-end gap-[0.05em] mt-[0.03em]">
              <p className="text-[0.14em] leading-[1] [-webkit-text-stroke:0.05em_black]">
                !bsr {beatmap?.id}
              </p>
              {!!difficulty && (
                <DifficultyLabel difficulty={difficulty} characteristic={characteristic} />
              )}
            </div>
          </div>
          <AutoProgressBar
            duration={duration ?? 1}
            progress={progress ?? lastProgress}
            className={`h-[0.07em] mt-[0.04em] w-full ${
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
  );
}

function DisconnectionWarning() {
  const [state, setState] = useState({ isHovering: false });
  const { isHovering } = state;

  return (
    <div
      onMouseEnter={() => {
        setState({ ...state, isHovering: true });
      }}
      onMouseLeave={() => {
        setState({ ...state, isHovering: false });
      }}
      className={
        `absolute top-[1vw] right-[1vw] rounded-full transition-all overflow-hidden` +
        ` bg-gradient-to-br from-yellow-300 to-orange-600` +
        ` ${isHovering ? "w-[1.8em] h-[0.25em]" : "w-[0.1em] h-[0.1em]"}`
      }
    >
      {isHovering && (
        <div className="text-[0.08em] flex flex-col flex-nowrap items-center">
          <p>BS+ song overlay is not connected.</p>
          <p>It'll reconnect within 1 minutes.</p>
        </div>
      )}
    </div>
  );
}

function TransparentFallbackImg({
  src,
  ...props
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const transparent =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const [state, setState] = useState({ hasError: false });

  useEffect(() => {
    setState({ ...state, hasError: false });
  }, [src]);

  return (
    <img
      onError={() => {
        setState({ hasError: true });
      }}
      src={state.hasError ? transparent : src}
      {...props}
    />
  );
}

const emptyProgress = { point: new Date(), timeMultiplier: 1, pauseTime: 0 };

function AutoProgressBar({
  progress: inputProgress,
  duration,
  ...props
}: {
  progress: OverlayState["progress"];
  duration: number;
  className: string;
}) {
  const progress = inputProgress ?? emptyProgress;
  const { point, timeMultiplier } = progress;

  const remainingMs = (() => {
    if ("resumeTime" in progress) {
      return ((duration - progress.resumeTime) * 1000) / timeMultiplier;
    }
  })();
  useRaf(remainingMs);

  const ratio = (() => {
    if ("resumeTime" in progress) {
      const elapsedSeconds = (new Date().getTime() - point.getTime()) / 1000;
      return (progress.resumeTime + elapsedSeconds) / duration;
    }
    return progress.pauseTime / duration;
  })();
  console.log(ratio);
  return <ProgressBar ratio={ratio} {...props} />;
}

function ProgressBar({ ratio, className }: { ratio: number; className?: string }) {
  return (
    <div
      className={`relative border-[0.01em] w-full border-[var(--color-primary)] ${className ?? ""}`}
    >
      <div
        className={`absolute top-0 left-0 h-full bg-[var(--color-primary)]`}
        style={{
          width: `${Math.min(ratio, 1) * 100}%`,
        }}
      />
    </div>
  );
}

function DifficultyLabel({
  characteristic,
  difficulty,
}: {
  characteristic?: Characteristic;
  difficulty: Difficulty;
}) {
  const difficultyText = difficulty === "ExpertPlus" ? "Expert+" : difficulty;
  return (
    <div
      className={`px-[0.07em] py-[0.015em] ${getDifficultyBackground(
        difficulty,
      )} flex items-center gap-[0.05em] rounded-[1em]`}
    >
      {!!characteristic && <img src={getCharacteristicSvg(characteristic)} className="h-[0.1em]" />}
      <p className="text-[0.1em]">{difficultyText}</p>
    </div>
  );
}

function getCharacteristicSvg(characteristic: Characteristic) {
  return `/${characteristic.toLowerCase()}.svg`;
}

function getDifficultyBackground(difficulty: Difficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-700";
    case "Normal":
      return "bg-sky-700";
    case "Hard":
      return "bg-amber-700";
    case "Expert":
      return "bg-red-700";
    case "ExpertPlus":
      return "bg-purple-700";
  }
}
