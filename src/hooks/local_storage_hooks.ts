import { atom } from 'jotai';

const atomWithLocalStorage = <T>(key: string, initialValue: T) => {
  const getInitialValue = () => {
    const item = localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item);
    }
    return initialValue;
  };

  const baseAtom = atom(getInitialValue());
  const derivedAtom = atom<T, T>(
    (get) => get(baseAtom),
    (_, set, update) => {
      set(baseAtom, update);
      localStorage.setItem(key, JSON.stringify(update));
    },
  );

  return derivedAtom;
};
