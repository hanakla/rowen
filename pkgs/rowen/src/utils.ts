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

export const trackSpin = [
  "        ",
  "    🚚💨",
  "   🚚💨 ",
  "  🚚💨  ",
  " 🚚💨   ",
  "🚚💨    ",
  "💨      ",
  "       ",
];

export const badge = chalk.bold.rgb(255, 255, 255).bgRgb(0, 200, 220)`[Rowen]`;

export const errorBadge = chalk.bold
  .rgb(255, 255, 255)
  .bgRgb(230, 40, 40)`[Rowen]`;

export const spin = (
  opt: ora.Options & {
    persistText?: string;
    silent: boolean;
    completeTextFn?: () => string;
  }
) => {
  const o = ora({
    ...opt,
    text: opt.text
      ? `${opt.silent ? "[Rowen]" : badge} ${opt.text}`
      : undefined,
  });

  const start = () => {
    opt.silent ? console.log(o.text) : o.start();
  };

  const stop = ({ symbol }: { symbol: string }) => {
    opt.silent
      ? opt.completeTextFn
        ? console.log("[Rowen]", opt.completeTextFn?.())
        : null
      : o.stopAndPersist({ symbol, text: opt.completeTextFn?.() });
  };

  return async <T extends (...args: any[]) => Promise<any>>(
    fn: T
  ): Promise<ReturnType<T>> => {
    start();

    try {
      const result = await fn();
      stop({ symbol: "✅" });
      return result;
    } catch (e) {
      stop({ symbol: "❌" });
      throw e;
    }
  };
};
