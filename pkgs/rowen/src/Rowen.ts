import { posix } from "path/posix";
import { ConnectionPool } from "ssh-pool";
import { RowenConfig, RowenEvents } from ".";
import { on } from "./events";
import { Remote } from "./remote";

export default class Rowen {
  static async init({
    env,
    verbose = false,
  }: {
    env: string;
    verbose: boolean;
  }) {
    const instance = new Rowen();

    const fn = require(posix.join(process.cwd(), "rowen.config"));
    const options: RowenConfig = fn.default(instance);
    const envOption = options.envs[env];

    if (!envOption) {
      throw new Error(`Environment ${env} not defined in rowen.config`);
    }

    instance.pool = new ConnectionPool(envOption.servers, {
      log: verbose ? console.log : null,
    });
    instance.$ = new Remote(instance.pool);

    return instance;
  }

  private pool: any;
  public $: Remote;
  public on = on<RowenEvents>(["fetched"]);

  public deploy() {
    // fetch
    //
    this.on._emit("fetched", this.$);
  }
}
