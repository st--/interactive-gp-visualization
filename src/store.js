import { writable } from "svelte/store";
function createMinMaxStore(min, max, initial = null) {
  const { subscribe, set: orig_set, update } = writable(initial);

  return {
    subscribe,
    set: (x) => {
      if (x < min) x = min;
      if (x > max) x = max;
      orig_set(x);
    },
  };
}
export const x1 = createMinMaxStore(0, 6, 2.0);
export const x2 = createMinMaxStore(0, 6, 2.1);
export const y1 = createMinMaxStore(-3, 3, 0);
export const y2 = createMinMaxStore(-3, 3, 0);
export const vs = writable();
export const seed = writable(0.5);
