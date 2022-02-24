import { Remote } from "../remote";
import Rowen from "../Rowen";
import tmp from "tmp-promise";
// import spinners from "cli-spinners";
import ora from "ora";
import { cloudSpin, spin } from "../utils";

export const fetchTask = async (rowen: Rowen) => {
  const { $, options } = rowen;

  if (options.verbose) {
    console.log("[Rowen] Starting fetching repository to workspace...");
  }

  // create workspace

  const workspace = await tmp.dir({
    mode: "0755",
    prefix: "rowen-",
    unsafeCleanup: true,
  });
  rowen.ctx.workspace = workspace;

  if (options.verbose) {
    console.log(`[Rowen] workspace created in ${workspace.path}`);
  }

  const a = await spin({
    spinner: { frames: cloudSpin },
    text: `[Rowen] fetching repository from ${rowen.envOption.repository!}`,
  })(async () =>
    $.local`git clone --depth=1 ${rowen.envOption.repository!}`({
      cwd: workspace.path,
    })
  );

  if (a.error) {
    console.error("[Rowen] Failed to fetch repository", a);
  }
};
