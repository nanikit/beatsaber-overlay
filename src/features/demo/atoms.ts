import { atom } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { BeatsaverMap, getDetailFromIds } from "../../modules/beatsaver";
import { OverlayState } from "../overlay/types";

const emptyState = { readyState: WebSocket.OPEN };

const sampleStates: OverlayState[] = [
  {
    readyState: WebSocket.OPEN,
    mapInfo: {
      characteristic: "Standard",
      difficulty: "ExpertPlus",
      hash: "207cc54d61a787e26da47ce6c0cc45d9608d87fb",
      mapper: "rogdude",
      title: "Käärijä격전Съездбек 愛のモンスター妄语人间",
      subtitle: "Camellia feat. Nanahira",
      artist: "Rogdude & Loloppe",
      coverUrl: "https://eu.cdn.beatsaver.com/207cc54d61a787e26da47ce6c0cc45d9608d87fb.jpg",
      duration: 250,
    },
    scoring: { accuracy: 0.9312, health: 0.3 },
    progress: {
      point: new Date(),
      timeMultiplier: 1,
      resumeTime: 0,
    },
  },
  {
    readyState: WebSocket.OPEN,
    mapInfo: {
      characteristic: "Standard",
      difficulty: "Expert",
      hash: "e03e2fcf6396ede878fbf812e38857a59bdd615e",
      mapper: "misterlihao",
      title: "愛のモンスター",
      subtitle: "covered by fui",
      artist: "Ityo",
      coverUrl: "https://eu.cdn.beatsaver.com/e03e2fcf6396ede878fbf812e38857a59bdd615e.jpg",
      duration: 171,
    },
    scoring: { health: 1.0 },
    progress: {
      point: new Date(),
      timeMultiplier: 1,
      pauseTime: 10,
    },
  },
  {
    readyState: WebSocket.OPEN,
    mapInfo: {
      characteristic: "Standard",
      difficulty: "ExpertPlus",
      // wrong hash
      hash: "5af29356a4f8591d23215f0bacdc6c4d660ef1d0_>_<",
      mapper: "milk",
      title: "Fansa",
      artist: "GOSEGU",
      coverUrl: "https://eu.cdn.beatsaver.com/5af29356a4f8591d23215f0bacdc6c4d660ef1d0.jpg",
      duration: 248,
    },
    scoring: { health: 0.0 },
    progress: {
      point: new Date(),
      timeMultiplier: 2,
      resumeTime: 10,
    },
  },
  {
    readyState: WebSocket.OPEN,
    mapInfo: {
      characteristic: "Standard",
      difficulty: "Expert",
      hash: "8bfe200ce339db24b7ea8120a37aecd5672a3efb",
      mapper: "mapper",
      title: "3 Nen E Gumi Utatan (Nagisa & Kayano & Karuma & Isogai & Maehara)",
      subtitle: "3 Nen E Gumi Utatan (Nagisa & Kayano & Karuma & Isogai & Maehara)",
      artist: "3 Nen E Gumi Utatan (Nagisa & Kayano & Karuma & Isogai & Maehara)",
      coverUrl: "https://eu.cdn.beatsaver.com/8bfe200ce339db24b7ea8120a37aecd5672a3efb.jpg",
      duration: 95,
    },
    scoring: { accuracy: 0.912312, health: 0.5 },
    progress: {
      point: new Date(),
      timeMultiplier: 0,
      resumeTime: 10,
    },
  },
  emptyState,
];

const testMapStatesAtom = atom(sampleStates);
const testMapIndexAtom = atom(0);
const testOverlayStateAtom = atom<OverlayState>(emptyState);
const isTestStatePlayingAtom = atom((get) =>
  "resumeTime" in (get(testOverlayStateAtom).progress ?? {})
);
const testOverlayAtom = withAtomEffect(testOverlayStateAtom, (get, set) => {
  if (get(isTestStatePlayingAtom)) {
    const intervalId = setInterval(updateAccuracy, 200);

    return () => {
      clearInterval(intervalId);
    };
  }

  function updateAccuracy() {
    if (Math.random() < 0.25) {
      return;
    }

    const state = get(testOverlayStateAtom);
    let accuracy = (state.scoring?.accuracy ?? 0.9) + (Math.random() - 0.5) * 0.01;
    accuracy = Math.max(0, Math.min(1, accuracy));
    set(testOverlayStateAtom, { ...state, scoring: { ...state.scoring, accuracy } });
  }
});

export const uiTestOverlayAtom = withAtomEffect(testOverlayAtom, (get, set) => {
  const testParameter = new URLSearchParams(window.location.search).get("query");
  getTestData(testParameter ?? undefined).then((testMapStates) => {
    if (testMapStates && testMapStates.length > 0) {
      set(testMapStatesAtom, testMapStates);
      set(testMapIndexAtom, 0);
      set(testOverlayStateAtom, testMapStates[0]);
    }
  });
});

export const uiTestOverlayClickAtom = atom(null, (get, set) => {
  const states = get(testMapStatesAtom);
  const index = get(testMapIndexAtom);
  const newIndex = (index + 1) % states.length;

  const state = structuredClone(states[newIndex]);
  if (state.progress) {
    state.progress.point = new Date();
  }
  set(testMapIndexAtom, newIndex);
  set(testOverlayStateAtom, state);
});

/** input: map ids separated by comma or beatsaver api subpath comes after /search/text/ */
async function getTestData(testParameter?: string) {
  if (testParameter?.includes("?")) {
    const response = await fetch(`https://beatsaver.com/api/search/text/${testParameter}`);
    const json = await response.json();
    return convertBeatsaverMapsToOverlayStates(json.docs);
  }

  const ids = testParameter?.split(",").filter(Boolean);
  if (ids?.length) {
    const mapRecord = await getDetailFromIds(ids);
    const maps = ids.flatMap((id) => mapRecord[id] ? [mapRecord[id]] : []);
    return convertBeatsaverMapsToOverlayStates(maps);
  }
}

function convertBeatsaverMapsToOverlayStates(maps: BeatsaverMap[]) {
  const infos = maps.map((map) => {
    const { metadata, versions } = map;
    const { levelAuthorName, songName, songAuthorName, songSubName, duration } = metadata;
    const { diffs, coverURL, hash } = versions[0];
    const diff = diffs[Math.floor(Math.random() * diffs.length)];
    return {
      readyState: WebSocket.OPEN,
      mapInfo: {
        characteristic: diff.characteristic,
        difficulty: diff.difficulty,
        // wrong hash
        hash,
        mapper: levelAuthorName,
        title: songName,
        subtitle: songSubName,
        artist: songAuthorName,
        coverUrl: coverURL,
        duration,
      },
      scoring: { health: 1.0 },
      progress: {
        point: new Date(),
        timeMultiplier: 1,
        resumeTime: 0,
      },
    };
  });

  return [...infos, { readyState: WebSocket.OPEN }];
}
