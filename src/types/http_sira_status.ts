export type HttpSiraStatusEvent =
  & {
    /**
     * Event time milliseconds since the epoch.
     * @example 1710512658967
     */
    time: number;
  }
  & (
    | Hello
    | SongStart
    | BeatmapEvent
    | NoteSpawned
    | Missed
    | CutEvent
    | PerformanceEvent
    | PauseResume
    | SoftFailed
    | Menu
  );

export type HttpSiraStatus = {
  /**
   * Event time milliseconds since the epoch.
   * @example 1710512658967
   */
  time: number;
  status: {
    mod: Modifiers;
    game: GameStatus;
    beatmap: Beatmap | null;
    performance: Performance | null;
    playerSettings: PlayerSettings;
  };
  noteCut?: NoteCut;
};

type Hello = {
  event: "hello";
  status: {
    mod: Modifiers;
    game: GameStatus;
    beatmap: Beatmap | null;
    performance: Performance | null;
    playerSettings: PlayerSettings;
  };
  other: {};
};

type SongStart = {
  event: "songStart";
  status: {
    mod: Modifiers;
    game: GameStatus;
    beatmap: Beatmap;
    performance: Performance;
    playerSettings: PlayerSettings;
  };
};

type BeatmapEvent = {
  event: "beatmapEvent";
  beatmapEvent?: BeatmapEventV3 | BeatmapEventV2;
  status?: {
    performance: Performance;
  };
};

type NoteSpawned = {
  event: "noteSpawned";
  noteCut: NoteCut;
};

type Missed = {
  event: "noteMissed" | "bombMissed";
  status: {
    performance: Performance;
  };
  noteCut?: NoteCut;
};

type CutEvent = {
  event: "noteCut" | "noteFullyCut" | "bombCut";
  status: {
    performance: Performance;
  };
  noteCut: NoteCut;
};

type PerformanceEvent = {
  event:
    | "energyChanged"
    | "scoreChanged"
    | "obstacleEnter"
    | "obstacleExit"
    | "failed"
    | "finished";
  status: {
    performance: Performance;
  };
};

type PauseResume = {
  event: "pause" | "resume";
  status: {
    beatmap: Beatmap;
  };
};

type SoftFailed = {
  event: "softFailed";
  status: {
    mod: Modifiers;
    beatmap: null;
    performance: null;
    playerSettings: PlayerSettings;
  };
};

type Menu = {
  event: "menu";
  status: {
    mod: Modifiers;
    game: GameStatus;
    beatmap: null;
    performance: null;
    playerSettings: PlayerSettings;
  };
};

type Modifiers = {
  ghostNotes: boolean;
  noFail: boolean;
  zenMode: boolean;
  songSpeed: "Normal";
  /** @example 1 */
  multiplier: number;
  strictAngles: boolean;
  noBombs: boolean;
  instaFail: boolean;
  fastNotes: boolean;
  batteryLives: null;
  noArrows: boolean;
  /** @example 1 */
  songSpeedMultiplier: number;
  batteryEnergy: boolean;
  proMode: boolean;
  failOnSaberClash: boolean;
  obstacles: "All";
  smallNotes: boolean;
  disappearingArrows: boolean;
};

type GameStatus = {
  scene: "Menu" | "Song";
  /** @example 9.0.3 */
  pluginVersion: string;
  mode: "Unknown" | "SoloStandard";
  /** @example 1.29.1_4575554838 */
  gameVersion: string;
};

type PlayerSettings = {
  autoRestart: boolean;
  environmentEffects: "AllEffects";
  /** @example 1.70000004768372 */
  playerHeight: number;
  noHUD: boolean;
  /** @example 0.699999988079071 */
  sfxVolume: number;
  hideNoteSpawningEffect: boolean;
  /** @example 0.5 */
  saberTrailIntensity: number;
  leftHanded: boolean;
  staticLights: boolean;
  advancedHUD: boolean;
  reduceDebris: boolean;
};

export type Beatmap = {
  characteristic: "Standard" | "OneSaber" | "NoArrows" | "Lightshow" | "Lawless";
  maxRank: SongRank;
  /** @example 1710512779295 */
  start: number;
  /** @example "Chief Queef" */
  levelAuthorName: string;
  /** @example 805 */
  maxScore: number;
  /** @example "custom_level_702C03704023DB107E6AB07CDD9B07CC5AF0B705" */
  levelId: string;
  environmentName: "BigMirrorEnvironment";
  /** @example 0 */
  songTimeOffset: number;
  /** @example 4 */
  notesCount: number;
  /** @example "Small Shock" */
  songName: string;
  /** @example 6.90000009536743 */
  noteJumpSpeed: number;
  /** @example 0 */
  bombsCount: number;
  /** @example 68 */
  songBPM: number;
  /** @example "Toby Fox" */
  songAuthorName: string;
  /**
   * Base64 encoded image
   * @example iVBORw0KGgoAAAANSUh...
   */
  songCover: string;
  /** epoch milliseconds */
  paused: number | null;
  songSubName: string | null;
  /**
   * Milliseconds of song length.
   * @example 16629
   */
  length: number;
  /** @example 3 */
  noteJumpStartBeatOffset: number;
  difficulty: "Easy" | "Normal" | "Hard" | "Expert" | "Expert+";
  color: {
    /** @example [200, 20, 20] */
    saberA: Rgb;
    /** @example [217, 22, 22] */
    environment0: Rgb;
    environment1Boost: null;
    /** @example [40, 142, 210] */
    saberB: Rgb;
    /** @example [255, 255, 255] */
    environmentW: Rgb;
    environmentWBoost: null;
    environment0Boost: null;
    /** @example [255, 48, 48] */
    obstacle: Rgb;
    /** @example [48, 172, 255] */
    environment1: Rgb;
  };
  /** @example 0 */
  obstaclesCount: number;
  /** @example "702C03704023DB107E6AB07CDD9B07CC5AF0B705" */
  songHash: string;
  difficultyEnum: "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";
};

type Rgb = [number, number, number];

export type Performance = {
  /** @example 0 */
  currentSongTime: number;
  /** @example 1 */
  relativeScore: number;
  /** @example 0 */
  multiplier: number;
  /** @example 0 */
  combo: number;
  /** @example 0 */
  maxCombo: number;
  /** @example 0 */
  currentMaxScore: number;
  /** @example 0 */
  lastNoteScore: number;
  /** @example 0 */
  hitNotes: number;
  /** @example 0 */
  missedNotes: number;
  rank: SongRank;
  /** @example 0 */
  passedBombs: number;
  softFailed: boolean;
  /** @example 0 */
  rawScore: number;
  batteryEnergy: null;
  /** @example 0 */
  passedNotes: number;
  /** @example 0 */
  score: number;
  /** @example 0 */
  hitBombs: number;
  /** @example 0 */
  multiplierProgress: number;
  /** @example 0 */
  energy: number;
};

type SongRank = "SS" | "S" | "A" | "B" | "C" | "D" | "E";

type NoteCut = {
  /** @example 0 */
  saberSpeed: number;
  /** @example 0 */
  multiplier: number;
  finalScore: null;
  /** @example 0 */
  sliderTailLine: number;
  /** @example 0 */
  swingRating: number;
  /** @example 0 */
  beforeCutScore: number;
  /** @example 0 */
  cutDirectionDeviation: number;
  gameplayType: "Normal";
  /** @example [0, 0, 0] */
  saberDir: Rgb;
  /** @example 0 */
  sliderHeadLayer: number;
  /** @example 3.52941155433655 */
  timeToNextBasicNote: number;
  noteCutDirection: "Down";
  /** @example 0 */
  cutDistanceToCenter: number;
  /** @example 2 */
  noteLine: number;
  /** @example 0 */
  afterSwingRating: number;
  saberTypeOK: false;
  /** @example 0 */
  noteLayer: number;
  sliderHeadCutDirection: null;
  directionOK: false;
  /** @example 0 */
  timeDeviation: number;
  wasCutTooSoon: false;
  saberType: null;
  /** @example 0 */
  sliderTailLayer: number;
  speedOK: false;
  /** @example [0, 0, 0] */
  cutNormal: Rgb;
  sliderTailCutDirection: null;
  cutDistanceScore: null;
  /** @example 0 */
  afterCutScore: number;
  /** @example 0 */
  beforeSwingRating: number;
  initialScore: null;
  noteType: "NoteB";
  /** @example [0, 0, 0] */
  cutPoint: Rgb;
  /** @example 0 */
  noteID: number;
  /** @example 0 */
  sliderHeadLine: number;
};

type BeatmapEventV3 = BeatmapEventDataV3 & {
  /** @example 68 */
  bpm: number;
  previousSameTypeEventData: BeatmapEventDataV3;
  nextSameTypeEventData: BeatmapEventDataV3;
};

type BeatmapEventDataV3 = {
  version: "3.0.0";
  /** @example -1001 */
  executionOrder: number;
  /** @example -100 */
  time: number;
  /** @example 0 */
  type: number;
};

type BeatmapEventV2 = BeatmapEventDataV2 & {
  previousSameTypeEventData: BeatmapEventDataV2;
  nextSameTypeEventData: BeatmapEventDataV2;
};

type BeatmapEventDataV2 = {
  /** @example 5 */
  value: number;
  version: "2.6.0";
  /** @example 1 */
  floatValue: number;
  /** @example -100 */
  executionOrder: number;
  /** @example 6.05585289001465 */
  time: number;
  /** @example 0 */
  type: number;
};
