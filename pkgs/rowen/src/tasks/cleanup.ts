import { remove } from "fs-extra";
import { commonCtx } from "../commonCtx";
import Rowen from "../Rowen";
import { spin } from "../utils";

export const cleanUpTask = async (rowen: Rowen) => {
  const ctx = rowen.ctx.get(commonCtx);
  if (ctx.mode !== "deploy") throw new Error("Unexpected mode on fetchTask");

  await spin({
    spinner: { frames: ["💣", "🔥", "💥"] },
    silent: ctx.silent,
    text: "└ Cleanup workspace",
  })(async () => {
    if (rowen.envConfig.keepWorkspace !== true && ctx.workspace) {
      await remove(ctx.workspace);
    }
  });
};
