import { atom } from "jotai";
import { Difficulty } from "./beatsaver";
import { OverlayState, overlayStateAtom } from "./overlay_state";

export type BsPlusMessage = Handshake | EventMessage;

type Handshake = {
  _type: "handshake";
  protocolVersion: number;
  gameVersion: string;
  playerName: string;
  playerPlatformId: string;
};

type EventMessage =
  | GameStateEvent
  | MapInfoEvent
  | ResumeEvent
  | PauseEvent
  | ScoreEvent;

type GameStateEvent = {
  _type: "event";
  _event: "gameState";
  gameStateChanged: "Menu" | "Playing";
};

type ResumeEvent = {
  _type: "event";
  _event: "resume";
  resumeTime: number;
};

type PauseEvent = {
  _type: "event";
  _event: "pause";
  pauseTime: number;
};

type ScoreEvent = {
  _type: "event";
  _event: "score";
  scoreEvent: {
    time: number;
    score: number;
    accuracy: number;
    combo: number;
    missCount: number;
    currentHealth: number;
  };
};

type MapInfoEvent = {
  _type: "event";
  _event: "mapInfo";
  mapInfoChanged: {
    /** @example 'custom_level_1C2CC9A3F9880BC99A994A664E65D63CE8616DD0' */
    level_id: string;
    name: string;
    sub_name: string;
    artist: string;
    mapper: string;
    characteristic: "Standard";
    difficulty: Difficulty;
    /** seconds */
    duration: number;
    BPM: number;
    PP: number;
    BSRKey: "";
    /** base64 */
    coverRaw: string;
    /** seconds */
    time: number;
    timeMultiplier: number;
  };
};

export const bsPlusOverlayAtom = atom<OverlayState, string>(
  (get) => get(overlayStateAtom),
  (get, set, value: string) => {
    const message = JSON.parse(value) as BsPlusMessage;
    const previous = get(overlayStateAtom);
    const current = processBsPlusMessage(previous, message);
    set(overlayStateAtom, current);
    return current;
  },
);

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
            hash: id.startsWith("custom_level_") ? id.split("_")[2] : "",
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
