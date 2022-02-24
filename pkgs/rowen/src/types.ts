import { ExtendedRowenEvents } from "./index";
import { Remote } from "./remote";
import Rowen from "./Rowen";

export type RowenEvents = {
  fetched: [Remote];
  build: [Remote];
  deploy: [Remote];
  afterDeploy: [Remote];
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
  deploy: (rowen: Rowen, options: { env: string }) => Promise<void>;
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
