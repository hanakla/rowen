import { spawn } from "child_process";
import { RemoteResult } from ".";

export class Remote {
  constructor(private pool: any) {}

  public prefix: string = "set -euo pipefail;";
  private cwd: string | null;

  async local(template: TemplateStringsArray, ...subs: any[]) {
    return new Promise((resolve) => {
      const proc = spawn(String.raw(template, ...subs), {});

      proc.on("exit", (code, sig) => {
        resolve({
          error: code !== 0,
          stdout: proc.stdout,
        } as RemoteResult);
      });
    });
  }

  async remote(command: string);
  async remote(template: TemplateStringsArray, ...subs: any);
  async remote(
    tpl: string | TemplateStringsArray,
    ...subs: any[]
  ): Promise<RemoteResult[]> {
    const cmd = Array.isArray(tpl)
      ? String.raw(tpl as TemplateStringsArray, ...subs)
      : tpl;

    const results = await Promise.allSettled(
      this.pool.connections.map(async (con) => {
        try {
          const result = await con.run(`${this.prefix}: ""} ${cmd}`, {
            cwd: this.cwd,
          });
          return {
            remote: con.remote,
            stdout: result.stdout,
            stderr: result.stderr,
            code: result.code ?? 0,
            cmd: result.child.spawnargs,
            error: false,
          } as RemoteResult;
        } catch (e) {
          return {
            remote: con.remote,
            stdout: e.stdout,
            stderr: e.stderr,
            code: e.code,
            cmd: e.cmd,
            error: true,
          } as RemoteResult;
        }
      })
    );

    return results.map((r) => (r.status === "fulfilled" ? r.value : r.reason));
  }

  async cd(path: string) {
    this.cwd = path;
    // await this.pool.run(`cd ${path}`);
  }
}
