import Rowen from "../Rowen";

export const rowenReleases = (rowen: Rowen, { sourcePathOnLocal }) => {
  rowen.on.build(async ($) => {
    const releasePath = `./releases/${rowen.ctx.releaseId}`;

    rowen.log.log(`Create remote release on ${releasePath}`);

    await $.remote`mkdir -p ${releasePath}`({
      cwd: rowen.envConfig.deployTo,
    });

    await $.remote`ln -sf ${releasePath} ./current`({
      cwd: rowen.envConfig.deployTo,
    });

    await $.remote`cat ${rowen.ctx.releaseId} > ./CURRENT_RELEASE`({
      cwd: rowen.envConfig.deployTo,
    });
  });
};
