import { atom } from "jotai";
import { overlayAtom, OverlayState, overlayStateAtom } from "./overlay_atom";

const indexAtom = atom(0);

const testOverlayStateAtom = atom<OverlayState>({
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
    duration: 20,
  },
  scoring: { health: 0 },
  progress: {
    point: new Date(),
    timeMultiplier: 1,
    pauseTime: 4,
  },
});

const isTest = new URLSearchParams(window.location.search).get("uiTest");

export const testableOverlayAtom = atom<OverlayState, string>(
  (get) => {
    if (isTest == null) {
      return get(overlayAtom);
    }
    return get(testOverlayStateAtom);
  },
  (get, set, value) => {
    if (isTest == null) {
      set(overlayAtom, value);
      return;
    }
    if (value === "disconnected") {
      return;
    }

    const states: OverlayState[] = [
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
          duration: 20,
        },
        scoring: { health: 0.5 },
        progress: {
          point: new Date(),
          timeMultiplier: 1,
          resumeTime: 10,
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
          duration: 20,
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
          hash: "207cc54d61a787e26da47ce6c0cc45d9608d87fb",
          mapper: "rogdude",
          title: "Heeartbeeat Oveerheeat!!!!",
          subtitle: "Camellia feat. Nanahira",
          artist: "Rogdude & Loloppe",
          coverUrl: "https://eu.cdn.beatsaver.com/207cc54d61a787e26da47ce6c0cc45d9608d87fb.jpg",
          duration: 20,
        },
        scoring: { health: 0 },
        progress: {
          point: new Date(),
          timeMultiplier: 2,
          resumeTime: 4,
        },
      },
      {
        readyState: WebSocket.OPEN,
      },
    ];

    const index = get(indexAtom);
    const newIndex = (index + 1) % states.length;
    set(indexAtom, newIndex);
    set(testOverlayStateAtom, states[newIndex]);

    return states[newIndex];
  },
);
