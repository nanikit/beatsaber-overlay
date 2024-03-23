import { uniformIntDistribution, xoroshiro128plus } from "npm:pure-rand";

export function prng(seed?: number) {
  const s = seed ?? crypto.getRandomValues(new Uint32Array(1))[0]!;
  let rng = xoroshiro128plus(s);

  return (max: number) => {
    const [value, next] = uniformIntDistribution(0, max, rng);
    rng = next;
    return value;
  };
}
