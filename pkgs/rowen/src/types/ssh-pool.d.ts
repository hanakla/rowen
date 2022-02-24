declare module "ssh-pool" {
  export const ConnectionPool: any;

  export interface Connection {
    new (options: {
      remote: string | { user: string; host: string; port: number };
    }): Connection;

    run(
      command: string,
      options?: { tty?: string; cwd?: string }
    ): Promise<any>;

    copy(
      src: string,
      dest: string,
      options: {
        direction?: "remoteToLocal";
        ignores: string[];
        rsync: string | string[];
      }
    ): Promise<any>;
  }
}
