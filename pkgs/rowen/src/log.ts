export class Log {
  constructor(private logLevel: "verb" | null = null) {}

  verb(...args: any) {
    if (this.logLevel === "verb") {
      console.log(`[Rowen]`, ...args);
    }
  }

  log(...args: any) {
    console.log("🎈[Rowen]", ...args);
  }

  error(...args: any) {
    console.error("👿[Rowen]", ...args);
  }
}
