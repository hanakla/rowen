import { posix } from "path";
import { ConnectionPool } from "ssh-pool";
import { on } from "./events";
import { Log } from "./log";
import { PilotLight } from "./PilotLight";
import { cleanUpTask } from "./tasks/cleanup";
import { fetchTask } from "./tasks/fetch";
import {
  CommonOption,
  DeployEnvOption,
  RowenConfig,
  RowenContexts,
  RowenEvents,
} from "./types";
import { clockSpin, spin } from "./utils";
import { commonCtx } from "./commonCtx";
import { ExtraRowenConfig } from "./index";

export default class Rowen {
  static ctx: typeof commonCtx = commonCtx;

  static async loadFile(path: string) {
    const fn = require(path);
    return (await fn.default()) as RowenConfig;
  }

  static async init({
    verbose = false,
    configFile = posix.join(process.cwd(), "rowen.config"),
  }: {
    verbose?: boolean;
    configFile?: string;
  }) {
    const instance = new Rowen();
    instance.options = {
      verbose,
    };
    instance.log = new Log(verbose ? "verb" : null);

    const options = await this.loadFile(configFile);
    instance._deployConfig = options;

    return instance;
  }

  static async script(
    {
      env,
      verbose = false,
      configFile = posix.join(process.cwd(), "rowen.config"),
    }: {
      env: string;
      verbose?: boolean;
      configFile?: string;
    },
    proc: ($: PilotLight, rowen: Rowen) => Promise<void> | void
  ) {
    const instance = await this.init({ configFile, verbose });

    instance.env = env;
    instance.log.silent = !verbose;
    instance.sshPool ??= new ConnectionPool(instance.envConfig.servers, {
      log: instance.options.verbose ? console.log : null,
    });

    instance.$ = new PilotLight(instance, instance.sshPool);
    instance.$.localCd(process.cwd());

    await proc(instance.$, instance);
  }

  private _deployConfig: RowenConfig = null as any;
  private sshPool: any;
  private $: PilotLight = null as any;

  public options: { verbose: boolean } = { verbose: false };
  public env: string | null = null;
  public branch: string | null = null;
  public ctx: {
    set<K extends keyof RowenContexts>(k: K, value: RowenContexts[K]): void;
    get<K extends keyof RowenContexts>(k: K): RowenContexts[K];
  } = new Map();

  public on = on<RowenEvents>();
  public log: Log = null as any;

  private constructor() {}

  public get deployConfig(): RowenConfig {
    return this._deployConfig;
  }

  public get extraConfig(): ExtraRowenConfig {
    return this.deployConfig.extra ?? {};
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
      silent: this.ctx.get(commonCtx)?.silent,
      text: `Emit \`${event}\` event`,
      completeTextFn: () => `└ Finish \`${event}\` events`,
    })(async () => {
      await this.on._emit(event, ...args);
    });
  }

  // public async rollback({ env, silent }: { env: string; silent?: boolean }) {
  //   this.env = env;

  //   this.sshPool ??= new ConnectionPool(this.envConfig.servers, {
  //     log: this.options.verbose ? console.log : null,
  //   });

  //   this.$ = new PilotLight(this, this.sshPool);
  //   this.log.silent = !!silent;

  //   this.ctx.set(Rowen.ctx, {
  //     mode: "rollback",
  //     env,
  //     silent: !!silent,
  //   });

  //   this.emit("rollback", this.$);
  // }

  public async deploy({
    env,
    deployRef,
    silent = true,
  }: {
    env: string;
    deployRef: string;
    silent?: boolean;
  }) {
    if (!deployRef) {
      this.log.error("Specify `deployRef` required in Rowen.deploy");
      return;
    }

    this.env = env;

    this.sshPool ??= new ConnectionPool(this.envConfig.servers, {
      log: this.options.verbose ? console.log : null,
    });

    this.$ = new PilotLight(this, this.sshPool);
    this.log.silent = !!silent;

    this.ctx.set(Rowen.ctx, {
      mode: "deploy",
      env,
      deployGitRef: deployRef,
      silent,
      workspace: null!,
    });

    this.log.log(`Starting deploy to ${env}`);

    try {
      await this.steps.fetch();
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
    fetch: async () => {
      await this.emit("beforeFetch", this.$);
      await fetchTask(this, this.$);
      await this.emit("afterFetch", this.$);
    },
    build: async () => {
      await this.emit("buildStep", this.$);
    },
    deploy: async () => {
      await this.emit("syncStep", this.$);
      await this.emit("afterSync", this.$);

      await cleanUpTask(this);
    },
  };
}
