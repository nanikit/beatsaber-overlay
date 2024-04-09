import { atom } from "jotai";
import { BeatsaverMap, getDetailFromId } from "../../modules/beatsaver";
import { Interaction, OverlayState } from "../overlay/types";
import { mount, onMount, unmount } from "../../modules/atom_mount_hook";

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
  {
    readyState: WebSocket.OPEN,
  },
];

const stateAtom = atom(sampleStates[sampleStates.length - 1]);

const statesAtom = atom({
  index: sampleStates.length - 1,
  states: sampleStates,
});

let intervalId = 0;

export const uiTestOverlayAtom = atom(
  (get) => {
    return get(stateAtom);
  },
  async (get, set, value: Interaction) => {
    switch (value) {
      case mount: {
        const testParameter = new URLSearchParams(window.location.search).get("query");
        const appointeds = await getTestData(testParameter ?? undefined);
        if (appointeds && appointeds.length > 0) {
          set(statesAtom, { states: appointeds, index: 0 });
        }
        set(stateAtom, get(statesAtom).states[0]);
        break;
      }
      case "click": {
        const states = get(statesAtom);
        const newIndex = (states.index + 1) % states.states.length;
        set(statesAtom, { ...states, index: newIndex });

        const newState = structuredClone(states.states[newIndex]);
        if (newState.progress) {
          newState.progress.point = new Date();
        }
        set(stateAtom, newState);
        break;
      }
      case unmount:
        break;
    }

    clearInterval(intervalId);
    if ("resumeTime" in (get(stateAtom).progress ?? {})) {
      intervalId = setInterval(() => {
        if (Math.random() < 0.25) {
          return;
        }
        const state = get(stateAtom);
        let accuracy = (state.scoring?.accuracy ?? 0.9) + (Math.random() - 0.5) * 0.01;
        accuracy = Math.max(0, Math.min(1, accuracy));
        set(stateAtom, { ...state, scoring: { ...state.scoring, accuracy } });
      }, 200);
    }
  },
);
uiTestOverlayAtom.onMount = onMount;

async function getTestData(testParameter?: string) {
  if (testParameter?.includes("?")) {
    const response = await fetch(`https://beatsaver.com/api/search/text/${testParameter}`);
    const json = await response.json();
    return beatsaversToStates(json.docs);
  }
  const ids = testParameter?.split(",").filter(Boolean);
  if (ids?.length) {
    const maps = await Promise.all(ids.map(getDetailFromId));
    return beatsaversToStates(maps);
  }
}

function beatsaversToStates(maps: BeatsaverMap[]) {
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
