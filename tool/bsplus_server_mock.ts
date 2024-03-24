import { MapInfo } from "../src/features/overlay/types.ts";
import { BeatsaverMap } from "../src/modules/beatsaver.ts";
import { runOverlayServer, simulatePlaySession } from "./common.ts";
import { delay } from "./deps.ts";
import { prng } from "./prng.ts";

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
  const seed = crypto.getRandomValues(new Uint32Array(1))[0]!;
  console.log(`seed: ${seed}`);

  let songSpeedMultiplier = 1;
  let currentSongTime = 0;
  let accuracy = 1;
  let softFailed = false;

  for await (const event of simulatePlaySession({ beatmaps, prng: prng(seed) })) {
    if (isSocketClosed()) {
      return;
    }

    switch (event.type) {
      case "songStart":
        songSpeedMultiplier = event.songSpeedMultiplier;
        currentSongTime = event.currentSongTime;
        softFailed = false;
        socket.send(`{ "_type": "event", "_event": "gameState", "gameStateChanged": "Playing" }`);
        sendSongStart(event.beatmap);
        sendScore();
        break;
      case "timeProgress":
        await delay(event.seconds * 1000);
        currentSongTime += event.seconds;
        break;
      case "score":
        accuracy = event.accuracy;
        sendScore();
        break;
      case "pause":
        socket.send(`{ "_event": "pause", "_type": "event", "pauseTime": ${currentSongTime} }`);
        break;
      case "resume":
        socket.send(`{ "_type": "event", "_event": "resume", "resumeTime": ${currentSongTime} }`);
        break;
      case "softFailed":
        softFailed = true;
        sendScore();
        break;
      case "menu":
        socket.send(`{ "_type": "event", "_event": "gameState", "gameStateChanged": "Menu" }`);
        break;
    }
  }

  function sendSongStart(map: MapInfo) {
    socket.send(JSON.stringify({
      _type: "event",
      _event: "mapInfo",
      mapInfoChanged: {
        level_id: `custom_level_${map.hash.toUpperCase()}${
          Math.random() >= 0.5 ? "_245de (NanaCat - Glorious Crown)" : ""
        }`,
        name: map.title,
        sub_name: map.subtitle,
        artist: map.artist,
        mapper: map.mapper,
        characteristic: map.characteristic,
        difficulty: map.difficulty,
        duration: (map.duration ?? 0) * 1000,
        time: currentSongTime,
        timeMultiplier: songSpeedMultiplier,
        BPM: map.bpm,
        BSRKey: map.key,
        coverRaw: map.coverUrl,
      },
    }));
  }

  function sendScore() {
    socket.send(JSON.stringify({
      _type: "event",
      _event: "score",
      scoreEvent: {
        accuracy: accuracy * (softFailed ? 0.5 : 1),
        currentHealth: softFailed ? 0 : 0.1,
      },
    }));
  }

  function isSocketClosed() {
    return socket.readyState !== socket.OPEN;
  }
}
