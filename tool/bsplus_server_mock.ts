import { BeatsaverMap } from "../src/modules/beatsaver.ts";
import { getRandomElement, runOverlayServer } from "./common.ts";
import { delay } from "./deps.ts";

if (import.meta.main) {
  main();
}

async function main() {
  await runOverlayServer({ port: 2947, handler: handleRequest });
}

async function handleRequest(socket: WebSocket, info: { beatmaps: BeatsaverMap[] }) {
  socket.send(
    `{ "_type": "handshake", "protocolVersion": 1, "gameVersion": "1.25.1", "playerName": "nanikit", "playerPlatformId": "76561198159100356" }`,
  );
  while (socket.readyState === socket.OPEN) {
    await sendActivity(socket, info);
  }
  console.log(`readyState is ${socket.readyState}, break.`);
}

async function sendActivity(socket: WebSocket, { beatmaps }: { beatmaps: BeatsaverMap[] }) {
  if (isSocketClosed()) {
    return;
  }

  socket.send(`{ "_type": "event", "_event": "gameState", "gameStateChanged": "Menu" }`);
  socket.send(`{ "_type": "event", "_event": "gameState", "gameStateChanged": "Playing" }`);
  socket.send(`{ "_type": "event", "_event": "resume", "resumeTime": 0.01756902 }`);
  socket.send(
    `{ "_type": "event", "_event": "score", "scoreEvent": { "time": 0.01756902, "score": 0, "accuracy": 1.0, "combo": 0, "missCount": 0, "currentHealth": 0.5 } }`,
  );
  const map = getRandomElement(beatmaps);
  const { diffs, hash, coverURL } = map.versions[0]!;
  const diff = getRandomElement(diffs);
  socket.send(JSON.stringify({
    _type: "event",
    _event: "mapInfo",
    mapInfoChanged: {
      level_id: `custom_level_${hash.toUpperCase()}${
        Math.random() >= 0.5 ? "_245de (NanaCat - Glorious Crown)" : ""
      }`,
      name: map.metadata.songName,
      sub_name: map.metadata.songSubName,
      artist: map.metadata.songAuthorName,
      mapper: map.metadata.levelAuthorName,
      characteristic: diff.characteristic,
      difficulty: diff.difficulty,
      duration: map.metadata.duration * 1000,
      time: 0.1,
      timeMultiplier: 1,
      BPM: map.metadata.bpm,
      PP: 0,
      BSRKey: map.id,
      coverRaw: coverURL,
    },
  }));

  for (let i = 0; i < 4; i++) {
    await delay(400);
    if (isSocketClosed()) {
      return;
    }
    socket.send(JSON.stringify({
      _type: "event",
      _event: "score",
      scoreEvent: {
        time: 0.01756902,
        score: 9210,
        accuracy: 0.9,
        combo: 0,
        missCount: 0,
        currentHealth: 0.5,
      },
    }));
  }

  await delay(400);
  if (isSocketClosed()) {
    return;
  }

  const result = Math.random();
  const willFail = result < 2 / 3;
  const isNoFail = result < 1 / 3;
  socket.send(JSON.stringify({
    _type: "event",
    _event: "score",
    scoreEvent: {
      time: 0.01756902,
      score: 19029,
      accuracy: isNoFail ? 0.45 : 0.9,
      combo: 4,
      missCount: 0,
      currentHealth: willFail ? 0 : 0.1,
    },
  }));

  socket.send(`{ "_event": "pause", "_type": "event", "pauseTime": 2.11 }`);
  await delay(2000);
  if (isSocketClosed()) {
    return;
  }

  socket.send(`{ "_type": "event", "_event": "gameState", "gameStateChanged": "Menu" }`);
  await delay(1000);

  function isSocketClosed() {
    return socket.readyState !== socket.OPEN;
  }
}
