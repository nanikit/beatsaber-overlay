export type Difficulty = "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";

export type Characteristic =
  | "Standard"
  | "OneSaber"
  | "90Degree"
  | "360Degree"
  | "NoArrows"
  | "Lawless"
  | "Lightshow";

export type BeatsaverMap = {
  id: string;
  name: string;
  description: string;
  uploader: {
    id: number;
    name: string;
    uniqueSet: boolean;
    hash: string;
    avatar: string;
    type: string;
  };
  metadata: {
    bpm: number;
    /** integer seconds */
    duration: number;
    songName: string;
    songSubName: string;
    songAuthorName: string;
    levelAuthorName: string;
  };
  stats: {
    plays: number;
    downloads: number;
    upvotes: number;
    downvotes: number;
    score: number;
  };
  uploaded: string;
  automapper: boolean;
  ranked: boolean;
  qualified: boolean;
  versions: {
    hash: string;
    key: string;
    state: string;
    createdAt: string;
    sageScore: number;
    diffs: {
      njs: number;
      offset: number;
      notes: number;
      bombs: number;
      obstacles: number;
      nps: number;
      length: number;
      characteristic: Characteristic;
      difficulty: Difficulty;
      events: number;
      chroma: boolean;
      me: boolean;
      ne: boolean;
      cinema: boolean;
      seconds: number;
      paritySummary: {
        errors: number;
        warns: number;
        resets: number;
      };
      stars?: number;
      maxScore?: number;
      label?: string;
    }[];
    downloadURL: string;
    coverURL: string;
    previewURL: string;
  }[];
  createdAt: string;
  updatedAt: string;
  lastPublishedAt: string;
};

export const getDataUrlFromHash = (hash: string) => `https://beatsaver.com/api/maps/hash/${hash}`;

export const getMapFromHash = async (hash: string): Promise<BeatsaverMap> => {
  const response = await fetch(getDataUrlFromHash(hash));
  return response.json();
};

export async function getDetailFromIds(ids: string[]): Promise<Record<string, BeatsaverMap>> {
  const response = await fetch(`https://beatsaver.com/api/maps/ids/${ids.join(",")}`);
  return response.json();
}
