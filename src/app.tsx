import { useQuery } from "react-query";
import { usePreviousDistinct, useRaf, useWindowSize } from "react-use";
import useWebSocket from "react-use-websocket";
import { FittedText } from "./components/fitted_text";
import { useTestOverlay } from "./hooks/use_test_overlay";
import { BeatsaverMap, Characteristic, Difficulty, getDataUrlFromHash } from "./services/beatsaver";
import { OverlayState } from "./services/overlayer";

export function App() {
  const [overlayState, updateOverlay] = useTestOverlay();

  const { readyState } = useWebSocket("ws://localhost:2947/socket", {
    onOpen: () => {
      console.log("Connected!");
    },
    onMessage: (message: MessageEvent<string>) => {
      updateOverlay(message.data);
    },
    shouldReconnect: () => true,
    reconnectAttempts: 24 * 60,
    reconnectInterval: 60000,
  });

  const { mapInfo, scoring, progress } = overlayState;
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
  const isRight = true;

  return (
    <main
      className="text-white p-[1vw] overflow-hidden"
      onClick={() => {
        updateOverlay(0);
      }}
    >
      {!!hash && (
        <div
          className={`w-full h-[20vw] transition delay-200 duration-500 flex text-[20vw]${
            isRight ? " flex-row" : " flex-row-reverse"
          }${!mapInfo ? " opacity-0" : ""}`}
        >
          <div className={`z-0 flex-1 overflow-hidden pr-[0.05em]`}>
            <div
              className={`h-full transition duration-500 flex flex-col${
                isRight ? " items-end" : ""
              }${!mapInfo ? " translate-x-[100%]" : ""}`}
            >
              <FittedText
                options={{ maxHeight: vw100 * 0.1, maxWidth: vw100 * 0.78, maxSize: vw100 * 0.06 }}
              >
                <span
                  className={`flex flex-row flex-wrap gap-[0_0.2em] items-start leading-[1] ${
                    isRight ? "justify-end" : ""
                  }`}
                >
                  {!!subtitle && (
                    <span className="text-[0.5em] [-webkit-text-stroke:0.05em_black] leading-[1.4]">
                      {subtitle}
                    </span>
                  )}
                  <span className="[-webkit-text-stroke:0.03em_black] break-keep text-right">
                    {title}
                  </span>
                </span>
              </FittedText>
              <div
                className={`flex-[1_1_0] flex flex-col flex-wrap justify-end ${
                  isRight ? "items-end" : ""
                }`}
              >
                <p className="text-[0.14em] leading-[1em] [-webkit-text-stroke:0.05em_black] mt-[0.2em]">
                  {artist} [{mapper}]
                </p>
                <div className="flex items-center gap-[0.05em]">
                  <p className="text-[0.14em] leading-[4.4vw] [-webkit-text-stroke:0.15vw_black]">
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
                className={`h-[0.1em] w-full ${
                  (scoring?.health ?? lastScoring?.health ?? 0) > 0
                    ? "[--color-primary:#eee]"
                    : "[--color-primary:#555]"
                }`}
              />
            </div>
          </div>
          <img src={coverUrl} className="z-10 aspect-square object-cover h-full rounded-[2vw]" />
        </div>
      )}
    </main>
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
      return (duration * 1000 - progress.resumeTime) / timeMultiplier;
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
      className={`px-[1.5vw] py-[0.3vw] ${getDifficultyBackground(
        difficulty,
      )} flex items-center gap-[0.1em] rounded-[1em]`}
    >
      {!!characteristic && <img src={getCharacteristicSvg(characteristic)} className="h-[2vw]" />}
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
