import { badge, errorBadge } from "./utils";

export class Log {
  constructor(private logLevel: "verb" | null = null) {}

  public silent: boolean = false;
  public context: string = "";

  private b(b: string, args: any[]) {
    return this.silent ? ["[Rowen]", ...args] : [b, ...args];
  }

  verb(...args: any) {
    if (this.logLevel === "verb") {
      console.log(...this.b(badge, args));
    }
  }

  log(...args: any) {
    console.log(...this.b(`🎈${badge}`, args));
  }

  error(...args: any) {
    console.error(...this.b(`👿${errorBadge}`, args));
  }
}
