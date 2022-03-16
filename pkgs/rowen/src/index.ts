/** Extend this interface if custom events you want */
export interface ExtendedRowenEvents {}
export interface ExtendedRowenContexts {}
export interface ExtraRowenConfig {
  [name: string]: any;
}

export { type RowenConfig, type DeployEnvOption } from "./types";
export { default } from "./Rowen";
export { rowenConfig } from "./rowenConfig";

import { releases } from "./presets/releases";
export const presets = { releases };
