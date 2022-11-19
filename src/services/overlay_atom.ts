import { atom } from "jotai";
import type { Characteristic, Difficulty } from "./beatsaver";
import { BsPlusMessage } from "./bs_plus_overlay";

export type OverlayState = {
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

  progress?: {
    point: Date;
    timeMultiplier: number;
  } & ({ resumeTime: number } | { pauseTime: number });
};

export const overlayStateAtom = atom<OverlayState>({});

export const overlayAtom = atom<OverlayState, string>(
  (get) => get(overlayStateAtom),
  (get, set, value: string) => {
    if (!value) {
      return;
    }

    const previous = get(overlayStateAtom);
    const message = JSON.parse(value) as BsPlusMessage;
    const current = updateState(previous, message);
    console.log(previous, message, current);
    set(overlayStateAtom, current);
    return current;
  },
);

function updateState(
  previous: OverlayState,
  message: BsPlusMessage,
): OverlayState {
  if (message._type === "handshake") {
    return { user: { id: message.playerPlatformId, name: message.playerName } };
  } else {
    switch (message._event) {
      case "gameState":
        if (message.gameStateChanged === "Menu") {
          return {
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
            coverUrl: coverRaw.startsWith("http")
              ? coverRaw
              : `data:image/png;base64,${coverRaw}`,
            duration,
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
    }
  }
}
