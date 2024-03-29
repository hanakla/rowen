export const on = <Events extends { [name: string]: any[] }>(): {
  _emit: <K extends keyof Events>(k: K, ...arg: Events[K]) => Promise<void>;
} & {
  [K in keyof Events]: {
    (cb: (...args: Events[K]) => void): void | Promise<void>;
    has: (cb: (...args: any) => void | Promise<void>) => boolean;
  };
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

  const register = (k: keyof Events, cb: any) => {
    (events[k] ??= []).push(cb);
  };

  const has = (k: keyof Events, cb: any) => {
    return (events[k] ?? []).includes(cb);
  };

  return new Proxy(Object.create(null), {
    get(target, p) {
      if (p === "_emit") return emit;

      return Object.assign(register.bind(null, p as keyof Events), {
        has: has.bind(null, p as keyof Events),
      });
    },
    set() {
      return false;
    },
  });
};
