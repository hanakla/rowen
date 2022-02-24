import { Remote } from "../remote";
import Rowen from "../Rowen";
import tmp from "tmp-promise";
import mkdirp from "mkdirp";
import { cloudSpin, spin } from "../utils";

export const fetchTask = async (rowen: Rowen) => {
  const { $, envConfig: envOption } = rowen;

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

  rowen.ctx.workspace = workspace!;
  rowen.log.log(`fetch: workspace created in ${workspace}`);

  const a = await spin({
    spinner: { frames: cloudSpin },
    text: `fetch: fetching repository from ${envOption.repository!}`,
  })(async () =>
    $.local.nothrow`git clone --depth=1 ${envOption.repository!} ${rowen.ctx
      .workspace!}`({
      cwd: workspace,
    })
  );

  if (a.error) {
    rowen.log.error("fetch: Failed to fetch repository", a);
    throw new Error("fetch: Failed to fetch repository");
  }
};
