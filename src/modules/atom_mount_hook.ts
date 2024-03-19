export const mount = Symbol("mount");
export const unmount = Symbol("unmount");

export type Mount = typeof mount | typeof unmount;

export function onMount(set: (value: Mount) => void) {
  set(mount);
  return () => set(unmount);
}
