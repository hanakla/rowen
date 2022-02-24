import { posix } from "path";
import { ConnectionPool } from "ssh-pool";
import dayjs from "dayjs";
import { on } from "./events";
import { Log } from "./log";
import { Remote } from "./remote";
import { cleanUpTask } from "./tasks/cleanup";
import { fetchTask } from "./tasks/fetch";
import {
  CommonOption,
  DeployEnvOption,
  RowenConfig,
  RowenEvents,
} from "./types";
import { clockSpin, spin } from "./utils";

export default class Rowen {
  static async init({
    env = null,
    verbose = false,
  }: {
    env?: string | null;
    verbose?: boolean;
  }) {
    const instance = new Rowen();
    instance.options = {
      verbose,
    };
    instance.log = new Log(verbose ? "verb" : null);

    const fn = require(posix.join(process.cwd(), "rowen.config"));
    const options: RowenConfig = await fn.default(instance);

    instance.env = env;
    instance._deployConfig = options;

    instance.$ = new Remote(instance._pool);

    return instance;
  }

  private _deployConfig: RowenConfig = null as any;
  private _pool: any;

  public options: { verbose: boolean } = { verbose: false };
  public env: string | null = null;
  public ctx: { workspace: string | null; releaseId: string | null } = {
    workspace: null,
    releaseId: null,
  };

  public $: Remote = null as any;
  public on = on<RowenEvents>();
  public log: Log = null as any;

  private constructor() {}

  public get deployConfig(): RowenConfig {
    return this._deployConfig;
  }

  public get envConfig(): DeployEnvOption & CommonOption {
    if (!this.env)
      throw new Error("Failed to get envOption (environment not set)");

    if (!this.deployConfig.envs[this.env])
      throw new Error(`Environment ${this.env} not defined in rowen.config`);

    return Object.assign(
      Object.create(null),
      this.deployConfig.default,
      this.deployConfig.envs[this.env]
    );
  }

  public get remotes() {
    return this.envConfig.servers;
  }

  public get envs() {
    return Object.keys(this.deployConfig.envs);
  }

  public emit<K extends keyof RowenEvents>(event: K, ...args: RowenEvents[K]) {
    return spin({
      spinner: { frames: clockSpin },
      text: `Starting \`${event}\` event`,
    })(async () => {
      await this.on._emit(event, ...args);
    });
  }

  public async deploy({ env }: { env: string }) {
    this.env = env;

    this.ctx.releaseId = dayjs().format("YYYYMMDD-HHmmss-SSS");
    this._pool ??= new ConnectionPool(this.envConfig.servers, {
      log: this.options.verbose ? console.log : null,
    });

    this.$ = new Remote(this._pool);

    this.log.log(`Starting deploy to ${env}`);

    try {
      await this.steps.fetchAndBuild();
      await this.steps.build();
      await this.steps.deploy();
    } catch (e) {
      if (e instanceof AggregateError) {
        this.log.error(`Failed to deploy. Caught error `, e.errors);
      } else {
        this.log.error(`Failed to deploy. Caught error `, e);
      }
    }
  }

  public readonly steps = {
    fetchAndBuild: async () => {
      await fetchTask(this);
      this.emit("fetched", this.$);
    },
    build: async () => {
      await this.emit("buildStep", this.$);
    },
    deploy: async () => {
      await this.emit("deployStep", this.$);
      await this.emit("afterDeploy", this.$);

      await cleanUpTask(this);
    },
  };
}
