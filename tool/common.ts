import { type BeatsaverMap } from "../src/modules/beatsaver.ts";
import { MapInfo } from "../src/types/overlay.ts";

type OverlayServerParameters = {
  port: number;
  handler: (
    socket: WebSocket,
    info: { beatmaps: BeatsaverMap[] },
  ) => Promise<void>;
};

export async function runOverlayServer({ port, handler }: OverlayServerParameters) {
  const beatmaps = await requestLatestBeatmaps();
  await Deno.serve(
    { port, onListen: () => console.log(`Preloaded map data. Listen on ${port}..`) },
    handleRequest,
  ).finished;

  function handleRequest(request: Request, info: Deno.ServeHandlerInfo) {
    const { socket, response } = Deno.upgradeWebSocket(request);
    socket.onopen = async () => {
      const { remoteAddr } = info;
      if (remoteAddr.transport === "tcp" || remoteAddr.transport === "udp") {
        const { hostname, port } = remoteAddr;
        console.log(`[${new Date().toISOString()}] open websocket from ${hostname}:${port}.`);
      } else {
        console.log(`[${new Date().toISOString()}] open ${remoteAddr.transport} websocket.`);
      }
      await handler(socket, { ...info, beatmaps });
    };
    return response;
  }
}

export function* simulatePlaySession(
  { beatmaps, prng }: { beatmaps: BeatsaverMap[]; prng: (max: number) => number },
) {
  let accuracy = 1;

  while (true) {
    const shuffled = shuffle(beatmaps, prng);
    for (const map of shuffled) {
      yield* session(map);

      yield { type: "menu" } as const;
      yield timeProgress(prng(1000) / 1000);
    }
  }

  function* session(map: BeatsaverMap) {
    const phases = shuffle([
      ...(([[], ["pause"], ["quit"]] as const)[prng(2)]!),
      (["softFail", "cuts"] as const)[prng(1)]!,
    ], prng);

    accuracy = 1;
    yield songStart(map);

    yield timeProgress((prng(2000) + 1000) / 1000);

    for (const phase of phases) {
      switch (phase) {
        case "pause":
          yield { type: "pause" } as const;
          yield timeProgress(prng(1000) / 1000 + 1);
          yield { type: "resume" } as const;
          break;
        case "quit":
          yield { type: "pause" } as const;
          yield timeProgress(prng(1000) / 1000 + 1);
          return;
        case "softFail":
          yield* scoreChanges();
          yield { type: "softFailed" } as const;
          yield* scoreChanges();
          break;
        case "cuts":
          yield* scoreChanges();
          break;
      }
    }
  }

  function songStart(map: BeatsaverMap) {
    const version = map.versions[0]!;
    const diff = version.diffs[prng(version.diffs.length - 1)]!;

    return {
      type: "songStart",
      beatmap: {
        hash: version.hash,
        speed: diff.njs,
        bpm: map.metadata.bpm,
        title: map.metadata.songName,
        subtitle: map.metadata.songSubName,
        artist: map.metadata.songAuthorName,
        mapper: map.metadata.levelAuthorName,
        coverUrl: version.coverURL,
        duration: map.metadata.duration,
        difficulty: diff.difficulty,
        characteristic: diff.characteristic,
      } as MapInfo,
      currentSongTime: prng(Math.max(0, map.metadata.duration - 10)),
      songSpeedMultiplier: 1 + (prng(400) - 200) / 1000,
    } as const;
  }

  function timeProgress(seconds: number) {
    return { type: "timeProgress", seconds } as const;
  }

  function scoreChange() {
    const newAccuracy = accuracy - 0.001;
    accuracy = Math.max(0, Math.min(newAccuracy, 1));
    return { type: "score", accuracy } as const;
  }

  function* scoreChanges() {
    for (let i = prng(20) + 5; i > 0; i--) {
      yield scoreChange();
      yield timeProgress(prng(500) / 1000);
    }
  }
}

export async function requestLatestBeatmaps() {
  const response = await fetch("https://beatsaver.com/api/search/text/0?sortOrder=Relevance");
  const json = await response.json();
  return json.docs as BeatsaverMap[];
}

function shuffle<T>(array: T[], prng: (max: number) => number): T[] {
  for (let index = array.length - 1; index > 0; index--) {
    const randomIndex = prng(index);
    [array[index], array[randomIndex]] = [array[randomIndex]!, array[index]!];
  }

  return array;
}
