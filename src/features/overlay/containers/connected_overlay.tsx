import { MdFilterCenterFocus } from "react-icons/md";
import { useQuery } from "react-query";
import { usePreviousDistinct } from "react-use";
import { DifficultyLabel } from "../../../components/difficulty_label";
import { MonospaceImitation } from "../../../components/monospace_imitation";
import { OutlinedParagraph } from "../../../components/outlined_paragraph";
import { TransparentFallbackImg } from "../../../components/transparent_fallback_img";
import { useHideList, usePalette } from "../../../hooks/search_param_hooks";
import { BeatsaverMap, getDataUrlFromHash } from "../../../modules/beatsaver";
import { OverlayState } from "../types";
import { IdBpmNjs } from "./id_bpm_njs";
import { SongProgress } from "./song_progress";
import { TitleAndMaker } from "./title_and_maker";

export function ConnectedOverlay({ state, isRight }: { state: OverlayState; isRight: boolean }) {
  const hides = useHideList();

  const { mapInfo, scoring, progress } = state;
  const previousMap = usePreviousDistinct(mapInfo);
  const lastProgress = usePreviousDistinct(progress);
  const lastScoring = usePreviousDistinct(scoring);
  const health = scoring?.health ?? lastScoring?.health;
  const accuracy = scoring?.accuracy ?? lastScoring?.accuracy;

  const map = mapInfo ?? previousMap;
  const { hash, coverUrl, title, subtitle, artist, mapper, characteristic, difficulty, duration } =
    map ?? {};
  const mapQuery = useQuery<BeatsaverMap>([getDataUrlFromHash(hash ?? "")], {
    enabled: !!hash,
    staleTime: Infinity,
  });
  const { id, metadata, versions } = mapQuery.data ?? {};
  const version = versions?.find((version) => version.hash === hash) ??
    versions?.[versions.length - 1];
  const diff = version?.diffs?.find(
    (diff) => diff.characteristic === characteristic && diff.difficulty === difficulty,
  );
  const noteJumpSpeed = map?.speed ?? diff?.njs;
  const bpm = map?.bpm ?? metadata?.bpm;

  const { letter, outline } = usePalette();

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
            }${mapInfo ? "" : isRight ? " translate-x-[105%]" : " translate-x-[-105%]"}`}
          >
            <TitleAndMaker {...{ title, subtitle, artist, mapper }} />
            <div
              className={`flex-1 mt-[0.03em] w-full min-h-0 flex flex-col gap-[0.03em_0.12em] justify-end ${
                isRight ? "items-end flex-wrap" : "flex-wrap-reverse"
              }`}
            >
              <IdBpmNjs {...{ id, bpm, noteJumpSpeed }} />
              <div className={`flex gap-[0.1em] items-center${isRight ? " flex-row-reverse" : ""}`}>
                {!!difficulty && (
                  <DifficultyLabel
                    difficulty={difficulty}
                    characteristic={characteristic}
                    stars={diff?.stars}
                    label={diff?.label}
                    className="[-webkit-text-stroke:0]"
                  />
                )}
                {!hides.has("time") && (
                  <SongProgress
                    duration={duration ?? 1}
                    progress={progress ?? lastProgress}
                    className={`flex leading-[1] text-[0.12em]`}
                  />
                )}
                <div
                  className={`text-[0.12em] leading-[1] flex ${
                    !hides.has("acc") && accuracy != null ? "" : "hidden"
                  }`}
                >
                  <MdFilterCenterFocus
                    className="center-icon mr-[0.4em] [stroke-width:10%] overflow-visible [paint-order:stroke_fill]"
                    stroke={outline}
                    fill={letter}
                  />
                  <OutlinedParagraph
                    className={`flex`}
                    innerClassName={`${(health ?? 0) > 0 ? "" : "brightness-[0.8]"}`}
                  >
                    <MonospaceImitation>
                      {(Math.floor((accuracy ?? 1) * 1000) / 10).toFixed(1)}
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
