import { remove } from "fs-extra";
import { commonCtx } from "../commonCtx";
import Rowen from "../Rowen";
import { spin } from "../utils";

export const cleanUpTask = async (rowen: Rowen) => {
  const ctx = rowen.ctx.get(commonCtx);

  await spin({
    spinner: { frames: ["💣", "🔥", "💥"] },
    silent: ctx.silent,
    text: "Cleanup workspace",
    completeTextFn: () => "deployStep(releases): Complete to copy file",
  })(async () => {
    const ctx = rowen.ctx.get(commonCtx);

    if (rowen.envConfig.keepWorkspace !== true) {
      await remove(ctx.workspace);
    }
  });
};
