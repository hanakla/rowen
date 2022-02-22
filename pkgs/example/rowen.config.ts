import Rowen, { RowenConfig } from "rowen/src";

export default (rowen: Rowen): RowenConfig => ({
  default: {
    servers: [],
    deployTo: "~/deploys/",
    repository: "",
  },
  envs: {
    sandbox: {
      servers: ["example"],
      deployTo: "~/",
    },
    staging: {
      servers: ["example"],
      deployTo: "~/",
    },
    production: {
      servers: ["example"],
      deployTo: "~/",
    },
  },
  //   deploy: (rowen) => {},
});
