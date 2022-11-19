import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { overlayAtom, OverlayState } from "../services/overlayer";

export function useTestOverlay() {
  const [state, set] = useAtom(overlayAtom);
  const [index, setIndex] = useState(0);

  const setRandomState = (_: unknown) => {
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
    const newIndex = (index + 1) % states.length;
    setIndex(newIndex);
    set(states[newIndex]);
  };

  useEffect(() => {
    setRandomState({});
  }, []);

  return [state, setRandomState] as const;
}
