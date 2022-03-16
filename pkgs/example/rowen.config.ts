import path from "path";
import { presets, rowenConfig } from "@hanakla/rowen";

export default rowenConfig((): Promise<RowenConfig> => {
  return {
    default: {
      deployTo: "/home/hanakla/rowen-test",
      repository: "git@github.com:hanakla/rowen.git",
      keepWorkspace: false,
    },
    envs: {
      sandbox: {
        servers: ["hanakla@localhost"],
        ENV: {
          NODE_ENV: "production",
        },
      },
      staging: {
        servers: [],
        ENV: {
          NODE_ENV: "production",
        },
      },
      production: {
        servers: [],
        ENV: {
          NODE_ENV: "production",
        },
      },
    },
    flows: async (rowen) => {
      rowen.on.caughtError(releases.caughtError());

      rowen.on.beforeFetch(
        releases.beforeFetch({
          sourceDir: "./pkgs/rowen",
          keepReleases: 2,
        })
      );

      rowen.on.buildStep(async ($) => {
        // $.remotePrefix += `eval '$(nodenv init -)';`;
        $.localCd(path.join($.workspace, "pkgs/rowen"));

        await $.local`ls -a`;
        await $.local`yarn install`;
        await $.local`yarn build`;
      });

      rowen.on.syncStep(releases.syncStep());

      rowen.on["releases:rollback-symlink-updated"](async ($) => {});
    },
  };
};
