import { Remote } from "./remote";

export type DeployEnv = {
  deployTo: string;
  repository?: string;
  servers: string[];
};

export type RowenConfig = {
  default: DeployEnv;
  envs: { [name: string]: DeployEnv };
};

export type RemoteResult = {
  remote: any;
  error: boolean;
  stdout: string;
  stderr: string;
  code: number;
  cmd?: string;
};

export type RowenEvents = {
  fetched: [Remote];
};

export { default } from "./Rowen";
