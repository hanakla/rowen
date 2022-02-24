import { badge, errorBadge } from "./utils";

export class Log {
  constructor(private logLevel: "verb" | null = null) {}

  verb(...args: any) {
    if (this.logLevel === "verb") {
      console.log(badge, ...args);
    }
  }

  log(...args: any) {
    console.log(`🎈${badge}`, ...args);
  }

  error(...args: any) {
    console.error(`👿${errorBadge}`, ...args);
  }
}
