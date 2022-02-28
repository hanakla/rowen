import { RowenConfig, releases } from "@hanakla/rowen";

export default async (): Promise<RowenConfig> => {
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
    flows: async (rowen, options) => {
      rowen.on.beforeFetch(releases.beforeFetch());

      rowen.on.buildStep(async ($) => {
        $.remotePrefix += `eval '$(nodenv init -)';`;

        const a = await $.local`node -e "console.log(process.env.UNCHI_ENV)"`({
          env: { UNCHI_ENV: "toilet" },
        });

        console.log(a.stdout);
      });

      rowen.on.deployStep(releases.deployStep({ sourceDir: "./build" }));
    },
  };
};
