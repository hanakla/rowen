import { ExtendedRowenEvents } from "./index";
import { Remote } from "./remote";

export type RowenEvents = {
  fetched: [Remote];
  built: [Remote];
  [name: string]: any;
} & ExtendedRowenEvents;

export type DeployEnvOption = {
  deployTo?: string;
  repository?: string;
  servers: string[];
};

export type RowenConfig = {
  default: {
    deployTo?: string;
    repository: string;
  };
  envs: { [name: string]: DeployEnvOption };
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
