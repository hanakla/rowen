import Rowen, { RowenConfig } from "rowen/src";

export default (rowen: Rowen): RowenConfig => {
  //   rowenDeploy(rowen);

  return {
    default: {
      deployTo: "~/tmp/rowen-test/",
      repository: "git@github.com:hanakla/rowen.git",
    },
    envs: {
      sandbox: {
        servers: [],
      },
      staging: {
        servers: [],
      },
      production: {
        servers: [],
      },
    },
    //   deploy: (rowen) => {},
  };
};
