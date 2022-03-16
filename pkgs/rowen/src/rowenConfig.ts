import { RowenConfig } from "./types";

type RowenConfigFn =
  | ((config: (rowen: RowenConfig) => void) => RowenConfig)
  | ((config: (rowen: Promise<RowenConfig>) => void) => Promise<RowenConfig>);

export const rowenConfig: RowenConfigFn = (config: any) => config();
