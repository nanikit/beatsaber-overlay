import { Atom, atom } from "jotai";
import { withAtomEffect } from "jotai-effect";

export function atomWithPrevious<T>(currentAtom: Atom<T>) {
  const previousAtom = atom<T | null>(null);

  return withAtomEffect(
    atom((get) => get(currentAtom) ?? get(previousAtom)),
    (get, set) => {
      const current = get(currentAtom);
      const previous = get(previousAtom);
      if (current && current !== previous) {
        set(previousAtom, current);
      }
    },
  );
}
