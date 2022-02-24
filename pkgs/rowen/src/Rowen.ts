import { posix } from "path/posix";
import { ConnectionPool } from "ssh-pool";
import { DirectoryResult } from "tmp-promise";
import { on } from "./events";
import { Log } from "./log";
import { Remote } from "./remote";
import { cleanUpTask } from "./tasks/cleanup";
import { fetchTask } from "./tasks/fetch";
import { DeployEnvOption, RowenConfig, RowenEvents } from "./types";
import { clockSpin, spin } from "./utils";

export default class Rowen {
  static async init({
    env,
    verbose = false,
  }: {
    env: string;
    verbose: boolean;
  }) {
    const instance = new Rowen();
    instance.options = {
      verbose,
    };
    instance.log = new Log(verbose ? "verb" : null);

    const fn = require(posix.join(process.cwd(), "rowen.config"));
    const options: RowenConfig = fn.default(instance);
    const envOption = options.envs[env];

    if (!envOption) {
      throw new Error(`Environment ${env} not defined in rowen.config`);
    }

    instance.env = env;
    instance.rowenConfig = options;
    instance.pool = new ConnectionPool(envOption.servers, {
      log: verbose ? console.log : null,
    });
    instance.$ = new Remote(instance.pool);

    return instance;
  }

  private env: string = "";
  private rowenConfig: RowenConfig;
  private pool: any;

  public $: Remote = null as any;
  public on = on<RowenEvents>();
  public log: Log = null as any;
  public options: { verbose: boolean } = { verbose: false };
  public ctx: { workspace: DirectoryResult | null } = { workspace: null };

  private constructor() {}

  public get envOption(): DeployEnvOption {
    return Object.assign(
      Object.create(null),
      this.rowenConfig.default,
      this.rowenConfig.envs[this.env]
    );
  }

  public get remotes() {
    return this.envOption.servers;
  }

  public emit<K extends keyof RowenEvents>(event: K, ...args: RowenEvents[K]) {
    spin({
      spinner: { frames: clockSpin },
      text: `Starting \`${event}\` event`,
    })(async () => {
      await this.on._emit(event, ...args);
    });
  }

  public readonly steps = {
    fetchAndBuild: async () => {
      await fetchTask(this);

      this.log.log("Starting `fetched` events");
      await this.on._emit("fetched", this.$);
    },
    // build: async () => {
    //   this.log.log("Starting `fetched` events");
    //   await this.on._emit("");
    // },
    deploy: async () => {
      try {
        this.on._emit("deploy");
        await cleanUpTask(this);
      } catch (e) {
        this.log.error(`Failed to deploy. Caught error `, e);
      }
    },
  };
}
