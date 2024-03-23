import { type BeatsaverMap } from "../src/modules/beatsaver.ts";

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

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
      const { hostname, port } = info.remoteAddr;
      console.log(`[${new Date().toISOString()}] open websocket from ${hostname}:${port}.`);
      await handler(socket, { ...info, beatmaps });
    };
    return response;
  }
}

async function requestLatestBeatmaps() {
  const response = await fetch("https://beatsaver.com/api/search/text/0?sortOrder=Relevance");
  const json = await response.json();
  return json.docs as BeatsaverMap[];
}
