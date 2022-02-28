import Rowen from "../Rowen";
import tmp from "tmp-promise";
import mkdirp from "mkdirp";
import { cloudSpin, spin } from "../utils";
import { commonCtx } from "../commonCtx";
import { PilotLight } from "../PilotLight";

export const fetchTask = async (rowen: Rowen, $: PilotLight) => {
  const { envConfig: envOption } = rowen;
  const ctx = $.ctx(commonCtx);

  rowen.log.log("fetch: Fetching repository to workspace...");

  // create workspace
  const workspace = await (rowen.envConfig.workspace
    ? mkdirp(rowen.envConfig.workspace, { mode: 0o755 })
    : (
        await tmp.dir({
          mode: 0o755,
          prefix: "rowen-",
          unsafeCleanup: true,
        })
      ).path);

  ctx.workspace = workspace!;
  rowen.log.log(`└ fetch: workspace created in ${workspace}`);

  const clone = await spin({
    spinner: { frames: cloudSpin },
    silent: ctx.silent,
    text: `└ fetch: fetching repository from ${envOption.repository!} branch ${
      ctx.branch
    }`,
  })(async () =>
    $.local.nothrow`git clone --depth=1 -b ${
      ctx.branch
    } ${envOption.repository!} ${ctx.workspace!}`({
      cwd: workspace,
    })
  );

  if (clone.error) {
    rowen.log.error("└ fetch: Failed to fetch repository", clone);
    throw new Error("fetch: Failed to fetch repository");
  }
};
