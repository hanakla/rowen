import ora from "ora";
import chalk from "chalk";

// SEE: https://github.com/google/zx/blob/main/index.mjs#L316
export const quote = (str: string) => {
  if (/^[a-z0-9/_.-]+$/i.test(str) || str === "") {
    return str;
  }

  return (
    `$'` +
    str
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\f/g, "\\f")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t")
      .replace(/\v/g, "\\v")
      .replace(/\0/g, "\\0") +
    `'`
  );
};

export const clockSpin = [
  "🕛 ",
  "🕐 ",
  "🕑 ",
  "🕒 ",
  "🕓 ",
  "🕔 ",
  "🕕 ",
  "🕖 ",
  "🕗 ",
  "🕘 ",
  "🕙 ",
  "🕚 ",
];

export const cloudSpin = [
  "🌧 ",
  "🌨 ",
  "🌧 ",
  "🌨 ",
  "🌧 ",
  "🌨 ",
  "⛈ ",
  "🌨 ",
  "🌧 ",
  "🌨 ",
];

export const badge = chalk.bold.rgb(255, 255, 255).bgRgb(0, 200, 220)`[Rowen]`;

export const errorBadge = chalk.bold
  .rgb(255, 255, 255)
  .bgRgb(230, 40, 40)`[Rowen]`;

export const spin = (opt: ora.Options & { persistText?: string }) => {
  const o = ora({
    ...opt,
    text: opt.text ? `${badge} ${opt.text}` : undefined,
  });
  return async <T extends (...args: any[]) => Promise<any>>(
    fn: T
  ): Promise<ReturnType<T>> => {
    o.start();

    try {
      const result = await fn();
      o.stopAndPersist({ symbol: "✅" });
      return result;
    } catch (e) {
      o.stopAndPersist({ symbol: "❌" });
      throw e;
    }
  };
};
