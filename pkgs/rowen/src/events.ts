export const on = <Events extends { [name: string]: any[] }>(
  keys: Array<keyof Events>
): { _emit: <K extends keyof Events>(k: K, ...arg: Events[K]) => void } & {
  [K in keyof Events]: (cb: (...args: Events[K]) => void) => void;
} => {
  const events = Object.create(null);

  return {
    _emit: <T extends keyof Events>(event: T, ...args: Events[T]) => {
      events[event].forEach((cb) => cb(...args));
    },
    ...keys.reduce(
      (m, k) =>
        Object.assign(m, {
          [k]: (cb) => {
            (events[k] ??= []).push(cb);
          },
        }),
      Object.create(null)
    ),
  };
};
