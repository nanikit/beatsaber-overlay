import { requestLatestBeatmaps, simulatePlaySession } from "./common.ts";
import { prng } from "./prng.ts";

Deno.test("When simulating session with seed 0", async (test) => {
  const beatmaps = await cacheOrRequestLatestBeatmaps();
  const events = simulatePlaySession({ beatmaps, prng: prng() });

  await test.step("it should terminates", () => {
    for (const event of events) {
      console.log(event);
      if (event.type === "menu") {
        break;
      }
    }
  });
});

async function cacheOrRequestLatestBeatmaps() {
  const store = localStorage.getItem("beatmaps");
  if (store) {
    return JSON.parse(store);
  }

  const beatmaps = await requestLatestBeatmaps();
  localStorage.setItem("beatmaps", JSON.stringify(beatmaps));
  return beatmaps;
}
