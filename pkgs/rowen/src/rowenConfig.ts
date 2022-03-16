import { RowenConfig } from "./types";
import Rowen from "./Rowen";

export const rowenConfig = (config: (r: Rowen) => RowenConfig) => config;
