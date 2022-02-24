import { remove } from "fs-extra";
import Rowen from "../Rowen";
import { spin } from "../utils";

export const cleanUpTask = async (rowen: Rowen) => {
  await spin({
    spinner: { frames: ["💣", "🔥", "💥"] },
    text: "Cleanup workspace",
  })(async () => {
    if (rowen.envConfig.keepWorkspace !== true) {
      await remove(rowen.ctx.workspace!);
    }
  });
};
