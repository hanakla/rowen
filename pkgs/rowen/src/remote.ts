import { exec, ExecOptions } from "child_process";
import { RemoteResult } from "./types";
import streamToString from "stream-to-string";
import { quote } from "./utils";
import { processError } from "./errors";
import { boolean } from "yargs";

type LocalExecuter = {
  (options: ExecOptions): LocalExecuter;
  then<T1, T2>(
    fulfilled: (v: RemoteResult) => T1 | PromiseLike<T1>,
    rejected: (e: any) => T2 | PromiseLike<T2>
  ): PromiseLike<T1>;
};

type RemoteExecuter = {
  (options: {
    cwd?: string;
    env?: Record<string, string>;
    tty?: boolean;
  }): RemoteExecuter;
  then<T1, T2>(
    fullfiled: (v: RemoteResult[]) => T1 | PromiseLike<T1>,
    rejected: (e: RemoteResult[]) => T2 | PromiseLike<T2>
  ): void;
};
export class Remote {
  constructor(private pool: any) {}

  /** command prefix for remotes (not local) */
  public remotePrefix: string = "set -euo pipefail;";
  private remoteCwd: string | null = null;

  local = Object.assign(
    (template: TemplateStringsArray, ...subs: any[]): LocalExecuter => {
      let _opt: ExecOptions = {};

      const options = (opt: ExecOptions) => {
        _opt = opt;
        return execute;
      };

      const execute: LocalExecuter = Object.assign(options, {
        then: (fullfiled: (v: RemoteResult) => any, rejected: any) => {
          return new Promise<RemoteResult>((resolve, reject) => {
            const cmd = String.raw(template, ...subs.map((str) => quote(str)));
            const proc = exec(cmd, {
              ..._opt,
              env: { ...process.env, ..._opt.env },
            });
            const outStream = streamToString(proc.stdout!);
            const errStream = streamToString(proc.stderr!);

            proc.on("error", async (err) => {
              reject(
                processError("Failed to execute local command", {
                  code: proc.exitCode,
                  error: proc.exitCode !== 0,
                  stdout: await outStream,
                  stderr: await errStream,
                  cmd,
                  cwd: _opt.cwd ?? process.cwd(),
                  remote: null as any,
                } as RemoteResult)
              );
            });

            proc.on("exit", async (code, sig) => {
              (code === 0 ? resolve : reject)({
                code,
                error: code !== 0,
                stdout: await outStream,
                stderr: await errStream,
                cmd,
                cwd: _opt.cwd ?? process.cwd(),
                remote: null as any,
              } as RemoteResult);
            });
          }).then(fullfiled, rejected);
        },
      });

      return execute;
    },
    {
      nothrow: (...args: [TemplateStringsArray, ...any]) => {
        const exec = this.local(...args);
        const { then: run } = exec;
        exec.then = (f) =>
          new Promise<any>(async (res) => {
            await run(res, res);
          }).then(f);

        return exec;
      },
    }
  );

  remote = Object.assign(
    (tpl: string | TemplateStringsArray, ...subs: any[]): RemoteExecuter => {
      const cmd = Array.isArray(tpl)
        ? String.raw(
            tpl as TemplateStringsArray,
            ...subs.map((str) => quote(str))
          )
        : tpl;

      let _opt: { cwd?: string; env?: Record<string, string>; tty?: boolean } =
        {};
      const option = (opt: typeof _opt) => {
        _opt = opt;
        return execute;
      };

      const execute: RemoteExecuter = Object.assign(option, {
        then: async (
          resolve: (v: RemoteResult[]) => void,
          reject: (e: RemoteResult[]) => void
        ) => {
          let hasFailed = false;
          const results = await Promise.allSettled(
            this.pool.connections.map(async (con: any) => {
              try {
                const envs = Object.entries(_opt.env ?? {})
                  .map(([key, value]) => `${key}=${quote(value)}`)
                  .join(" ");

                const result = await con.run(
                  `${this.remotePrefix} ${envs} ${cmd}`,
                  {
                    cwd: this.remoteCwd,
                    ..._opt,
                  }
                );

                return {
                  remote: con.remote,
                  stdout: result.stdout,
                  stderr: result.stderr,
                  code: result.code ?? 0,
                  cmd: result.child.spawnargs,
                  error: false,
                } as RemoteResult;
              } catch (e: any) {
                hasFailed = true;
                const host = `${con.remote.user ? `${con.remote.user}@` : ""}${
                  con.remote.host
                }${con.remote.port ? `:${con.remote.port}` : ""}`;

                return processError(
                  `Failed to execute remote command on ${host}`,
                  {
                    remote: con.remote,
                    stdout: e.stdout,
                    stderr: e.stderr,
                    code: e.code,
                    cmd: e.cmd,
                    error: true,
                  } as RemoteResult
                );
              }
            })
          );

          const formatted = results.map((r) =>
            r.status === "fulfilled" ? r.value : r.reason
          );

          hasFailed
            ? reject(new (globalThis as any).AggregateError(formatted))
            : resolve(formatted);
        },
      });

      return execute;
    },
    {
      nothrow: (...args: [TemplateStringsArray, ...any]) => {
        const exec = this.remote(...args);
        const { then: run } = exec;
        exec.then = (f) =>
          new Promise<any>(async (res) => {
            await run(res, res);
          }).then(f);

        return exec;
      },
    }
  );

  async copyToRemote(
    local: string,
    remote: string,
    options?: { ignores?: string[]; rsync: string | string[] }
  ) {
    return await this.pool.copyToRemote(local, remote, options);
  }

  async copyFromRemote(
    remotePath: string,
    localPath: string,
    options?: { ignores?: string[]; rsync: string | string[] }
  ) {
    return await this.pool.copyFromRemote(remotePath, localPath, options);
  }

  /** set current directory for remotes */
  async remoteCd(path: string) {
    this.remoteCwd = path;
  }
}
