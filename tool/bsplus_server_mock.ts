import { delay } from "https://deno.land/std@0.165.0/async/delay.ts";
import { BeatsaverMap } from "../src/services/beatsaver.ts";

let beatmaps: BeatsaverMap[] = [];

main().catch(console.error);

async function main() {
  const ids = ["22dd9", "1e941", "27118"];
  beatmaps = (await Promise.all(
    ids.map(async (id) => {
      const response = await fetch(`https://api.beatsaver.com/maps/id/${id}`);
      return response.json();
    }),
  )) as BeatsaverMap[];

  const port = 2947;
  console.log(`Preloaded map data. Listen on ${port}..`);
  for await (const connection of Deno.listen({ port })) {
    handleHttp(connection);
  }
}

async function handleHttp(connection: Deno.Conn) {
  for await (const request of Deno.serveHttp(connection)) {
    handleRequest(request);
  }
}

async function handleRequest(request: Deno.RequestEvent) {
  const { socket, response } = Deno.upgradeWebSocket(request.request);
  socket.onopen = async () => {
    console.log(`[${new Date().toISOString()}] accepted websocket.`);
    socket.send(
      `{ "_type": "handshake", "protocolVersion": 1, "gameVersion": "1.25.1", "playerName": "nanikit", "playerPlatformId": "76561198159100356" }`,
    );
    while (socket.readyState === socket.OPEN) {
      await sendActivity(socket);
    }
    console.log(`readyState is ${socket.readyState}, break.`);
  };
  await request.respondWith(response);
}

async function sendActivity(socket: WebSocket) {
  if (socket.readyState !== socket.OPEN) {
    return;
  }

  socket.send(
    `{ "_type": "event", "_event": "gameState", "gameStateChanged": "Menu" }`,
  );

  socket.send(
    `{ "_type": "event", "_event": "gameState", "gameStateChanged": "Playing" }`,
  );
  socket.send(
    `{ "_type": "event", "_event": "resume", "resumeTime": 0.01756902 }`,
  );
  socket.send(
    `{ "_type": "event", "_event": "score", "scoreEvent": { "time": 0.01756902, "score": 0, "accuracy": 1.0, "combo": 0, "missCount": 0, "currentHealth": 0.5 } }`,
  );
  const map = beatmaps[Math.floor(Math.random() * beatmaps.length)];
  const { diffs, hash, coverURL } = map.versions[0];
  const diff = diffs[Math.floor(Math.random() * diffs.length)];
  socket.send(
    JSON.stringify({
      _type: "event",
      _event: "mapInfo",
      mapInfoChanged: {
        level_id: `custom_level_${hash.toUpperCase()}`,
        name: map.metadata.songName,
        sub_name: map.metadata.songSubName,
        artist: map.metadata.songAuthorName,
        mapper: map.metadata.levelAuthorName,
        characteristic: diff.characteristic,
        difficulty: diff.difficulty,
        duration: map.metadata.duration,
        BPM: map.metadata.bpm,
        PP: 0,
        BSRKey: map.id,
        coverRaw: coverURL,
      },
    }),
  );
  await delay(2000);

  if (socket.readyState !== socket.OPEN) {
    return;
  }

  socket.send(`{ "_event": "pause", "_type": "event", "pauseTime": 5.11 }`);
  await delay(2000);

  socket.send(
    `{ "_type": "event", "_event": "gameState", "gameStateChanged": "Menu" }`,
  );
  await delay(1000);
}
