import dayjs from "dayjs";
import { posix } from "path";
import { commonCtx } from "../commonCtx";
import { PilotLight } from "../PilotLight";
import Rowen from "../Rowen";
import { RowenContexts } from "../types";
import { spin, trackSpin } from "../utils";

declare module "../" {
  export interface ExtendedRowenContexts {
    [releaseCtx]: {
      releaseId: string;
      releasePath: string;
      currentPath: string;
    };
  }
}

export const releaseCtx = Symbol();

export const releases = {
  ctx: releaseCtx,
  beforeFetch: () => async ($: PilotLight) => {
    const id = dayjs().format("YYYYMMDD-HHmmss-0SSS");
    const releasePath = posix.join("./releases", id);

    const ctx: RowenContexts[typeof releaseCtx] = {
      releaseId: id,
      releasePath,
      currentPath: posix.join("./current"),
    };

    $.log(`releases: release id: ${id}`);
    $.ctx.set(releaseCtx, ctx);
  },
  deployStep:
    ({
      sourceDir = ".",
    }: {
      /**
       * Deploying source dir path from workspace path on local
       *
       * Default to "."
       */
      sourceDir?: string;
    }) =>
    async ($: PilotLight) => {
      const { workspace } = $.ctx(Rowen.ctx);
      const { releaseId, releasePath } = $.ctx(releaseCtx);

      $.log(`deployStep(releases): Create remote release on ${releasePath}`);

      await $.remote`mkdir -p ${releasePath}`({
        cwd: $.envConfig.deployTo,
      });

      await spin({
        spinner: {
          frames: trackSpin,
        },
        text: "deployStep(releases): Copying files...",
        silent: $.ctx(commonCtx).silent,
        completeTextFn: () => "deployStep(releases): Complete to copy file",
      })(() => {
        return $.copyToRemote(posix.join(workspace, sourceDir), releasePath);
      });

      await $.remote`ln -sf ${releasePath} ./current`({
        cwd: $.envConfig.deployTo,
      });

      await $.remote`cat ${releaseId} > ./CURRENT_RELEASE`({
        cwd: $.envConfig.deployTo,
      });
    },
};
