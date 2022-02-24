import Rowen from "../Rowen";

export const buildTask = async (rowen: Rowen) => {
  await rowen.emit("build", rowen.$);
};
