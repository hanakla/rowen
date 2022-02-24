export const on = <Events extends { [name: string]: any[] }>(): {
  _emit: <K extends keyof Events>(k: K, ...arg: Events[K]) => Promise<void>;
} & {
  [K in keyof Events]: (cb: (...args: Events[K]) => void) => void;
} => {
  const events: {
    [name in keyof Events]: Array<(...args: Events[keyof Events]) => void>;
  } = Object.create(null);

  const emit = async <T extends keyof Events>(event: T, ...args: Events[T]) => {
    return await Promise.all(
      (events[event] ?? []).map(async (cb) => (await cb(...args)) as any)
    );
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
