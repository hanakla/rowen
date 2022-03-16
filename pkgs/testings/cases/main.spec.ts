import Rowen, { rowenConfig } from "@hanakla/rowen";

describe("main", () => {
  it("Execute command on remote", async () => {
    const baseConfig = rowenConfig(() => ({
      default: {
        repository: "git@github.com:hanakla/rowen.git",
        deployTo: "rowen-tests",
      },
      envs: {
        production: {
          servers: ["runner@localhost", "runner@localhost"],
        },
      },
      flows: (rowen) => {
        rowen.on.beforeFetch(async () => {});
      },
    }));

    // Rowen.init({ configFile })

    const mock = jest
      .spyOn(Rowen, "loadFile")
      .mockImplementation(() => baseConfig);

    try {
      await Rowen.script({ env: "production" }, async ($) => {
        console.log(await $.remote`echo 'hi'`);
      });
    } catch (e) {
      console.dir((e as any).message);
      console.dir((e as any).errors);
      throw e;
    }

    mock.mockClear();
  });
});
