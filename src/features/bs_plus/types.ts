import { Difficulty } from "../../modules/beatsaver";
import { OverlayState } from "../overlay/types";

export type BsPlusMessage = Handshake | EventMessage;

export type BsPlusOverlayState = OverlayState & { hasSoftFailed: boolean };

export type Handshake = {
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
