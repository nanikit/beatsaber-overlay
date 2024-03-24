import { BsPlusMessage, BsPlusOverlayState, Handshake } from "./types";

export function processBsPlusMessage(
  previous: BsPlusOverlayState,
  message: BsPlusMessage,
): BsPlusOverlayState {
  if (message._type === "handshake") {
    return mergeHandshake(previous, message);
  }

  switch (message._event) {
    case "gameState":
      if (message.gameStateChanged === "Menu") {
        return {
          ...previous,
          mapInfo: undefined,
          scoring: undefined,
          progress: undefined,
        };
      }
      return previous;
    case "mapInfo":
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
    case "score":
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
