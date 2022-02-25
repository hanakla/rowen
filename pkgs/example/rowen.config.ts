import Rowen, { RowenConfig, rowenReleases } from "rowen";

export default (rowen: Rowen): RowenConfig => {
  return {
    default: {
      deployTo: "~/tmp/rowen-test/",
      repository: "git@github.com:hanakla/rowen.git",
      keepWorkspace: false,
    },
    envs: {
      sandbox: {
        servers: ["hanakla@localhost"],
      },
      staging: {
        servers: [],
      },
      production: {
        servers: [],
      },
    },
    deploy: async (rowen) => {
      rowenReleases(rowen, { sourcePathOnLocal: "" });

      rowen.on.buildStep(async ($) => {
        $.remotePrefix += `eval '$(nodenv init -)';`;

        const a = await $.remote
          .nothrow`node -e "console.log(process.env.UNCHI_ENV)"`({
          env: { UNCHI_ENV: "toilet" },
        });
      });

      rowen.on.deployStep(async ($) => {});

      await rowen.deploy({ env: "sandbox" });
    },
  };
};
