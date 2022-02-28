export const on = <Events extends { [name: string]: any[] }>(): {
  _emit: <K extends keyof Events>(k: K, ...arg: Events[K]) => Promise<void>;
} & {
  [K in keyof Events]: (
    cb: (...args: Events[K]) => void
  ) => void | Promise<void>;
} => {
  const events: {
    [name in keyof Events]: Array<
      (...args: Events[keyof Events]) => void | Promise<void>
    >;
  } = Object.create(null);

  const emit = async <T extends keyof Events>(event: T, ...args: Events[T]) => {
    for (const cb of events[event] ?? []) {
      await cb(...args);
    }
  };

  return new Proxy(Object.create(null), {
    get(target, p) {
      if (p === "_emit") return emit;

      return (cb: any) => {
        (events[p as keyof Events] ??= []).push(cb);
      };
    },
    set() {
      return false;
    },
  });
};
