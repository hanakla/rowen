import { commonCtx } from "./commonCtx";
import {
  ExtendedRowenEvents,
  ExtendedRowenContexts,
  ExtraRowenConfig,
} from "./index";
import { PilotLight } from "./PilotLight";
import Rowen from "./Rowen";

export type DeploymentError = {
  message: string;
  detail: Error | AggregateError | RemoteResult;
};

export type RowenContexts = {
  [commonCtx]: {
    silent: boolean;
  } & {
    mode: "deploy";
    deployGitRef: string;
    workspace: string;
  };
  // | {
  //     mode: "rollback";
  //     env: string;
  //   }
} & ExtendedRowenContexts;

export type RowenEvents = {
  /** Raised before fetch, workspace is not initialized */
  beforeFetch: [PilotLight];
  afterFetch: [PilotLight];
  buildStep: [PilotLight];
  syncStep: [PilotLight];
  afterSync: [PilotLight];
  caughtError: [DeploymentError];
  [name: string]: any;
} & ExtendedRowenEvents;

export type CommonOption = {
  deployTo?: string;
  repository: string;
  workspace?: string;
  keepWorkspace?: boolean;
};

export type DeployEnvOption = {
  servers: string[];
  deployTo?: string;
  workspace?: string;
  ENV?: Record<string, string>;
};

export type RowenConfig = {
  default: CommonOption;
  envs: { [name: string]: DeployEnvOption };
  extra?: ExtraRowenConfig;
  flows?: (
    rowen: Rowen,
    options: { env: string; branch: string }
  ) => Promise<void>;
};

export type RemoteResult = {
  remote: any;
  error: boolean;
  stdout: string;
  stderr: string;
  code: number;
  cwd: string;
  cmd?: string;
};
