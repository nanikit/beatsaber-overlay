import { MapInfo, OverlayState } from "../overlay/types";
import { Beatmap, HttpSiraStatus, HttpSiraStatusEvent, Performance } from "./types";

export function mergeEvent(current: HttpSiraStatus, event: HttpSiraStatusEvent): HttpSiraStatus {
  if ("status" in event && event.status) {
    const { status, ...rest } = event;
    if ("beatmap" in status && status.beatmap) {
      status.beatmap.songCover = `data:image/png;base64,${status.beatmap.songCover}`;
    }
    return { ...current, ...rest, status: { ...current.status, ...status } };
  }
  return { ...current, ...event } as HttpSiraStatus;
}

export function convertStatus(state: HttpSiraStatus): OverlayState {
  const { status: { beatmap, performance }, time } = state;
  return {
    readyState: WebSocket.OPEN,
    mapInfo: convertMapInfo(beatmap),
    scoring: convertToScoring(performance),
    progress: convertToProgress(performance),
  };
}

function convertToScoring(performance: Performance | null): OverlayState["scoring"] {
  if (!performance) {
    return { accuracy: 1, health: 1, score: 0 };
  }

  const { score, relativeScore, energy } = performance;
  return {
    accuracy: relativeScore,
    health: energy,
    score,
  };
}

function convertToProgress(performance: Performance | null): OverlayState["progress"] {
  const { currentSongTime } = performance ?? {};
  return {
    point: new Date(),
    timeMultiplier: 1,
    pauseTime: currentSongTime ?? 0,
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
