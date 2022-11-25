import { atom } from "jotai";
import { Interaction, overlayAtom } from "./overlay";
import { OverlayState } from "./overlay_state";

const indexAtom = atom(0);

const states: OverlayState[] = [
  {
    readyState: WebSocket.OPEN,
    mapInfo: {
      characteristic: "Standard",
      difficulty: "ExpertPlus",
      hash: "207cc54d61a787e26da47ce6c0cc45d9608d87fb",
      mapper: "rogdude",
      title: "Heeartbeeat Oveerheeat!!!!",
      subtitle: "Camellia feat. Nanahira",
      artist: "Rogdude & Loloppe",
      coverUrl: "https://eu.cdn.beatsaver.com/207cc54d61a787e26da47ce6c0cc45d9608d87fb.jpg",
      duration: 250,
    },
    scoring: { health: 0.3 },
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
      hash: "5af29356a4f8591d23215f0bacdc6c4d660ef1d0",
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
    scoring: { health: 0.5 },
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

const stateAtom = atom(states[0]);

const isTest = new URLSearchParams(window.location.search).get("uiTest");

export const testableOverlayAtom = atom<OverlayState, Interaction>(
  (get) => {
    if (isTest == null) {
      return get(overlayAtom);
    }
    return get(stateAtom);
  },
  (get, set, value) => {
    if (isTest == null) {
      set(overlayAtom, value);
      return;
    }
    if (value !== "click") {
      return;
    }

    const index = get(indexAtom);
    const newIndex = (index + 1) % states.length;
    set(indexAtom, newIndex);

    const newState = structuredClone(states[newIndex]);
    if (newState.progress) {
      newState.progress.point = new Date();
    }
    set(stateAtom, newState);
  },
);
