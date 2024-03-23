import { MapInfo, OverlayState } from "../overlay/types";
import { Beatmap, HttpSiraStatus, HttpSiraStatusEvent, Performance } from "./types";

export function mergeEvent(current: HttpSiraStatus, event: HttpSiraStatusEvent): HttpSiraStatus {
  if ("status" in event && event.status) {
    const { status, ...rest } = event;
    if ("beatmap" in status && status.beatmap) {
      status.beatmap.songCover = getMapCoverUrl(status.beatmap.songCover);
    }
    return { ...current, ...rest, status: { ...current.status, ...status } };
  }
  return { ...current, ...event } as HttpSiraStatus;
}

export function convertStatus(state: HttpSiraStatus): OverlayState {
  const { status: { beatmap, performance } } = state;
  return {
    readyState: WebSocket.OPEN,
    mapInfo: convertMapInfo(beatmap),
    scoring: convertToScoring(performance),
    progress: convertToProgress(performance, beatmap?.paused != null),
  };
}

function getMapCoverUrl(base64OrUrl: string): string {
  if (base64OrUrl.startsWith("http")) {
    return base64OrUrl;
  }
  return `data:image/png;base64,${base64OrUrl}`;
}

function convertToScoring(performance: Performance | null): OverlayState["scoring"] {
  if (!performance) {
    return;
  }

  const { score, relativeScore, energy, softFailed } = performance;
  return {
    accuracy: relativeScore,
    health: softFailed ? 0 : energy,
    score,
  };
}

function convertToProgress(
  performance: Performance | null,
  paused: boolean,
): OverlayState["progress"] {
  const currentSongTime = performance?.currentSongTime ?? 0;
  return {
    point: new Date(),
    timeMultiplier: 0.5,
    ...(paused ? { pauseTime: currentSongTime } : { resumeTime: currentSongTime }),
  };
}

function convertMapInfo(beatmap: Beatmap | null): MapInfo | undefined {
  if (!beatmap) {
    return;
  }

  const {
    songHash,
    characteristic,
    difficultyEnum,
    songCover,
    songName,
    songSubName,
    songAuthorName,
    levelAuthorName,
    length,
    songBPM,
    noteJumpSpeed,
  } = beatmap;

  return {
    hash: songHash,
    characteristic: characteristic,
    difficulty: difficultyEnum,
    coverUrl: songCover,
    title: songName,
    subtitle: songSubName ?? undefined,
    artist: songAuthorName,
    mapper: levelAuthorName,
    duration: length / 1000,
    bpm: songBPM,
    speed: noteJumpSpeed,
  };
}
