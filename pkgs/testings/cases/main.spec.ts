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
          servers: ["user@localhost"],
        },
      },
      flows: (rowen) => {
        rowen.on.beforeFetch(async () => {});
      },
    }));

    // Rowen.init({ configFile })

    const mock = jest
      .spyOn(Rowen, "loadFile")
      .mockImplementation(async () => baseConfig);

    await Rowen.script({ env: "production" }, async ($) => {
      await $.remote`echo 'hi'`;
    });

    mock.mockClear();
  });
});
