import Rowen from "../Rowen";
import { spin } from "../utils";

export const cleanUpTask = async (rowen: Rowen) => {
  await spin({
    spinner: { frames: ["💣", "🔥", "💥"] },
    text: "[Rowen] Cleanup workspace",
  })(async () => {
    await rowen.ctx.workspace?.cleanup();
  });
};
