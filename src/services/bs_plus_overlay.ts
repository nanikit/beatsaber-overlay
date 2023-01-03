import { atom, Getter, Setter } from "jotai";
import { Difficulty } from "./beatsaver";
import { loggerAtom } from "./logger";
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
    /** milliseconds */
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

const isNoFailingAtom = atom(false);

export const bsPlusOverlayAtom = atom<OverlayState, string>(
  (get) => get(overlayStateAtom),
  (get, set, value: string) => {
    const message = JSON.parse(value) as BsPlusMessage;
    const previous = get(overlayStateAtom);
    const current = processBsPlusMessage(previous, message, { get, set });
    set(overlayStateAtom, current);
    return current;
  },
);

function processBsPlusMessage(
  previous: OverlayState,
  message: BsPlusMessage,
  { get, set }: { get: Getter; set: Setter },
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

        set(loggerAtom, { level: "info", type: "map_changed", data: { id } });
        set(isNoFailingAtom, false);

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
        };
      case "score":
        const { accuracy, currentHealth } = message.scoreEvent;

        const isNoFailing = get(isNoFailingAtom);
        const isNoFailed = isNoFailing || (() => {
          const diedNow = (previous.scoring?.health ?? 1) > 0 && currentHealth === 0;
          const seemsNoFail = accuracy * 1.9 <= (previous.scoring?.accuracy ?? 0);
          return diedNow && seemsNoFail;
        })();
        if (!isNoFailing && isNoFailed) {
          set(isNoFailingAtom, true);
        }

        return {
          ...previous,
          scoring: {
            accuracy: isNoFailed ? accuracy * 2 : accuracy,
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
