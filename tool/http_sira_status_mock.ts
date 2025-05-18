import { delay } from "jsr:@std/async/delay";
import { BeatsaverMap } from "../src/modules/beatsaver.ts";
import { Beatmap } from "../src/types/http_sira_status.ts";
import { MapInfo } from "../src/types/overlay.ts";
import { runOverlayServer, simulatePlaySession } from "./common.ts";
import { prng } from "./prng.ts";

if (import.meta.main) {
  main();
}

async function main() {
  await runOverlayServer({ port: 6557, handler: handleRequest });
}

async function handleRequest(socket: WebSocket, info: { beatmaps: BeatsaverMap[] }) {
  sendMenuEvent(socket, "hello");
  while (socket.readyState === socket.OPEN) {
    await sendActivity(socket, info);
  }
  console.log(`readyState is ${socket.readyState}, break.`);
}

async function sendActivity(socket: WebSocket, { beatmaps }: { beatmaps: BeatsaverMap[] }) {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0]!;
  console.log(`seed: ${seed}`);

  let currentMap: Beatmap | null = null;
  let songSpeedMultiplier = 1;
  const defaultPerformance = {
    currentSongTime: 0,
    relativeScore: 1,
    softFailed: false,
    energy: 1,
  };
  let performance = { ...defaultPerformance };

  for await (const event of simulatePlaySession({ beatmaps, prng: prng(seed) })) {
    if (isSocketClosed()) {
      return;
    }

    switch (event.type) {
      case "songStart": {
        currentMap = convertBeatmap(event.beatmap);
        songSpeedMultiplier = event.songSpeedMultiplier;
        performance = { ...defaultPerformance };
        await sendSongStart();
        break;
      }
      case "timeProgress": {
        const { seconds } = event;
        await progressTime(seconds);
        break;
      }
      case "score":
        performance.relativeScore = event.accuracy;
        sendPerformanceChange();
        break;
      case "pause":
        sendPauseResumeEvent("pause");
        break;
      case "resume":
        sendPauseResumeEvent("resume");
        break;
      case "softFailed":
        performance.energy = 0;
        sendPerformanceChange();
        break;
      case "menu":
        sendMenuEvent(socket, "menu");
        break;
    }
  }

  async function sendSongStart() {
    socket.send(JSON.stringify({
      event: "songStart",
      status: {
        beatmap: currentMap,
        game: {},
        mod: {},
        performance: {},
        playerSettings: {},
      },
    }));
    await delay(100);
    if (isSocketClosed()) {
      return;
    }
    sendPerformanceChange();
  }

  async function progressTime(seconds: number) {
    if (isPaused()) {
      await delay(seconds * 1000);
    } else {
      await sendSongCurrentTimeChanges(seconds);
    }
  }

  function isPaused() {
    return currentMap?.paused != null;
  }

  // Add seconds to currentSongTime, while sending events every seconds.
  async function sendSongCurrentTimeChanges(seconds: number) {
    const { currentSongTime } = performance;

    let remainingSeconds = seconds;
    const headFraction = (1 - (performance.currentSongTime % 1)) % 1;
    const headWaitSeconds = Math.min(seconds, headFraction);
    await delay(headWaitSeconds * 1000 / songSpeedMultiplier);
    remainingSeconds -= headWaitSeconds;

    const endTime = currentSongTime + seconds;
    while (remainingSeconds > 0) {
      if (isSocketClosed()) {
        return;
      }
      performance.currentSongTime = Math.round(endTime - remainingSeconds);
      sendPerformanceChange();

      await delay(Math.min(remainingSeconds, 1) * 1000 / songSpeedMultiplier);
      remainingSeconds = Math.max(0, remainingSeconds - 1);
    }

    performance.currentSongTime = endTime;
  }

  function sendPerformanceChange() {
    socket.send(JSON.stringify({
      event: "beatmapEvent",
      status: {
        performance: {
          ...performance,
          currentSongTime: Math.floor(performance.currentSongTime),
        },
      },
    }));
  }

  function sendPauseResumeEvent(name: "pause" | "resume") {
    if (currentMap) {
      currentMap.paused = name === "pause" ? Date.now() : null;
    }
    socket.send(JSON.stringify({
      event: name,
      status: {
        beatmap: currentMap,
        game: {},
        mod: {},
        playerSettings: {},
      },
    }));
  }

  function isSocketClosed() {
    return socket.readyState !== socket.OPEN;
  }
}

function convertBeatmap(beat: MapInfo) {
  const {
    artist,
    bpm,
    characteristic,
    coverUrl,
    difficulty,
    duration,
    hash,
    mapper,
    speed,
    subtitle,
    title,
  } = beat;
  return {
    songHash: hash,
    songAuthorName: artist,
    songBPM: bpm,
    songCover: coverUrl,
    songName: title,
    songSubName: subtitle,
    levelAuthorName: mapper,
    noteJumpSpeed: speed,
    characteristic,
    difficultyEnum: difficulty,
    length: (duration ?? 0) * 1000,
  } as Beatmap;
}

function sendMenuEvent(socket: WebSocket, name: "hello" | "menu") {
  socket.send(JSON.stringify({
    event: name,
    status: {
      mod: {},
      game: {},
      beatmap: null,
      performance: null,
      playerSettings: {},
    },
  }));
}
