import { commonCtx } from "./commonCtx";
import { ExtendedRowenEvents, ExtendedRowenContexts } from "./index";
import { PilotLight } from "./PilotLight";
import Rowen from "./Rowen";

export type DeploymentError = {
  message: string;
  detail: Error | AggregateError | RemoteResult;
};

export type RowenContexts = {
  [commonCtx]: {
    env: string;
    branch: string;
    workspace: string;
    silent: boolean;
  };
} & ExtendedRowenContexts;

export type RowenEvents = {
  /** Raised before fetch, workspace is not initialized */
  beforeFetch: [PilotLight];
  afterFetch: [PilotLight];
  buildStep: [PilotLight];
  deployStep: [PilotLight];
  afterDeploy: [PilotLight];
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
  deployTo?: string;
  servers: string[];
  workspace?: string;
  ENV?: Record<string, string>;
};

export type RowenConfig = {
  default: CommonOption;
  envs: { [name: string]: DeployEnvOption };
  flows: (
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
