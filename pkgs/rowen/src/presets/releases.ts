import dayjs from "dayjs";
import path from "path";
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
      sourceDir: string;
      sharedPath: string | null;
      keepReleases: number;
      releasesPath: string;
      state: {
        isCurrentUpdated: boolean;
        isReleaseDirCreated: boolean;
      };
    };
  }
}

export const releaseCtx: unique symbol = Symbol();

export const releases = {
  ctx: releaseCtx as typeof releaseCtx,
  /** Setup `releases` context, it can be access by `$.ctx(releases.ctx)` */
  beforeFetch: ({
    sourceDir = ".",
    keepReleases = 10,
    releasesPath = "./releases",
    enableShared = true,
  }: {
    /**
     * Deploying source dir path from workspace path on local
     *
     * Default to "."
     */
    sourceDir?: string;
    keepReleases?: number;
    releasesPath?: string;
    enableShared?: boolean;
  }) => {
    return async ($: PilotLight) => {
      const id = dayjs().format("YYYYMMDD-HHmmss-0SSS");
      const releasePath = path.join(releasesPath, id);

      const ctx: RowenContexts[typeof releaseCtx] = {
        sourceDir,
        keepReleases,
        releaseId: id,
        releasePath,
        sharedPath: enableShared ? "./shared" : null,
        currentPath: path.join("./current"),
        releasesPath,
        state: {
          isReleaseDirCreated: false,
          isCurrentUpdated: false,
        },
      };

      $.log(`└ releases: release id: ${id}`);
      $.ctx.set(releaseCtx, ctx);
    };
  },
  /** Create release directory and copy local files into release, and cleanup old releases */
  syncStep: () => {
    return async ($: PilotLight) => {
      const { workspace } = $.ctx(Rowen.ctx);
      const { releaseId, releasePath, sourceDir, keepReleases, sharedPath } =
        $.ctx(releaseCtx);
      const deployTo = $.envConfig.deployTo!;

      $.log(
        `└ deployStep(releases): Creating remote release on ${releasePath}...`
      );

      await $.remote`mkdir -p ${deployTo}`;

      await $.remote`mkdir -p ${releasePath}`({
        cwd: deployTo,
      });

      $.ctx(releaseCtx).state.isReleaseDirCreated = true;

      $.log(`└ deployStep(releases): Creating shared on ./shared`);

      if (sharedPath) {
        await $.remote`mkdir -p ${sharedPath}`({
          cwd: deployTo,
        });
      }

      $.ctx(releaseCtx).state.isReleaseDirCreated = true;

      await spin({
        spinner: {
          frames: trackSpin,
        },
        text: "└ deployStep(releases): Copying files...",
        silent: $.ctx(commonCtx).silent,
        completeTextFn: () => "└ deployStep(releases): Complete to copy file",
      })(() => {
        return $.copyToRemote(path.join(workspace, sourceDir), releasePath);
      });

      await $.remote`ln -sf ${releasePath} ./current`({
        cwd: deployTo,
      });

      $.ctx(releaseCtx).state.isCurrentUpdated = true;

      await $.remote`[ -f CURRENT_RELEASE ] && (cat ./CURRENT_RELEASE > ./PREVIOUS_RELEASE)`;
      await $.remote`echo "${releaseId}" > ./CURRENT_RELEASE`({
        cwd: deployTo,
      });

      await $.remote`(ls -rd ./releases/*|head -n ${keepReleases}; ls -d ./releases/*)|sort|uniq -u|xargs rm -rf`(
        {
          cwd: deployTo,
        }
      );
    };
  },
  caughtError: () => {
    return async ($: PilotLight) => {
      const {
        releasesPath,
        state: { isReleaseDirCreated, isCurrentUpdated },
      } = $.ctx(releaseCtx);

      $.log("└ caughtError(releases): Detect caught error, rollback release..");

      if (isCurrentUpdated) {
        const safeReleasesPath = normalizeTailSlash(releasesPath);
        await $.remote`ln -sf ${
          safeReleasesPath + "/" + "$(cat PREVIOUS_RELEASE)"
        } ./current`;
      }
    };
  },
};

const normalizeTailSlash = (str: string) => str.replace(/\/$/, "");
