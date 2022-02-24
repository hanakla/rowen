import { RemoteResult } from "./types";

export const processError = (msg: string, result: RemoteResult) => {
  return Object.assign(new Error(msg), { result });
};
