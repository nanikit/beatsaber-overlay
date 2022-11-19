import { atom } from "jotai";
import { overlayStateAtom, overlayAtom, OverlayState } from "./overlay_atom";

const indexAtom = atom(0);

const testOverlayAtom = atom<OverlayState, unknown>(
  (get) => get(overlayStateAtom),
  (get, set, _) => {
    const states: OverlayState[] = [
      {
        mapInfo: {
          characteristic: "Standard",
          difficulty: "ExpertPlus",
          hash: "5af29356a4f8591d23215f0bacdc6c4d660ef1d0",
          mapper: "miiilk",
          title: "Fansa (팬서비스)",
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
        mapInfo: {
          characteristic: "Standard",
          difficulty: "ExpertPlus",
          hash: "5af29356a4f8591d23215f0bacdc6c4d660ef1d0",
          mapper: "miiilk",
          title: "Fansa",
          subtitle: "고세구 cover (ISEGYE Idol 이세계 아이돌)",
          artist: "GOSEGU",
          coverUrl: "https://eu.cdn.beatsaver.com/5af29356a4f8591d23215f0bacdc6c4d660ef1d0.jpg",
          duration: 20,
        },
        scoring: { health: 0.0 },
        progress: {
          point: new Date(),
          timeMultiplier: 1,
          resumeTime: 0.101,
        },
      },
      {
        mapInfo: {
          characteristic: "Standard",
          difficulty: "ExpertPlus",
          hash: "5af29356a4f8591d23215f0bacdc6c4d660ef1d0",
          mapper: "miiilk",
          title: "Fansa (팬서비스) (팬서비스) (팬서비스)",
          subtitle: "고세구 cover (ISEGYE Idol 이세계 아이돌)",
          artist: "GOSEGU",
          coverUrl: "https://eu.cdn.beatsaver.com/5af29356a4f8591d23215f0bacdc6c4d660ef1d0.jpg",
          duration: 20,
        },
        scoring: { health: 1.0 },
        progress: {
          point: new Date(),
          timeMultiplier: 1,
          pauseTime: 10,
        },
      },
      {},
    ];

    const index = get(indexAtom);
    const newIndex = (index + 1) % states.length;
    set(indexAtom, newIndex);
    set(overlayStateAtom, states[newIndex]);

    return states[newIndex];
  },
);

export const testableOverlayAtom = atom<OverlayState, string>(
  (get) => get(overlayStateAtom),
  (_get, set, value) => {
    const isTest = new URLSearchParams(window.location.search).get("uiTest");
    set(isTest != null ? testOverlayAtom : overlayAtom, value);
  },
);
