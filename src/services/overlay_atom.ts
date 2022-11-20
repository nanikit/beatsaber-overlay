import { atom, Setter } from "jotai";
import type { Characteristic, Difficulty } from "./beatsaver";
import { BsPlusMessage } from "./bs_plus_overlay";

export type OverlayState = {
  readyState?: number;

  mapInfo?: {
    hash: string;
    characteristic: Characteristic;
    difficulty: Difficulty;
    coverUrl?: string;
    title: string;
    subtitle?: string;
    artist?: string;
    mapper: string;
    duration?: number;
  };

  user?: {
    id?: string;
    name?: string;
  };

  scoring?: {
    accuracy?: number;
    health?: number;
  };

  progress?:
    & {
      point: Date;
      timeMultiplier: number;
    }
    & ({ resumeTime: number } | {
      pauseTime: number;
    });
};

export const overlayStateAtom = atom<OverlayState>({});

export const overlayAtom = atom<OverlayState, string>(
  (get) => get(overlayStateAtom),
  (get, set, value: string) => {
    if (processGeneralMessage(value, set)) {
      return;
    }

    const message = JSON.parse(value) as BsPlusMessage;
    const previous = get(overlayStateAtom);
    const current = processBsPlusMessage(previous, message);
    set(overlayStateAtom, current);
    return current;
  },
);

function processGeneralMessage(value: string, set: Setter): boolean {
  switch (value) {
    case "":
      return true;
    case "disconnected":
      set(overlayStateAtom, { readyState: WebSocket.CLOSED });
      return true;
  }
  return false;
}

function processBsPlusMessage(
  previous: OverlayState,
  message: BsPlusMessage,
): OverlayState {
  if (message._type === "handshake") {
    return {
      ...previous,
      readyState: WebSocket.OPEN,
      user: { id: message.playerPlatformId, name: message.playerName },
      mapInfo: undefined,
      scoring: undefined,
      progress: undefined,
    };
  } else {
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
          artist,
          mapper,
          duration,
          time,
          timeMultiplier,
        } = message.mapInfoChanged;
        return {
          ...previous,
          mapInfo: {
            hash: id.replace("custom_level_", ""),
            characteristic,
            difficulty,
            title: name,
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
        };
      case "score":
        return {
          ...previous,
          scoring: {
            accuracy: message.scoreEvent.accuracy,
            health: message.scoreEvent.currentHealth,
          },
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
}
