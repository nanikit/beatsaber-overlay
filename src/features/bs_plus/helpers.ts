import {
  BsPlusMessage,
  BsPlusOverlayState,
  GameStateEvent,
  Handshake,
  MapInfoEvent,
  ScoreEvent,
} from "./types";

export class BsPlusMessageHandler {
  #state: BsPlusOverlayState = {
    readyState: WebSocket.CLOSED,
    hasSoftFailed: false,
  };

  constructor(private readonly onStateChange: (state: Readonly<BsPlusOverlayState>) => void) {}

  process(message: BsPlusMessage) {
    this.#state = this.#merge(message);
    this.onStateChange(this.#state);
  }

  #merge(message: BsPlusMessage): BsPlusOverlayState {
    const previous = this.#state;

    if (message._type === "handshake") {
      return mergeHandshake(previous, message);
    }

    switch (message._event) {
      case "gameState":
        return mergeGameStateChange(message, previous);
      case "mapInfo":
        return mergeMapInfoEvent(message, previous);
      case "score":
        return mergeScoreEvent(message, previous);
      case "resume":
        return {
          ...previous,
          progress: {
            point: new Date(),
            resumeTime: message.resumeTime,
            timeMultiplier: previous.progress?.timeMultiplier ?? 1,
          },
        };
      case "pause":
        return {
          ...previous,
          progress: {
            point: new Date(),
            pauseTime: message.pauseTime,
            timeMultiplier: previous.progress?.timeMultiplier ?? 1,
          },
        };
      default:
        return previous;
    }
  }
}

function mergeHandshake(previous: BsPlusOverlayState, message: Handshake): BsPlusOverlayState {
  return {
    ...previous,
    readyState: WebSocket.OPEN,
    user: { id: message.playerPlatformId, name: message.playerName },
    mapInfo: undefined,
    scoring: undefined,
    progress: undefined,
  };
}

function mergeMapInfoEvent(message: MapInfoEvent, previous: BsPlusOverlayState) {
  const {
    level_id: id,
    characteristic,
    difficulty,
    coverRaw,
    name,
    sub_name,
    artist,
    mapper,
    duration,
    time,
    timeMultiplier,
  } = message.mapInfoChanged;

  return {
    ...previous,
    mapInfo: {
      hash: id.startsWith("custom_level_") ? id.split("_")[2]?.toLowerCase() : "",
      characteristic,
      difficulty,
      title: name,
      subtitle: sub_name,
      artist,
      mapper,
      coverUrl: coverRaw.startsWith("http") ? coverRaw : `data:image/png;base64,${coverRaw}`,
      duration: duration / 1000,
    },
    progress: {
      point: new Date(),
      resumeTime: time,
      timeMultiplier,
    },
    hasSoftFailed: false,
  };
}

function mergeGameStateChange(message: GameStateEvent, previous: BsPlusOverlayState) {
  if (message.gameStateChanged !== "Menu") {
    return previous;
  }

  return {
    ...previous,
    mapInfo: undefined,
    scoring: undefined,
    progress: undefined,
  };
}

function mergeScoreEvent(message: ScoreEvent, previous: BsPlusOverlayState) {
  const { accuracy, currentHealth, score } = message.scoreEvent;
  const { hasSoftFailed } = previous;

  const isScoreChangedAfterFail = currentHealth === 0 && score !== previous.scoring?.score;
  const isNoFail = hasSoftFailed || isScoreChangedAfterFail;

  return {
    ...previous,
    scoring: {
      accuracy: isNoFail ? accuracy * 2 : accuracy,
      health: message.scoreEvent.currentHealth,
    },
    hasSoftFailed: isNoFail,
  };
}
