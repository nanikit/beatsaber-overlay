import { Characteristic, Difficulty } from "../../modules/beatsaver";

export type Interaction = "initialize" | "click" | "cleanUp";

export type OverlayState = {
  readyState?: number;

  mapInfo?: MapInfo;

  user?: {
    id?: string;
    name?: string;
  };

  scoring?: {
    accuracy?: number;
    health?: number;
    score?: number;
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

export type MapInfo = {
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
