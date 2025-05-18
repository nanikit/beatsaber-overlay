import { Characteristic, Difficulty } from "../../modules/beatsaver.ts";

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
    // current progress seconds
    & (
      | { resumeTime: number }
      | { pauseTime: number }
    );
};

export type MapInfo = {
  // All endpoints support followings
  hash: string;
  characteristic: Characteristic;
  difficulty: Difficulty;
  coverUrl?: string;
  title: string;
  subtitle?: string;
  artist?: string;
  mapper: string;
  duration?: number;

  // BS+ doesn't have followings
  bpm?: number;
  speed?: number;
  key?: string;
};
